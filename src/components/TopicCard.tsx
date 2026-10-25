import React, { useState } from 'react';
import { Debate, Argument } from '../types';
import { MessageCircle, Heart, Share2, Check } from 'lucide-react';

interface TopicCardProps {
  debate: Debate;
  argumentsList: Argument[];
  isLiked?: boolean;
  onSelect: (debate: Debate) => void;
  onToggleLike: (e: React.MouseEvent, debateId: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const TopicCard: React.FC<TopicCardProps> = ({
  debate,
  argumentsList,
  isLiked = false,
  onSelect,
  onToggleLike,
}) => {
  const [copied, setCopied] = useState(false);

  const forCount = argumentsList.filter((a) => a.side === 'for').length;
  const againstCount = argumentsList.filter((a) => a.side === 'against').length;

  const totalVotes = debate.forVotes + debate.againstVotes;
  const forPercent =
    totalVotes > 0 ? Math.round((debate.forVotes / totalVotes) * 100) : 50;
  const againstPercent = 100 - forPercent;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      onClick={() => onSelect(debate)}
      className="group bg-[#080d1a] hover:bg-[#0c1326] border border-[#152038] hover:border-[#1e2d4f] rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer shadow-md hover:shadow-cyan-950/20"
    >
      {/* Top Author Row: Very small, subtle author photo & name */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Micro Logo / Avatar */}
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
          <span className="text-slate-600 text-[11px]">·</span>
          <span className="text-slate-500 text-[11px] font-mono shrink-0">
            {formatRelativeTime(debate.createdAt)}
          </span>
        </div>

        {/* Clean Views count (NO EYE ICON) */}
        <div className="text-slate-400 text-xs font-mono shrink-0">
          <span className="text-slate-300 font-semibold tabular-nums">
            {debate.views.toLocaleString()}
          </span>{' '}
          views
        </div>
      </div>

      {/* Slim Question / Title (NO TAGS) */}
      <h2 className="text-sm sm:text-base font-bold text-slate-100 mb-2 leading-snug group-hover:text-white transition-colors">
        {debate.title}
      </h2>

      {/* Slim Split Bar */}
      <div className="h-1.5 w-full bg-[#121a2f] rounded-full overflow-hidden flex mb-2 p-[1px] shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] rounded-l-full transition-all duration-300 shadow-[0_0_6px_rgba(0,245,212,0.3)]"
          style={{ width: `${forPercent}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-[#ff2a6d] to-[#d90429] rounded-r-full transition-all duration-300 shadow-[0_0_6px_rgba(255,42,109,0.3)]"
          style={{ width: `${againstPercent}%` }}
        />
      </div>

      {/* Bottom Row: Slim Status + Action Icons */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#12192a]">
        {/* For vs Against Status */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#00f5d4] font-bold">
            {forCount} For ({forPercent}%)
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[#ff4382] font-bold">
            {againstCount} Against ({againstPercent}%)
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-slate-400">
          {/* Argument count */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(debate);
            }}
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors py-0.5 cursor-pointer"
            title="Replies"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono text-xs">
              {argumentsList.length}
            </span>
          </button>

          {/* Like button */}
          <button
            onClick={(e) => onToggleLike(e, debate.id)}
            className={`flex items-center gap-1 transition-colors py-0.5 cursor-pointer ${
              isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
            }`}
            title="Like"
          >
            <Heart
              className={`w-3.5 h-3.5 active:scale-125 transition-transform ${
                isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span className="tabular-nums font-mono text-xs">
              {debate.likes}
            </span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors py-0.5 cursor-pointer"
            title="Share link"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
