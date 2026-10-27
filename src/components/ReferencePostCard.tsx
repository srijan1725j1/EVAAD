import React from 'react';
import { ReferencePostEmbed } from '../types';
import { Quote, ExternalLink, Play } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatRelativeTime } from '../utils/format';
import { TranslatedTextBlock } from './TranslatedTextBlock';

interface ReferencePostCardProps {
  reference: ReferencePostEmbed;
  compact?: boolean;
  onOpenOriginalPost?: (postId: string) => void;
}

export const ReferencePostCard: React.FC<ReferencePostCardProps> = ({
  reference,
  compact = false,
  onOpenOriginalPost,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      onClick={(e) => {
        if (onOpenOriginalPost) {
          e.stopPropagation();
          onOpenOriginalPost(reference.postId);
        }
      }}
      className={`rounded-xl border p-3 transition-all ${
        onOpenOriginalPost ? 'cursor-pointer' : ''
      } ${
        isDark
          ? 'bg-[#0b1020]/90 border-sky-500/25 hover:border-sky-500/45'
          : 'bg-slate-50/90 border-sky-200 hover:border-sky-300'
      }`}
    >
      {/* Top Badge: Referenced Post / Statement */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 dark:text-sky-400 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
            <Quote className="w-2.5 h-2.5" />
            Referenced Post
          </span>

          <div
            className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0"
            style={{ backgroundColor: reference.authorAvatarColor || '#0284c7' }}
          >
            {reference.authorInitials || 'P'}
          </div>

          <span
            className={`text-xs font-bold truncate ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {reference.authorHandle || reference.authorName}
          </span>

          {reference.speakerLabel && (
            <span
              className={`hidden sm:inline text-[11px] truncate ${
                isDark ? 'text-amber-300/90' : 'text-amber-700'
              }`}
            >
              · {reference.speakerLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-mono ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {formatRelativeTime(reference.createdAt)}
          </span>
          {onOpenOriginalPost && (
            <span
              title="View original post in Posts section"
              className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold ${
                isDark ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Quoted Statement / Post Content */}
      <div
        className={`text-xs sm:text-[13px] leading-relaxed italic ${
          isDark ? 'text-slate-200' : 'text-slate-700'
        }`}
      >
        <TranslatedTextBlock
          itemId={`ref_post_${reference.postId}`}
          originalText={reference.content}
          maxLines={compact ? 3 : 6}
        />
      </div>

      {/* Optional Media Preview */}
      {!compact && reference.imageUrl && (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-[#182238] max-h-44">
          <img
            src={reference.imageUrl}
            alt="Referenced attachment"
            className="w-full h-auto max-h-44 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {!compact && reference.videoUrl && (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-[#182238] bg-black">
          <video
            src={reference.videoUrl}
            controls
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-48 object-contain"
          />
        </div>
      )}

      {compact && reference.videoUrl && (
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-sky-400">
          <Play className="w-2.5 h-2.5 fill-sky-400" />
          Contains Video Statement
        </div>
      )}
    </div>
  );
};
