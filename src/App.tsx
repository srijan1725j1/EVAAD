import React, { useState, useEffect } from 'react';
import { Debate, Argument, Author } from './types';
import {
  getStoredDebates,
  saveStoredDebates,
  getStoredArguments,
  saveStoredArguments,
  getStoredUserVotes,
  saveStoredUserVotes,
  getStoredUserArgLikes,
  saveStoredUserArgLikes,
  getStoredUserDebateLikes,
  saveStoredUserDebateLikes,
} from './utils/storage';
import { getCurrentAuthor, rerollAuthor } from './utils/anonymous';
import { TopicCard } from './components/TopicCard';
import { DebateChatView } from './components/DebateChatView';
import { CreateDebateModal } from './components/CreateDebateModal';
import { Plus, Search, RefreshCw } from 'lucide-react';

export default function App() {
  const [debates, setDebates] = useState<Debate[]>(() => getStoredDebates());
  const [argumentsList, setArgumentsList] = useState<Argument[]>(() => getStoredArguments());
  const [userVotes, setUserVotes] = useState<Record<string, 'for' | 'against'>>(() =>
    getStoredUserVotes()
  );
  const [userArgLikes, setUserArgLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserArgLikes()
  );
  const [userDebateLikes, setUserDebateLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserDebateLikes()
  );
  const [currentAuthor, setCurrentAuthor] = useState<Author>(() => getCurrentAuthor());
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    saveStoredDebates(debates);
  }, [debates]);

  useEffect(() => {
    saveStoredArguments(argumentsList);
  }, [argumentsList]);

  useEffect(() => {
    saveStoredUserVotes(userVotes);
  }, [userVotes]);

  useEffect(() => {
    saveStoredUserArgLikes(userArgLikes);
  }, [userArgLikes]);

  useEffect(() => {
    saveStoredUserDebateLikes(userDebateLikes);
  }, [userDebateLikes]);

  const totalArgumentsCount = argumentsList.length;

  const handleSelectDebate = (debate: Debate) => {
    setDebates((prev) =>
      prev.map((d) => (d.id === debate.id ? { ...d, views: d.views + 1 } : d))
    );
    setSelectedDebate({ ...debate, views: debate.views + 1 });
  };

  const handleVote = (side: 'for' | 'against') => {
    if (!selectedDebate) return;
    const previousVote = userVotes[selectedDebate.id];
    if (previousVote === side) return;

    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDebate.id) return d;
        let forV = d.forVotes;
        let againstV = d.againstVotes;
        if (previousVote === 'for') forV = Math.max(0, forV - 1);
        if (previousVote === 'against') againstV = Math.max(0, againstV - 1);
        if (side === 'for') forV += 1;
        if (side === 'against') againstV += 1;
        return { ...d, forVotes: forV, againstVotes: againstV };
      })
    );

    setSelectedDebate((prev) => {
      if (!prev) return null;
      let forV = prev.forVotes;
      let againstV = prev.againstVotes;
      if (previousVote === 'for') forV = Math.max(0, forV - 1);
      if (previousVote === 'against') againstV = Math.max(0, againstV - 1);
      if (side === 'for') forV += 1;
      if (side === 'against') againstV += 1;
      return { ...prev, forVotes: forV, againstVotes: againstV };
    });

    setUserVotes((prev) => ({ ...prev, [selectedDebate.id]: side }));
  };

  // Like a debate (Twitter-style)
  const handleToggleDebateLike = (e: React.MouseEvent | null, debateId: string) => {
    if (e) e.stopPropagation();
    const isLiked = !!userDebateLikes[debateId];

    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId) return d;
        return { ...d, likes: isLiked ? Math.max(0, d.likes - 1) : d.likes + 1 };
      })
    );

    if (selectedDebate && selectedDebate.id === debateId) {
      setSelectedDebate((prev) =>
        prev
          ? {
              ...prev,
              likes: isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
            }
          : null
      );
    }

    setUserDebateLikes((prev) => ({ ...prev, [debateId]: !isLiked }));
  };

  // Like an argument inside a debate (Twitter-style reply like)
  const handleToggleArgLike = (argumentId: string) => {
    const isLiked = !!userArgLikes[argumentId];
    setArgumentsList((prev) =>
      prev.map((a) => {
        if (a.id !== argumentId) return a;
        return { ...a, likes: isLiked ? Math.max(0, a.likes - 1) : a.likes + 1 };
      })
    );
    setUserArgLikes((prev) => ({ ...prev, [argumentId]: !isLiked }));
  };

  const handleAddArgument = (side: 'for' | 'against', content: string) => {
    if (!selectedDebate) return;
    const newArg: Argument = {
      id: 'arg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      debateId: selectedDebate.id,
      side,
      author: currentAuthor,
      content,
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    setArgumentsList((prev) => [...prev, newArg]);
    setUserArgLikes((prev) => ({ ...prev, [newArg.id]: true }));
  };

  const handleCreateDebate = (newDebate: Debate) => {
    setDebates((prev) => [newDebate, ...prev]);
    setSelectedDebate(newDebate);
  };

  const handleReroll = () => {
    const updated = rerollAuthor();
    setCurrentAuthor(updated);
  };

  const filteredDebates = debates.filter((d) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      d.title.toLowerCase().includes(query) ||
      d.author.name.toLowerCase().includes(query) ||
      d.author.handle.toLowerCase().includes(query)
    );
  });

  if (selectedDebate) {
    const currentArguments = argumentsList.filter(
      (a) => a.debateId === selectedDebate.id
    );

    return (
      <DebateChatView
        debate={selectedDebate}
        argumentsList={currentArguments}
        currentAuthor={currentAuthor}
        userVote={userVotes[selectedDebate.id]}
        userArgLikes={userArgLikes}
        isDebateLiked={userDebateLikes[selectedDebate.id]}
        onBack={() => setSelectedDebate(null)}
        onVote={handleVote}
        onToggleArgLike={handleToggleArgLike}
        onToggleDebateLike={(id) => handleToggleDebateLike(null, id)}
        onAddArgument={handleAddArgument}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#040711] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#152038] px-4 py-3.5 bg-[#070c1a]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              Debates
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* User Author Profile Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                style={{ backgroundColor: currentAuthor.avatarColor }}
              >
                {currentAuthor.initials}
              </div>
              <span className="text-xs font-mono text-slate-300 hidden sm:inline">
                {currentAuthor.handle}
              </span>
              <button
                onClick={handleReroll}
                title="Change anonymous avatar"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* + New Debate Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs tracking-tight transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Debate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col">
        {/* Header line: Debates ... Search & X arguments */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Debates
          </h1>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search debates..."
                className="w-full bg-[#080d1a] border border-[#152038] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 shrink-0">
              {totalArgumentsCount} arguments
            </span>
          </div>
        </div>

        {/* Debates Cards Stack (Twitter-style cards) */}
        {filteredDebates.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No debates found matching your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDebates.map((debate) => {
              const currentArgs = argumentsList.filter(
                (a) => a.debateId === debate.id
              );
              return (
                <TopicCard
                  key={debate.id}
                  debate={debate}
                  argumentsList={currentArgs}
                  isLiked={userDebateLikes[debate.id]}
                  onSelect={handleSelectDebate}
                  onToggleLike={handleToggleDebateLike}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Create Debate Modal */}
      <CreateDebateModal
        isOpen={isCreateModalOpen}
        currentAuthor={currentAuthor}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDebate={handleCreateDebate}
      />
    </div>
  );
}
