import React, { useState, useMemo } from 'react';
import { Debate, Argument, SortFilter, Author, AuthenticityResult, DebateSummary } from '../types';
import { sortAndInterleaveArguments } from '../utils/sorting';
import { formatCompactNumber, formatRelativeTime } from '../utils/format';
import {
  ArrowLeft,
  Send,
  Check,
  Share2,
  Sparkles,
  Heart,
  Mic,
  MicOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Bot,
} from 'lucide-react';
import { ExpandableText } from './ExpandableText';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { AuthenticityModal } from './AuthenticityModal';
import { DebateAiDrawer } from './DebateAiDrawer';

interface DebateChatViewProps {
  debate: Debate;
  argumentsList: Argument[];
  currentAuthor: Author;
  ambientEnabled: boolean;
  userVote?: 'for' | 'against';
  isDebateLiked?: boolean;
  userArgLikes: Record<string, boolean>;
  onBack: () => void;
  onVote: (side: 'for' | 'against') => void;
  onToggleDebateLike?: (debateId: string) => void;
  onToggleArgLike: (argumentId: string) => void;
  onToggleAmbient: () => void;
  onAddArgument: (side: 'for' | 'against', content: string) => void;
  onUpdateArgumentAuthenticity?: (argumentId: string, result: AuthenticityResult) => void;
  onUpdateDebateSummary?: (summary: DebateSummary) => void;
}

export const DebateChatView: React.FC<DebateChatViewProps> = ({
  debate,
  argumentsList,
  currentAuthor: _currentAuthor,
  ambientEnabled,
  userVote,
  isDebateLiked = false,
  userArgLikes,
  onBack,
  onVote,
  onToggleDebateLike,
  onToggleArgLike,
  onToggleAmbient,
  onAddArgument,
  onUpdateArgumentAuthenticity,
  onUpdateDebateSummary,
}) => {
  const [filter, setFilter] = useState<SortFilter>('alternating');
  const [selectedSide, setSelectedSide] = useState<'for' | 'against'>('for');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Authenticity checking state
  const [selectedArgForCheck, setSelectedArgForCheck] = useState<Argument | null>(null);
  const [activeCheckResult, setActiveCheckResult] = useState<AuthenticityResult | null>(null);
  const [isCheckingAuthenticity, setIsCheckingAuthenticity] = useState(false);

  // AI Summary & Assistant Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Voice recording integration
  const {
    isRecording,
    isTranscribing,
    error: micError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onTranscriptionComplete: (transcribed) => {
      setContent((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
    },
  });

  // Sorted and interleaved arguments or live chronological stream
  const displayedArguments = useMemo(() => {
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

  const handleCheckAuthenticity = async (arg: Argument) => {
    setSelectedArgForCheck(arg);
    if (arg.authenticityCheck) {
      setActiveCheckResult(arg.authenticityCheck);
      return;
    }

    setIsCheckingAuthenticity(true);
    setActiveCheckResult(null);

    try {
      const res = await fetch('/api/check-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argumentText: arg.content,
          debateTitle: debate.title,
        }),
      });

      if (!res.ok) {
        throw new Error('Verification failed');
      }

      const result: AuthenticityResult = await res.json();
      setActiveCheckResult(result);
      if (onUpdateArgumentAuthenticity) {
        onUpdateArgumentAuthenticity(arg.id, result);
      }
    } catch (err: any) {
      console.error('Authenticity check error:', err);
    } finally {
      setIsCheckingAuthenticity(false);
    }
  };

  const renderAuthenticityBadge = (result?: AuthenticityResult) => {
    if (!result) return null;
    let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    let Icon = ShieldCheck;
    if (result.verdict === 'Questionable / Unverified') {
      badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      Icon = AlertTriangle;
    } else if (result.verdict === 'False or Misleading') {
      badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      Icon = ShieldAlert;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${badgeClass}`}>
        <Icon className="w-3 h-3" />
        <span>{result.verdict} ({result.score}%)</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambient Glow across the page (YouTube Ambient Mode) */}
      {ambientEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)' }}
          />
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #be123c 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-[#141928] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Debates</span>
          </button>

          {/* Right Header: AI Summary Button + Ambient Toggle + Views + Share */}
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
            {/* AI Summary / Assistant Drawer Trigger */}
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              title="Open AI Summary & Debate Assistant"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-white border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Summary & Assistant</span>
            </button>

            {/* Ambient Toggle Button */}
            <button
              onClick={onToggleAmbient}
              title="Toggle YouTube-style Ambient Glow"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                ambientEnabled
                  ? 'bg-gradient-to-r from-[#0284c7]/30 to-[#be123c]/30 text-white border border-white/20 shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 border border-transparent hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Ambient</span>
            </button>

            <span className="hidden sm:inline">
              <strong className="text-slate-200">{formatCompactNumber(debate.views)}</strong> views
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              <strong className="text-slate-200">{formatCompactNumber(argumentsList.length)}</strong> args
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
      <main className="max-w-4xl w-full mx-auto px-4 pt-5 pb-36 flex-1 flex flex-col relative z-10">
        {/* Main Debate Card Header with YouTube-Style Ambient Glow Spill */}
        <div className="relative mb-5">
          {ambientEnabled && (
            <div
              className="absolute -inset-2 sm:-inset-4 rounded-3xl blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700 opacity-20"
              style={{
                background: `radial-gradient(ellipse at 25% 50%, #0284c7, transparent 70%), radial-gradient(ellipse at 75% 50%, #be123c, transparent 70%)`,
              }}
            />
          )}

          <div className="relative bg-[#060810]/95 border border-[#141928] rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
            {/* Author Row with Interactive Post Like Button & AI Summary pill */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[7px] text-white shrink-0 opacity-80"
                  style={{ backgroundColor: debate.author.avatarColor }}
                >
                  {debate.author.initials}
                </div>

                <span className="text-xs text-slate-400 font-medium truncate">
                  {debate.author.name}
                </span>
                {debate.author.handle &&
                  debate.author.handle !== debate.author.name &&
                  debate.author.handle !== `@${debate.author.name.replace(/^u\//, '')}` && (
                    <span className="text-slate-500 text-xs font-mono truncate">
                      {debate.author.handle}
                    </span>
                  )}
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-slate-500 text-xs font-mono shrink-0">
                  {formatRelativeTime(debate.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Summary Quick Button */}
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/70 border border-cyan-800/50 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Insights</span>
                </button>

                {/* Post Like Button on Header */}
                <button
                  onClick={() => onToggleDebateLike?.(debate.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    isDebateLiked
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-800'
                      : 'bg-[#090d18] text-slate-400 hover:text-slate-200 border border-[#141e33]'
                  }`}
                  title={isDebateLiked ? 'Unlike debate post' : 'Like debate post'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                      isDebateLiked ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span className="tabular-nums font-semibold">
                    {formatCompactNumber(debate.likes)}
                  </span>
                </button>
              </div>
            </div>

            {/* Debate Proposition with Read More toggle if lengthy */}
            <h1 className="text-lg sm:text-xl font-bold text-white leading-snug mb-3">
              <ExpandableText text={debate.title} maxLines={6} />
            </h1>

            {/* Optional Image Attachment (e.g. Infographic / Survey Graph) */}
            {debate.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-[#161f36] bg-[#03060c] max-h-96 flex flex-col">
                <img
                  src={debate.imageUrl}
                  alt={debate.title}
                  className="w-full h-auto object-contain max-h-96 rounded-t-xl"
                />
                {debate.imageCaption && (
                  <p className="px-3.5 py-2 text-xs text-slate-400 bg-[#060a14] border-t border-[#141b2e]">
                    {debate.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Live Vote Poll Bar & Interactive Vote Buttons */}
            <div className="pt-2.5 border-t border-[#141928]">
              <div className="flex items-center justify-between text-xs font-semibold mb-2 font-mono">
                <span className="text-[#38bdf8] font-bold">
                  {forPercent}% For ({formatCompactNumber(debate.forVotes)} votes)
                </span>
                <span className="text-[#fb7185] font-bold">
                  {againstPercent}% Against ({formatCompactNumber(debate.againstVotes)} votes)
                </span>
              </div>

              {/* Poll Bar: Continuous smooth gradient in ambient mode; 2 solid colors with NO gradient when ambient is off */}
              <div className="relative mb-3.5">
                {ambientEnabled ? (
                  <>
                    <div
                      className="absolute -inset-1 rounded-full blur-md opacity-45 pointer-events-none transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(0, forPercent - 12)}%, #7c3aed ${forPercent}%, #f43f5e ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                      }}
                    />
                    <div className="relative h-2.5 w-full bg-[#0c101d] rounded-full overflow-hidden p-[1px] shadow-inner">
                      <div
                        className="h-full w-full rounded-full transition-all duration-500"
                        style={{
                          background: `linear-gradient(90deg, #0284c7 0%, #0ea5e9 ${Math.max(0, forPercent - 12)}%, #6366f1 ${forPercent}%, #e11d48 ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="relative h-2.5 w-full bg-[#0c101d] rounded-full overflow-hidden shadow-inner flex">
                    <div
                      className="h-full bg-[#0284c7] transition-all duration-300"
                      style={{ width: `${forPercent}%` }}
                      title={`${forPercent}% For`}
                    />
                    <div
                      className="h-full bg-[#be123c] transition-all duration-300"
                      style={{ width: `${againstPercent}%` }}
                      title={`${againstPercent}% Against`}
                    />
                  </div>
                )}
              </div>

              {/* 1-Tap Vote Buttons with subtle styling */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onVote('for')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userVote === 'for'
                      ? 'bg-gradient-to-r from-[#0369a1] to-[#0284c7] text-white font-bold ring-1 ring-[#38bdf8]/50 shadow-md'
                      : 'bg-[#090d18] hover:bg-[#0e1424] text-[#38bdf8] border border-[#141e33]'
                  }`}
                >
                  {userVote === 'for' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>Vote For</span>
                </button>

                <button
                  onClick={() => onVote('against')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userVote === 'against'
                      ? 'bg-gradient-to-r from-[#be123c] to-[#9f1239] text-white font-bold ring-1 ring-[#fb7185]/50 shadow-md'
                      : 'bg-[#090d18] hover:bg-[#0e1424] text-[#fb7185] border border-[#141e33]'
                  }`}
                >
                  {userVote === 'against' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>Vote Against</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Filter Controls: Top Balanced vs Live Stream */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#141928] pb-2.5 mb-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            {filter === 'live' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live stream (chronological)
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Alternating arguments sorted by likes:
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#060810] border border-[#141928] p-1 rounded-xl">
            <button
              onClick={() => setFilter('live')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'live'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live</span>
            </button>

            <button
              onClick={() => setFilter('alternating')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'alternating'
                  ? 'bg-[#141e33] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Balanced (A ⇄ B)
            </button>

            <button
              onClick={() => setFilter('for')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'for'
                  ? 'bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              For ({formatCompactNumber(forArgsCount)})
            </button>

            <button
              onClick={() => setFilter('against')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'against'
                  ? 'bg-[#be123c]/20 text-[#fb7185] border border-[#be123c]/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Against ({formatCompactNumber(againstArgsCount)})
            </button>
          </div>
        </div>

        {/* Arguments Timeline */}
        {displayedArguments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No arguments posted yet. Be the first to reply!
          </div>
        ) : (
          <div className="space-y-3">
            {displayedArguments.map((arg) => {
              const isFor = arg.side === 'for';
              const isLiked = !!userArgLikes[arg.id];

              return (
                <div
                  key={arg.id}
                  className={`flex flex-col ${isFor ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3.5 border transition-all ${
                      isFor
                        ? 'bg-[#060810]/95 border-[#0c203b] hover:border-[#10305a] rounded-tl-sm'
                        : 'bg-[#060810]/95 border-[#2d0e19] hover:border-[#421424] rounded-tr-sm'
                    }`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0 opacity-80"
                          style={{ backgroundColor: arg.author.avatarColor }}
                        >
                          {arg.author.initials}
                        </div>

                        <span className="font-bold text-white text-xs">
                          {arg.author.name}
                        </span>
                        {arg.author.handle &&
                          arg.author.handle !== arg.author.name &&
                          arg.author.handle !== `@${arg.author.name.replace(/^u\//, '')}` && (
                            <span className="text-slate-500 text-[11px] font-mono">
                              {arg.author.handle}
                            </span>
                          )}
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {formatRelativeTime(arg.createdAt)}
                      </span>
                    </div>

                    {/* Content with Read More / Show Less Toggle if 6-7 lines */}
                    <div className="text-sm text-slate-200 leading-relaxed mb-2 whitespace-pre-wrap pl-5.5">
                      <ExpandableText text={arg.content} maxLines={6} />
                    </div>

                    {/* Actions Row: AI Authenticity Check + Upvote / Like */}
                    <div className="flex items-center justify-between pl-5.5 pt-1 border-t border-white/[0.04]">
                      {/* AI Authenticity Check Trigger */}
                      <button
                        onClick={() => handleCheckAuthenticity(arg)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group"
                        title="Verify factual authenticity with Google Grounded Search"
                      >
                        {arg.authenticityCheck ? (
                          renderAuthenticityBadge(arg.authenticityCheck)
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03] group-hover:bg-cyan-500/10 border border-white/5 group-hover:border-cyan-500/30 text-slate-400 group-hover:text-cyan-300 transition-all">
                            <ShieldCheck className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                            <span>Verify Facts</span>
                          </span>
                        )}
                      </button>

                      {/* Upvote / Like Action on argument */}
                      <button
                        onClick={() => onToggleArgLike(arg.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
                          isLiked
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-[#090d18] text-slate-400 hover:text-white border border-[#141e33]'
                        }`}
                      >
                        <span className={`text-[11px] ${isLiked ? 'text-rose-400 font-bold' : ''}`}>▲</span>
                        <span>{formatCompactNumber(arg.likes)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Argument Composer with Microphone Voice Dictation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-[#141928] p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Recording Status Banner */}
          {isRecording && (
            <div className="mb-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">Recording audio... Speak your argument clearly</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-2 py-1 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center gap-2 text-xs text-cyan-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Transcribing your speech with Gemini 3.5...</span>
            </div>
          )}

          {micError && (
            <div className="mb-2 p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs">
              {micError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Side selection toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Your side:</span>
                <div className="inline-flex rounded-xl p-0.5 bg-[#060810] border border-[#141928] text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedSide('for')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedSide === 'for'
                        ? 'bg-gradient-to-r from-[#0369a1] to-[#0284c7] text-white shadow-sm'
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
                        ? 'bg-gradient-to-r from-[#be123c] to-[#9f1239] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Against
                  </button>
                </div>
              </div>
            </div>

            {/* Input row with Microphone & Send button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Post an argument ${selectedSide === 'for' ? 'for' : 'against'} this topic... (or click mic)`}
                className="flex-1 bg-[#060810] border border-[#141928] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
              />

              {/* Mic Voice Dictation Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                title={isRecording ? 'Stop recording voice' : 'Dictate argument with microphone'}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  isRecording
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : 'bg-[#090d18] border-[#141e33] text-slate-400 hover:text-white hover:border-cyan-500/50'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!content.trim() || isRecording}
                className={`h-10 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  content.trim() && !isRecording
                    ? selectedSide === 'for'
                      ? 'bg-gradient-to-r from-[#0369a1] to-[#0284c7] text-white font-bold hover:brightness-110 active:scale-95'
                      : 'bg-gradient-to-r from-[#be123c] to-[#9f1239] text-white font-bold hover:brightness-110 active:scale-95'
                    : 'bg-[#101420] text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Authenticity Modal */}
      <AuthenticityModal
        argument={selectedArgForCheck}
        result={activeCheckResult}
        isLoading={isCheckingAuthenticity}
        onClose={() => {
          setSelectedArgForCheck(null);
          setActiveCheckResult(null);
        }}
      />

      {/* AI Summary & Assistant Side Drawer */}
      <DebateAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        debate={debate}
        argumentsList={argumentsList}
        onUpdateDebateSummary={onUpdateDebateSummary}
      />
    </div>
  );
};
