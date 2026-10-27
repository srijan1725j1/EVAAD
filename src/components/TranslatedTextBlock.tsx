import React, { useEffect } from 'react';
import { Globe, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ExpandableText } from './ExpandableText';

interface TranslatedTextBlockProps {
  itemId: string;
  originalText: string;
  maxLines?: number;
  className?: string;
  toggleClassName?: string;
}

export const TranslatedTextBlock: React.FC<TranslatedTextBlockProps> = ({
  itemId,
  originalText,
  maxLines = 6,
  className = '',
  toggleClassName = '',
}) => {
  const { isDark } = useTheme();
  const {
    language,
    currentLanguageObj,
    t,
    registerTextsForTranslation,
    getTranslatedEntry,
    isShowingOriginal,
    toggleShowOriginal,
  } = useLanguage();

  useEffect(() => {
    if (originalText && originalText.trim()) {
      registerTextsForTranslation([originalText]);
    }
  }, [originalText, language, registerTextsForTranslation]);

  const entry = getTranslatedEntry(originalText);
  const showingOriginal = isShowingOriginal(itemId);

  const hasTranslatedVersion =
    Boolean(entry?.translatedText) &&
    entry!.translatedText.trim().toLowerCase() !== originalText.trim().toLowerCase();

  // Display translated text when not toggled to original
  const displayText =
    showingOriginal || !entry?.translatedText ? originalText : entry.translatedText;

  return (
    <div className={className}>
      <ExpandableText text={displayText} maxLines={maxLines} />

      {/* Small "See original" / "See translation" option on every post and comment */}
      <div className={`mt-1 flex items-center gap-2 ${toggleClassName}`}>
        <button
          type="button"
          onClick={(e) => toggleShowOriginal(itemId, e)}
          className={`inline-flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer select-none py-0.5 px-1.5 rounded-md border ${
            showingOriginal
              ? isDark
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25'
                : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              : isDark
              ? 'bg-white/[0.02] text-slate-400 hover:text-sky-300 border-white/[0.06] hover:border-sky-500/30'
              : 'bg-slate-50 text-slate-500 hover:text-sky-700 border-slate-200 hover:border-sky-300'
          }`}
          title={
            showingOriginal
              ? `${t('seeTranslation')} (${currentLanguageObj.nativeName})`
              : t('seeOriginal')
          }
        >
          {showingOriginal ? (
            <>
              <RotateCcw className="w-2.5 h-2.5 shrink-0" />
              <span>
                {hasTranslatedVersion || language !== 'en'
                  ? `${t('seeTranslation')} (${currentLanguageObj.shortLabel})`
                  : t('showingOriginal')}
              </span>
            </>
          ) : (
            <>
              <Globe className="w-2.5 h-2.5 shrink-0 opacity-80" />
              <span>{t('seeOriginal')}</span>
            </>
          )}
        </button>

        {showingOriginal && (
          <span
            className={`text-[10px] font-mono italic ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            ({t('showingOriginal')})
          </span>
        )}
      </div>
    </div>
  );
};
