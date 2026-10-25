import React, { useState, useMemo } from 'react';
import { Debate, Argument, SortFilter, Author } from '../types';
import { sortAndInterleaveArguments } from '../utils/sorting';
import { ArrowLeft, Heart, Send, Check, Share2 } from 'lucide-react';

interface DebateChatViewProps {
  debate: Debate;
  argumentsList: Argument[];
  currentAuthor: Author;
  userVote?: 'for' | 'against';
  userArgLikes: Record<string, boolean>;
  isDebateLiked?: boolean;
  onBack: () => void;
  onVote: (side: 'for' | 'against') => void;
  onToggleArgLike: (argumentId: string) => void;
  onToggleDebateLike: (debateId: string) => void;
  onAddArgument: (side: 'for' | 'against', content: string) => void;
}

export const DebateChatView: React.FC<DebateChatViewProps> = ({
  debate,
  argumentsList,
  currentAuthor,
  userVote,
  userArgLikes,
  isDebateLiked = false,
  onBack,
  onVote,
  onToggleArgLike,
  onToggleDebateLike,
  onAddArgument,
}) => {
  const [filter, setFilter] = useState<SortFilter>('alternating');
  const [selectedSide, setSelectedSide] = useState<'for' | 'against'>('for');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Sorted and interleaved arguments (A1, B1, A2, B2...)
  const interleavedList = useMemo(() => {
    return sortAndInterleaveArguments(argumentsList, filter);
  }, [argumentsList, filter]);

  const forArgsCount = argumentsList.filter((a) => a.side === 'for').length;
  const againstArgsCount = argumentsList.filter((a) => a.side === 'against').length;

  const totalVotes = debate.forVotes + debate.againstVotes;
  const forPercent =
    totalVotes > 0 ? Math.round((debate.forVotes / totalVotes) * 100) : 50;
  const againstPercent = 100 - forPercent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddArgument(selectedSide, content.trim());
    setContent('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#070c1a]/95 backdrop-blur-md border-b border-[#152038] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Debates</span>
          </button>

          {/* Clean View Count & Arguments (NO EYE LOGO) */}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>
              <strong className="text-slate-200">{debate.views.toLocaleString()}</strong> views
            </span>
            <span>·</span>
            <span>
              <strong className="text-slate-200">{argumentsList.length}</strong> arguments
            </span>

            <button
              onClick={handleShare}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Share debate"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 pt-4 pb-36 flex-1 flex flex-col">
        {/* Main Debate Card Header */}
        <div className="bg-[#080d1a] border border-[#152038] rounded-xl px-4 py-3.5 mb-5 shadow-xl">
          {/* Subtle Small Author Row */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[7px] text-white shrink-0 opacity-80"
                style={{ backgroundColor: debate.author.avatarColor }}
              >
                {debate.author.initials}
              </div>

              <span className="text-[11px] text-slate-400 font-medium truncate">
                {debate.author.name}
              </span>
              <span className="text-slate-500 text-[11px] font-mono truncate">
                {debate.author.handle}
              </span>
            </div>

            {/* Like this Debate Button */}
            <button
              onClick={() => onToggleDebateLike(debate.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                isDebateLiked
                  ? 'bg-rose-950/60 border-rose-600/80 text-rose-400 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-rose-400 hover:bg-rose-950/20'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                  isDebateLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="font-mono text-xs tabular-nums">{debate.likes}</span>
            </button>
          </div>

          {/* Debate Proposition */}
          <h1 className="text-lg sm:text-xl font-bold text-white leading-snug mb-3">
            {debate.title}
          </h1>

          {/* Live Vote Poll Bar & Interactive Vote Buttons */}
          <div className="pt-2.5 border-t border-[#152038]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2 font-mono">
              <span className="text-[#00f5d4] font-bold">
                {forPercent}% For ({debate.forVotes} votes)
              </span>
              <span className="text-[#ff4382] font-bold">
                {againstPercent}% Against ({debate.againstVotes} votes)
              </span>
            </div>

            {/* Glowing Split Bar */}
            <div className="h-2 w-full bg-[#121a2f] rounded-full overflow-hidden flex mb-3 p-[1px] shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] rounded-l-full transition-all duration-500 shadow-[0_0_8px_rgba(0,245,212,0.35)]"
                style={{ width: `${forPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#ff2a6d] to-[#d90429] rounded-r-full transition-all duration-500 shadow-[0_0_8px_rgba(255,42,109,0.35)]"
                style={{ width: `${againstPercent}%` }}
              />
            </div>

            {/* 1-Tap Vote Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onVote('for')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  userVote === 'for'
                    ? 'bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] text-slate-950 font-bold ring-2 ring-[#00f5d4]/50 shadow-[0_0_15px_rgba(0,245,212,0.3)]'
                    : 'bg-[#0f172a] hover:bg-[#15223c] text-[#00f5d4] border border-[#1c2e50]'
                }`}
              >
                {userVote === 'for' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>Vote For</span>
              </button>

              <button
                onClick={() => onVote('against')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  userVote === 'against'
                    ? 'bg-gradient-to-r from-[#ff2a6d] to-[#d90429] text-white font-bold ring-2 ring-[#ff2a6d]/50 shadow-[0_0_15px_rgba(255,42,109,0.3)]'
                    : 'bg-[#0f172a] hover:bg-[#15223c] text-[#ff4382] border border-[#1c2e50]'
                }`}
              >
                {userVote === 'against' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>Vote Against</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Filter Segmented Controls */}
        <div className="flex items-center justify-between border-b border-[#152038] pb-2.5 mb-4 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">
            Alternating arguments sorted by likes:
          </span>

          <div className="flex items-center gap-1 bg-[#080d1a] border border-[#152038] p-1 rounded-xl">
            <button
              onClick={() => setFilter('alternating')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'alternating'
                  ? 'bg-[#152038] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alternating (A ⇄ B)
            </button>
            <button
              onClick={() => setFilter('for')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'for'
                  ? 'bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              For ({forArgsCount})
            </button>
            <button
              onClick={() => setFilter('against')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'against'
                  ? 'bg-[#ff2a6d]/15 text-[#ff4382] border border-[#ff2a6d]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Against ({againstArgsCount})
            </button>
          </div>
        </div>

        {/* Arguments Timeline (A1 B1 A2 B2) - NO "1 FOR / 1 AGAINST" BADGES */}
        {interleavedList.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No arguments posted yet. Be the first to reply!
          </div>
        ) : (
          <div className="space-y-3">
            {interleavedList.map((arg) => {
              const isFor = arg.side === 'for';
              const isLiked = !!userArgLikes[arg.id];

              return (
                <div
                  key={arg.id}
                  className={`flex flex-col ${isFor ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-3.5 border transition-all shadow-md ${
                      isFor
                        ? 'bg-[#080d1a] border-[#00f5d4]/25 rounded-tl-sm'
                        : 'bg-[#080d1a] border-[#ff2a6d]/25 rounded-tr-sm'
                    }`}
                  >
                    {/* Comment Header: Just Avatar, Name, Handle, Timestamp (NO 1 FOR / 1 AGAINST BADGE) */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        {/* Micro Avatar */}
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: arg.author.avatarColor }}
                        >
                          {arg.author.initials}
                        </div>

                        {/* Name and Handle */}
                        <span className="font-bold text-white text-xs">
                          {arg.author.name}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          {arg.author.handle}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {new Date(arg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-slate-200 leading-relaxed mb-2 whitespace-pre-wrap pl-5.5">
                      {arg.content}
                    </p>

                    {/* Like Action */}
                    <div className="flex justify-end pl-5.5">
                      <button
                        onClick={() => onToggleArgLike(arg.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                          isLiked
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-700/80'
                            : 'bg-[#10172c] text-slate-400 hover:text-white border border-[#1b2747]'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            isLiked ? 'fill-rose-400 text-rose-400' : ''
                          }`}
                        />
                        <span>{arg.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Argument Composer (NO "POSTING AS" BADGE) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070c1a]/95 backdrop-blur-md border-t border-[#152038] p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Side selection toggle only */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                Your side:
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-[#080d1a] border border-[#152038] text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSide('for')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSide === 'for'
                      ? 'bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  For
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSide('against')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSide === 'against'
                      ? 'bg-gradient-to-r from-[#ff2a6d] to-[#d90429] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Against
                </button>
              </div>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Post an argument ${selectedSide === 'for' ? 'for' : 'against'} this topic...`}
                className="flex-1 bg-[#080d1a] border border-[#152038] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className={`h-10 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  content.trim()
                    ? selectedSide === 'for'
                      ? 'bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] text-slate-950 font-bold hover:brightness-110 active:scale-95'
                      : 'bg-gradient-to-r from-[#ff2a6d] to-[#d90429] text-white font-bold hover:brightness-110 active:scale-95'
                    : 'bg-[#152038] text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
