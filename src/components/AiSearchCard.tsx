import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Plus, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedTextBlock } from './TranslatedTextBlock';

export interface AiSearchSynthesis {
  framedQuestion: string;
  contextSummary: string;
  forPoints: string[];
  againstPoints: string[];
  suggestedTags: string[];
  estimatedForPercent: number;
}

interface AiSearchCardProps {
  query: string;
  matchingCount: number;
  onLaunchDebate: (synthesis: AiSearchSynthesis) => void;
}

export const AiSearchCard: React.FC<AiSearchCardProps> = ({
  query,
  matchingCount,
  onLaunchDebate,
}) => {
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const [synthesis, setSynthesis] = useState<AiSearchSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const cleanQuery = query.trim();

  const fetchAiSearch = async (searchStr: string) => {
    if (searchStr.length < 2) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchStr,
          targetLang: language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.framedQuestion) {
          setSynthesis(data);
        }
      }
    } catch (err) {
      console.warn('AI search synthesis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cleanQuery.length < 2) {
      setSynthesis(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchAiSearch(cleanQuery);
    }, 480);

    return () => clearTimeout(timer);
  }, [cleanQuery, language]);

  if (cleanQuery.length < 2) return null;

  const forPct = synthesis?.estimatedForPercent ?? 52;
  const againstPct = 100 - forPct;

  return (
    <div
      className={`mb-4 sm:rounded-2xl border-t border-b sm:border overflow-hidden transition-all ${
        isDark
          ? 'bg-gradient-to-b from-[#090f1e] to-[#060810] border-[#1d2842]'
          : 'bg-gradient-to-b from-sky-50/60 to-white border-sky-200/80 shadow-xs'
      }`}
    >
      {/* Top Bar */}
      <div
        className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 ${
          isDark ? 'border-[#162038] bg-[#0b1224]/80' : 'border-sky-100 bg-sky-50/80'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-sky-500/15 text-sky-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className={`text-xs font-bold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            AI Search Result & 180° Perspectives
          </span>
          <span className={`text-[10px] font-mono hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            · "{cleanQuery}" ({matchingCount} in feed)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchAiSearch(cleanQuery)}
            disabled={isLoading}
            title="Refresh AI Search"
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-200/60'
            }`}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-3.5">
          {isLoading && !synthesis ? (
            <div className="py-6 flex items-center justify-center gap-2.5 text-xs text-sky-400 font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing both sides of "{cleanQuery}"...</span>
            </div>
          ) : synthesis ? (
            <>
              {/* Framed Debate Question + Launch CTA */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 font-semibold">
                      AI Framed Motion
                    </span>
                    {synthesis.suggestedTags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className={`text-base sm:text-lg font-extrabold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <TranslatedTextBlock
                      itemId={`aisearch_q_${cleanQuery}`}
                      originalText={synthesis.framedQuestion}
                      maxLines={4}
                    />
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {synthesis.contextSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchDebate(synthesis)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 hover:from-sky-400 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Start Live Debate</span>
                </button>
              </div>

              {/* Estimated Public Pulse Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#0284c7] dark:text-[#38bdf8] font-bold">
                    {forPct}% {t('for')} (Estimated Pulse)
                  </span>
                  <span className="text-[#be123c] dark:text-[#fb7185] font-bold">
                    {againstPct}% {t('against')}
                  </span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden p-[1px] ${isDark ? 'bg-[#0c101d]' : 'bg-slate-200'}`}>
                  <div
                    className="h-full w-full rounded-full transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, #0284c7 0%, #0ea5e9 ${Math.max(0, forPct - 12)}%, #6366f1 ${forPct}%, #e11d48 ${Math.min(100, forPct + 12)}%, #9f1239 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Side-by-Side For vs Against Key Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* FOR Column */}
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-sky-950/15 border-sky-500/20' : 'bg-sky-50/70 border-sky-200/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0284c7] dark:text-[#38bdf8] uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('keyArgsFor')}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {synthesis.forPoints.map((pt, i) => (
                      <li key={i} className={`flex items-start gap-1.5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AGAINST Column */}
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-rose-950/15 border-rose-500/20' : 'bg-rose-50/70 border-rose-200/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#be123c] dark:text-[#fb7185] uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t('keyArgsAgainst')}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {synthesis.againstPoints.map((pt, i) => (
                      <li key={i} className={`flex items-start gap-1.5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
