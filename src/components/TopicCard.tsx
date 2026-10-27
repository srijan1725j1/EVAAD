import React, { useState, useEffect } from 'react';
import { Debate, Argument } from '../types';
import { MessageCircle, Share2, Check, Heart, Flame, Flag } from 'lucide-react';
import { formatCompactNumber, formatRelativeTime } from '../utils/format';
import { TranslatedTextBlock } from './TranslatedTextBlock';
import { ReferencePostCard } from './ReferencePostCard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { copyToClipboard, getShareUrl } from '../utils/clipboard';

interface TopicCardProps {
  debate: Debate;
  argumentsList: Argument[];
  ambientEnabled?: boolean;
  isLiked?: boolean;
  isReported?: boolean;
  isTrending?: boolean;
  trendRank?: number;
  userVote?: 'for' | 'against';
  onToggleLike?: (debateId: string) => void;
  onReportDebate?: (debate: Debate) => void;
  onSelect: (debate: Debate) => void;
  onSelectTag?: (tag: string) => void;
  onOpenOriginalPost?: (postId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  debate,
  argumentsList,
  ambientEnabled = true,
  isLiked = false,
  isReported = false,
  isTrending = false,
  trendRank,
  userVote,
  onToggleLike,
  onReportDebate,
  onSelect,
  onSelectTag,
  onOpenOriginalPost,
}) => {
  const { isDark } = useTheme();
  const { t, registerTextsForTranslation, getTranslatedEntry, isShowingOriginal } = useLanguage();
  const [copied, setCopied] = useState(false);

  const itemKey = `feed_debate_${debate.id}`;
  const showingOriginal = isShowingOriginal(itemKey);

  useEffect(() => {
    if (debate.imageCaption) {
      registerTextsForTranslation([debate.imageCaption]);
    }
  }, [debate.imageCaption, registerTextsForTranslation]);

  const captionEntry = debate.imageCaption ? getTranslatedEntry(debate.imageCaption) : null;
  const displayCaption =
    showingOriginal || !captionEntry?.translatedText
      ? debate.imageCaption
      : captionEntry.translatedText;

  const totalVotes = debate.forVotes + debate.againstVotes;
  const forPercent =
    totalVotes > 0 ? Math.round((debate.forVotes / totalVotes) * 100) : 50;
  const againstPercent = 100 - forPercent;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl(debate.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      onClick={() => onSelect(debate)}
      className={`w-full group px-4 sm:px-5 py-3.5 sm:py-4 transition-colors duration-150 cursor-pointer border-b border-slate-200 dark:border-[#141928] ${
        isDark
          ? 'bg-[#060810]/95 hover:bg-[#080d1a]'
          : 'bg-white hover:bg-slate-50/90'
      }`}
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

          <span className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {debate.author.name}
          </span>
          {debate.author.handle &&
            debate.author.handle !== debate.author.name &&
            debate.author.handle !== `@${debate.author.name.replace(/^u\//, '')}` && (
              <span className={`text-xs font-mono truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {debate.author.handle}
              </span>
            )}
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>·</span>
          <span className={`text-xs font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {formatRelativeTime(debate.createdAt)}
          </span>
          {debate.tags && debate.tags.length > 0 && (
            <>
              <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
              <div className="hidden sm:flex items-center gap-1.5 overflow-hidden">
                {debate.tags.slice(0, 2).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag?.(tag);
                    }}
                    className={`text-[11px] font-mono tracking-tight hover:underline cursor-pointer shrink-0 ${
                      isDark ? 'text-sky-400/80 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clean Compact Views Count (k/m system) & Trending badge */}
        <div className={`text-xs font-mono shrink-0 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {isTrending && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300 text-[10px] font-bold tracking-wide">
              <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span>{trendRank ? `#${trendRank} ${t('trending').toUpperCase()}` : t('trending')}</span>
            </span>
          )}
          <div>
            <span className={`font-bold tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {formatCompactNumber(debate.views)}
            </span>{' '}
            {t('views')}
          </div>
        </div>
      </div>

      {/* Debate Question / Title with Translation & "See original" toggle */}
      <h2 className={`text-base sm:text-lg font-bold mb-2.5 leading-snug transition-colors ${isDark ? 'text-white group-hover:text-slate-100' : 'text-slate-900 group-hover:text-slate-800'}`}>
        <TranslatedTextBlock
          itemId={itemKey}
          originalText={debate.title}
          maxLines={6}
        />
      </h2>

      {/* Quoted Reference Post / Statement (if this debate was started from a Post) */}
      {debate.referencePost && (
        <div className="mb-3">
          <ReferencePostCard
            reference={debate.referencePost}
            compact
            onOpenOriginalPost={onOpenOriginalPost}
          />
        </div>
      )}

      {/* Optional Image Attachment (e.g. Infographic / Survey Graph) */}
      {debate.imageUrl && (
        <div className={`mb-3 rounded-xl overflow-hidden border max-h-72 flex flex-col ${
          isDark ? 'border-[#161f36] bg-[#03060c]' : 'border-slate-200 bg-slate-50'
        }`}>
          <img
            src={debate.imageUrl}
            alt={debate.title}
            className="w-full h-auto object-cover max-h-64 rounded-t-xl"
            loading="lazy"
          />
          {displayCaption && (
            <p className={`px-3 py-1.5 text-[11px] border-t truncate ${
              isDark ? 'text-slate-400 bg-[#060a14] border-[#141b2e]' : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}>
              {displayCaption}
            </p>
          )}
        </div>
      )}

      {/* Poll Bar: Smooth gradient with subtle glow in ambient mode; 2 solid colors with NO gradient when ambient is off */}
      <div className="relative mb-3">
        {ambientEnabled ? (
          <>
            {/* Diffused ambient glow behind the bar (subtle) */}
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-20 pointer-events-none transition-all duration-500"
              style={{
                background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(0, forPercent - 12)}%, #7c3aed ${forPercent}%, #f43f5e ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
              }}
            />
            <div className={`relative h-2 w-full rounded-full overflow-hidden p-[1px] shadow-inner ${isDark ? 'bg-[#0c101d]' : 'bg-slate-200'}`}>
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
          <div className={`relative h-2 w-full rounded-full overflow-hidden shadow-inner flex ${isDark ? 'bg-[#0c101d]' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-[#0284c7] transition-all duration-300"
              style={{ width: `${forPercent}%` }}
              title={`${forPercent}% ${t('for')}`}
            />
            <div
              className="h-full bg-[#be123c] transition-all duration-300"
              style={{ width: `${againstPercent}%` }}
              title={`${againstPercent}% ${t('against')}`}
            />
          </div>
        )}
      </div>

      {/* Bottom Row: Compact Status & Clean Action Icons with Like, Replies, Share & Anonymous Report */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        {/* For vs Against Status with k/m numbers */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs flex-wrap tabular-nums">
          <span className={`text-[#0284c7] dark:text-[#38bdf8] font-bold inline-flex items-center gap-1 whitespace-nowrap ${userVote === 'for' ? 'underline decoration-2 underline-offset-4' : ''}`}>
            {userVote === 'for' && <Check className="w-3 h-3 stroke-[3]" />}
            {formatCompactNumber(debate.forVotes)} {t('for')} ({forPercent}%)
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>·</span>
          <span className={`text-[#be123c] dark:text-[#fb7185] font-bold inline-flex items-center gap-1 whitespace-nowrap ${userVote === 'against' ? 'underline decoration-2 underline-offset-4' : ''}`}>
            {userVote === 'against' && <Check className="w-3 h-3 stroke-[3]" />}
            {formatCompactNumber(debate.againstVotes)} {t('against')} ({againstPercent}%)
          </span>
        </div>

        {/* Action icons: Like, Replies, Share & Anonymous Report (Ergonomic touch targets) */}
        <div className={`flex items-center gap-2 sm:gap-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {/* Interactive Post Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike?.(debate.id);
            }}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-500 hover:bg-rose-500/10'
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(debate);
            }}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isDark ? 'hover:text-slate-200 hover:bg-white/[0.05]' : 'hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={t('arguments')}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono text-xs">
              {formatCompactNumber(argumentsList.length)}
            </span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              isDark ? 'hover:text-slate-200 hover:bg-white/[0.05]' : 'hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={t('share')}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Anonymous Report button */}
          {onReportDebate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReportDebate(debate);
              }}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isReported
                  ? 'text-amber-500 font-semibold bg-amber-500/10'
                  : isDark
                  ? 'hover:text-rose-400 hover:bg-rose-500/10'
                  : 'hover:text-rose-600 hover:bg-rose-50'
              }`}
              title={
                isReported
                  ? 'Flagged anonymously for moderation'
                  : 'Report debate anonymously (zero identity link)'
              }
            >
              <Flag className={`w-3.5 h-3.5 ${isReported ? 'fill-amber-500/30' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-mono">
                {isReported ? 'Reported' : 'Report'}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

