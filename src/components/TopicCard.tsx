import React, { useState } from 'react';
import { Debate, Argument } from '../types';
import { MessageCircle, Share2, Check, Heart, Flame } from 'lucide-react';
import { formatCompactNumber, formatRelativeTime } from '../utils/format';
import { ExpandableText } from './ExpandableText';

interface TopicCardProps {
  debate: Debate;
  argumentsList: Argument[];
  ambientEnabled?: boolean;
  isLiked?: boolean;
  isTrending?: boolean;
  onToggleLike?: (debateId: string) => void;
  onSelect: (debate: Debate) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  debate,
  argumentsList,
  ambientEnabled = true,
  isLiked = false,
  isTrending = false,
  onToggleLike,
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);

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
    <div className="relative group">
      {/* YouTube Ambient Mode: Soft diffused aura spilling behind the card */}
      {ambientEnabled && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-500 blur-xl pointer-events-none"
          style={{
            background: `linear-gradient(to right, rgba(2, 132, 199, 0.4) 0%, transparent 50%, rgba(190, 18, 60, 0.4) 100%)`,
          }}
        />
      )}

      {/* Main Card */}
      <article
        onClick={() => onSelect(debate)}
        className="relative bg-[#060810]/95 hover:bg-[#080c18] border border-[#141928] hover:border-[#1d263d] rounded-2xl px-5 py-4 transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm"
      >
        {/* Top Author Row: Micro Avatar & Name */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[7px] text-white shrink-0 opacity-80"
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

          {/* Clean Compact Views Count (k/m system) & Trending badge */}
          <div className="text-slate-400 text-xs font-mono shrink-0 flex items-center gap-2">
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold tracking-wide">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>Trending</span>
              </span>
            )}
            <div>
              <span className="text-slate-300 font-bold tabular-nums">
                {formatCompactNumber(debate.views)}
              </span>{' '}
              views
            </div>
          </div>
        </div>

        {/* Debate Question / Title with Read more toggle if long */}
        <h2 className="text-base sm:text-lg font-bold text-white mb-2.5 leading-snug group-hover:text-slate-100 transition-colors">
          <ExpandableText text={debate.title} maxLines={6} />
        </h2>

        {/* Optional Image Attachment (e.g. Infographic / Survey Graph) */}
        {debate.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-[#161f36] bg-[#03060c] max-h-72 flex flex-col">
            <img
              src={debate.imageUrl}
              alt={debate.title}
              className="w-full h-auto object-cover max-h-64 rounded-t-xl"
              loading="lazy"
            />
            {debate.imageCaption && (
              <p className="px-3 py-1.5 text-[11px] text-slate-400 bg-[#060a14] border-t border-[#141b2e] truncate">
                {debate.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Poll Bar: Smooth gradient with glow in ambient mode; 2 solid colors with NO gradient when ambient is off */}
        <div className="relative mb-3">
          {ambientEnabled ? (
            <>
              {/* Diffused ambient glow behind the bar */}
              <div
                className="absolute -inset-1 rounded-full blur-md opacity-45 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(0, forPercent - 12)}%, #7c3aed ${forPercent}%, #f43f5e ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                }}
              />
              <div className="relative h-2 w-full bg-[#0c101d] rounded-full overflow-hidden p-[1px] shadow-inner">
                <div
                  className="h-full w-full rounded-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, #0284c7 0%, #0ea5e9 ${Math.max(0, forPercent - 12)}%, #6366f1 ${forPercent}%, #e11d48 ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                  }}
                />
              </div>
            </>
          ) : (
            /* Clean 2-solid-color poll bar with NO gradient and NO separator divider */
            <div className="relative h-2 w-full bg-[#0c101d] rounded-full overflow-hidden shadow-inner flex">
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

        {/* Bottom Row: Compact Status & Clean Action Icons with Like button */}
        <div className="flex items-center justify-between text-xs pt-1">
          {/* For vs Against Status with k/m numbers */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#38bdf8] font-bold">
              {formatCompactNumber(debate.forVotes)} For ({forPercent}%)
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[#fb7185] font-bold">
              {formatCompactNumber(debate.againstVotes)} Against ({againstPercent}%)
            </span>
          </div>

          {/* Action icons: Like, Replies & Share */}
          <div className="flex items-center gap-3.5 text-slate-400">
            {/* Interactive Post Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.(debate.id);
              }}
              className={`flex items-center gap-1.5 transition-colors py-0.5 cursor-pointer ${
                isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-400 text-slate-400'
              }`}
              title={isLiked ? 'Unlike debate' : 'Like debate'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="tabular-nums font-mono text-xs">
                {formatCompactNumber(debate.likes)}
              </span>
            </button>

            {/* Argument count */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(debate);
              }}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors py-0.5 cursor-pointer"
              title="Replies"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="tabular-nums font-mono text-xs">
                {formatCompactNumber(argumentsList.length)}
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
    </div>
  );
};
