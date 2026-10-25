import React, { useState, useEffect } from 'react';
import { Debate, Argument, Author, AuthenticityResult, DebateSummary } from './types';
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
import { formatCompactNumber } from './utils/format';
import { TopicCard } from './components/TopicCard';
import { DebateChatView } from './components/DebateChatView';
import { CreateDebateModal } from './components/CreateDebateModal';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { Plus, Search, RefreshCw, Sparkles, Flame } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [isTrending, setIsTrending] = useState(false);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Derive Google verified profile
        const displayName = user.displayName || user.email?.split('@')[0] || 'Google User';
        const initials = displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        setCurrentAuthor({
          name: displayName,
          handle: user.email ? `@${user.email.split('@')[0]}` : `@${displayName.toLowerCase().replace(/\s+/g, '')}`,
          avatarColor: '#2563eb',
          initials,
          uid: user.uid,
          photoURL: user.photoURL || undefined,
          isGoogleUser: true,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync real-time data from Firestore
  useEffect(() => {
    const unsubscribeDebates = onSnapshot(
      collection(db, 'debates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Debate[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as Debate);
          });
          // Preserve local additions while integrating remote
          setDebates((prev) => {
            const map = new Map<string, Debate>();
            loaded.forEach((d) => map.set(d.id, d));
            prev.forEach((d) => {
              if (!map.has(d.id)) map.set(d.id, d);
            });
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        console.warn('Firestore snapshot debates note:', error.message);
      }
    );

    const unsubscribeArgs = onSnapshot(
      collection(db, 'arguments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Argument[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as Argument);
          });
          setArgumentsList((prev) => {
            const map = new Map<string, Argument>();
            loaded.forEach((a) => map.set(a.id, a));
            prev.forEach((a) => {
              if (!map.has(a.id)) map.set(a.id, a);
            });
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        console.warn('Firestore snapshot args note:', error.message);
      }
    );

    return () => {
      unsubscribeDebates();
      unsubscribeArgs();
    };
  }, []);

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
    const updatedViews = (debate.views || 0) + 1;
    setDebates((prev) =>
      prev.map((d) => (d.id === debate.id ? { ...d, views: updatedViews } : d))
    );
    setSelectedDebate({ ...debate, views: updatedViews });

    // Sync to Firestore if authenticated
    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', debate.id), { views: updatedViews }).catch(() => {});
    }
  };

  const handleVote = (side: 'for' | 'against') => {
    if (!selectedDebate) return;
    const previousVote = userVotes[selectedDebate.id];
    if (previousVote === side) return;

    let newFor = selectedDebate.forVotes;
    let newAgainst = selectedDebate.againstVotes;
    if (previousVote === 'for') newFor = Math.max(0, newFor - 1);
    if (previousVote === 'against') newAgainst = Math.max(0, newAgainst - 1);
    if (side === 'for') newFor += 1;
    if (side === 'against') newAgainst += 1;

    setDebates((prev) =>
      prev.map((d) => (d.id === selectedDebate.id ? { ...d, forVotes: newFor, againstVotes: newAgainst } : d))
    );

    setSelectedDebate((prev) => (prev ? { ...prev, forVotes: newFor, againstVotes: newAgainst } : null));
    setUserVotes((prev) => ({ ...prev, [selectedDebate.id]: side }));

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', selectedDebate.id), {
        forVotes: newFor,
        againstVotes: newAgainst,
      }).catch(() => {});
    }
  };

  // Like or unlike a debate post
  const handleToggleDebateLike = (debateId: string) => {
    const isLiked = !!userDebateLikes[debateId];
    let newLikesCount = 0;

    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId) return d;
        const currentLikes = d.likes ?? 0;
        newLikesCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        return { ...d, likes: newLikesCount };
      })
    );
    setSelectedDebate((prev) => {
      if (!prev || prev.id !== debateId) return prev;
      const currentLikes = prev.likes ?? 0;
      return { ...prev, likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
    });
    setUserDebateLikes((prev) => ({ ...prev, [debateId]: !isLiked }));

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', debateId), { likes: newLikesCount }).catch(() => {});
    }
  };

  // Like an argument inside a debate
  const handleToggleArgLike = (argumentId: string) => {
    const isLiked = !!userArgLikes[argumentId];
    let newLikes = 0;

    setArgumentsList((prev) =>
      prev.map((a) => {
        if (a.id !== argumentId) return a;
        newLikes = isLiked ? Math.max(0, a.likes - 1) : a.likes + 1;
        return { ...a, likes: newLikes };
      })
    );
    setUserArgLikes((prev) => ({ ...prev, [argumentId]: !isLiked }));

    if (auth.currentUser) {
      updateDoc(doc(db, 'arguments', argumentId), { likes: newLikes }).catch(() => {});
    }
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

    // Write to Firestore if signed in
    if (auth.currentUser) {
      setDoc(doc(db, 'arguments', newArg.id), newArg).catch((err) => {
        console.warn('Argument Firestore write sync:', err);
      });
    }
  };

  const handleCreateDebate = (newDebate: Debate) => {
    setDebates((prev) => [newDebate, ...prev]);
    setSelectedDebate(newDebate);

    // Write to Firestore if signed in
    if (auth.currentUser) {
      setDoc(doc(db, 'debates', newDebate.id), newDebate).catch((err) => {
        console.warn('Debate Firestore write sync:', err);
      });
    }
  };

  const handleUpdateArgumentAuthenticity = (argumentId: string, result: AuthenticityResult) => {
    setArgumentsList((prev) =>
      prev.map((arg) => (arg.id === argumentId ? { ...arg, authenticityCheck: result } : arg))
    );

    if (auth.currentUser) {
      updateDoc(doc(db, 'arguments', argumentId), { authenticityCheck: result }).catch(() => {});
    }
  };

  const handleUpdateDebateSummary = (summary: DebateSummary) => {
    if (!selectedDebate) return;
    setSelectedDebate((prev) => (prev ? { ...prev, aiSummary: summary } : null));
    setDebates((prev) =>
      prev.map((d) => (d.id === selectedDebate.id ? { ...d, aiSummary: summary } : d))
    );

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', selectedDebate.id), { aiSummary: summary }).catch(() => {});
    }
  };

  const handleReroll = () => {
    const updated = rerollAuthor();
    setCurrentAuthor(updated);
  };

  const filteredDebates = debates
    .filter((d) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        d.title.toLowerCase().includes(query) ||
        d.author.name.toLowerCase().includes(query) ||
        d.author.handle.toLowerCase().includes(query) ||
        d.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (!isTrending) return 0;

      const now = Date.now();
      const recentWindow = 48 * 60 * 60 * 1000;

      const aArgs = argumentsList.filter((arg) => arg.debateId === a.id);
      const bArgs = argumentsList.filter((arg) => arg.debateId === b.id);

      const aRecent = aArgs.filter(
        (arg) => now - new Date(arg.createdAt).getTime() <= recentWindow
      ).length;
      const bRecent = bArgs.filter(
        (arg) => now - new Date(arg.createdAt).getTime() <= recentWindow
      ).length;

      if (bRecent !== aRecent) {
        return bRecent - aRecent;
      }

      if (bArgs.length !== aArgs.length) {
        return bArgs.length - aArgs.length;
      }

      const aLatest = aArgs.reduce(
        (max, arg) => Math.max(max, new Date(arg.createdAt).getTime()),
        0
      );
      const bLatest = bArgs.reduce(
        (max, arg) => Math.max(max, new Date(arg.createdAt).getTime()),
        0
      );
      return bLatest - aLatest;
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
        ambientEnabled={ambientEnabled}
        userVote={userVotes[selectedDebate.id]}
        isDebateLiked={!!userDebateLikes[selectedDebate.id]}
        userArgLikes={userArgLikes}
        onBack={() => setSelectedDebate(null)}
        onVote={handleVote}
        onToggleDebateLike={handleToggleDebateLike}
        onToggleArgLike={handleToggleArgLike}
        onToggleAmbient={() => setAmbientEnabled(!ambientEnabled)}
        onAddArgument={handleAddArgument}
        onUpdateArgumentAuthenticity={handleUpdateArgumentAuthenticity}
        onUpdateDebateSummary={handleUpdateDebateSummary}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Background YouTube Ambient Glow */}
      {ambientEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-20 w-[450px] h-[450px] rounded-full blur-[140px] opacity-20 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)' }}
          />
          <div
            className="absolute -top-32 -right-20 w-[450px] h-[450px] rounded-full blur-[140px] opacity-20 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #be123c 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-[#141928] px-4 py-3.5 bg-black/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              Debates
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Ambient Mode Toggle */}
            <button
              onClick={() => setAmbientEnabled(!ambientEnabled)}
              title="Toggle YouTube-style Ambient Mode"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                ambientEnabled
                  ? 'bg-gradient-to-r from-[#0284c7]/30 to-[#be123c]/30 text-white border border-white/20 shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 border border-transparent hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Ambient</span>
            </button>

            {/* Google Authentication Button / User Profile */}
            <GoogleAuthButton currentUser={firebaseUser} />

            {/* User Persona / Anonymous Handle Badge */}
            {!firebaseUser && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                  style={{ backgroundColor: currentAuthor.avatarColor }}
                >
                  {currentAuthor.initials}
                </div>
                <span className="text-xs font-mono text-slate-300 hidden md:inline">
                  {currentAuthor.handle}
                </span>
                <button
                  onClick={handleReroll}
                  title="Randomize persona"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* + New Debate Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs tracking-tight transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Debate</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col relative z-10">
        {/* Header line: Debates ... Search & Trending toggle & X arguments */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Debates
            </h1>
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium tracking-tight">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                Active Discussions
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search debates..."
                className="w-full bg-[#060810] border border-[#141928] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>

            {/* Trending Toggle Button alongside search bar */}
            <button
              onClick={() => setIsTrending((prev) => !prev)}
              title={
                isTrending
                  ? 'Trending active: Filtered by highest recent arguments (click to show all)'
                  : 'Filter debates by highest number of recent arguments'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer shrink-0 border select-none active:scale-95 ${
                isTrending
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.22)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 transition-transform ${
                  isTrending ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-400'
                }`}
              />
              <span>Trending</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 shrink-0 hidden sm:inline-block">
              {formatCompactNumber(totalArgumentsCount)} arguments
            </span>
          </div>
        </div>

        {/* Debates Cards Stack (with Ambient glow) */}
        {filteredDebates.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            {searchQuery
              ? `No debates found matching "${searchQuery}".`
              : 'No discussions found.'}
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
                  ambientEnabled={ambientEnabled}
                  isLiked={!!userDebateLikes[debate.id]}
                  isTrending={isTrending}
                  onToggleLike={handleToggleDebateLike}
                  onSelect={handleSelectDebate}
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
