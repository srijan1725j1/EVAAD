import React from 'react';
import { Argument, AuthenticityResult } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, X, Loader2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatedTextBlock } from './TranslatedTextBlock';

interface AuthenticityModalProps {
  argument: Argument | null;
  result: AuthenticityResult | null;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

export const AuthenticityModal: React.FC<AuthenticityModalProps> = ({
  argument,
  result,
  isLoading,
  error,
  onClose,
  onRetry,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  if (!argument) return null;

  const getVerdictStyle = (verdict?: string) => {
    switch (verdict) {
      case 'Verified Authentic':
        return {
          bg: isDark
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        };
      case 'Mostly Accurate':
        return {
          bg: isDark
            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
            : 'bg-cyan-50 border-cyan-200 text-cyan-800',
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />,
        };
      case 'Questionable / Unverified':
        return {
          bg: isDark
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        };
      case 'False or Misleading':
      default:
        return {
          bg: isDark
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            : 'bg-rose-50 border-rose-200 text-rose-800',
          icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
        };
    }
  };

  const style = getVerdictStyle(result?.verdict);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-[#0a0d16] border-[#1e273e] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-[#172033] bg-[#0c101c]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Sparkles className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AI {t('factCheck')}
              </h3>
              <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Grounded with real-time Google Search
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRetry && !isLoading && (
              <button
                onClick={onRetry}
                title="Re-run verification"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Inspected Comment Card */}
          <div
            className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  argument.side === 'for'
                    ? 'bg-sky-500/15 text-sky-500'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {argument.side === 'for' ? t('for') : t('against')}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {argument.author.handle}
              </span>
            </div>
            <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <TranslatedTextBlock
                itemId={`factcheck_arg_${argument.id}`}
                originalText={argument.content}
                maxLines={6}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              <div className="space-y-1">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verifying facts across public web sources...
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Evaluating claims against factual databases
                </p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Verdict Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${style.bg}`}>
                <div className="flex items-center gap-3">
                  {style.icon}
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider opacity-75 block">
                      VERDICT
                    </span>
                    <span className="font-semibold text-sm">{result.verdict}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono opacity-75 uppercase block">Truth Score</span>
                  <div className="flex items-baseline gap-0.5 justify-end">
                    <span className="text-xl font-bold font-mono">{result.score}</span>
                    <span className="text-xs opacity-60 font-mono">/100</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2">
                <h4 className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Factuality Analysis
                </h4>
                <div
                  className={`text-xs leading-relaxed p-3.5 rounded-xl border ${
                    isDark
                      ? 'text-slate-300 bg-[#0e1322] border-[#1b233a]'
                      : 'text-slate-700 bg-slate-50 border-slate-200'
                  }`}
                >
                  <TranslatedTextBlock
                    itemId={`factcheck_analysis_${argument.id}`}
                    originalText={result.analysis}
                    maxLines={12}
                  />
                </div>
              </div>

              {/* Grounding Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider font-mono flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>Google Search Grounding Sources</span>
                    <span className="text-[10px] opacity-75">{result.sources.length} cited</span>
                  </h4>
                  <div className="space-y-1.5">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-2 rounded-lg border transition-colors group cursor-pointer ${
                          isDark
                            ? 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <span className={`text-xs truncate pr-2 ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                          {source.title || source.url}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : error ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-rose-500">Fact Check Could Not Be Completed</p>
                <p className={`text-xs max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click check to verify the factual authenticity of this comment.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between ${
            isDark ? 'border-[#172033] bg-[#0c101c]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Verified via Real-Time Grounding
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
