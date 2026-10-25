import React from 'react';
import { Argument, AuthenticityResult } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthenticityModalProps {
  argument: Argument | null;
  result: AuthenticityResult | null;
  isLoading: boolean;
  onClose: () => void;
}

export const AuthenticityModal: React.FC<AuthenticityModalProps> = ({
  argument,
  result,
  isLoading,
  onClose,
}) => {
  if (!argument) return null;

  const getVerdictStyle = (verdict?: string) => {
    switch (verdict) {
      case 'Verified Authentic':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        };
      case 'Mostly Accurate':
        return {
          bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
        };
      case 'Questionable / Unverified':
        return {
          bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'False or Misleading':
      default:
        return {
          bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
          badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        };
    }
  };

  const style = getVerdictStyle(result?.verdict);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0d16] border border-[#1e273e] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#172033] bg-[#0c101c]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Authenticity & Fact Check</h3>
              <p className="text-[11px] text-slate-400 font-mono">Grounded with real-time Google Search</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Inspected Comment Card */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                argument.side === 'for' ? 'bg-sky-500/20 text-sky-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {argument.side === 'for' ? 'FOR ARGUMENT' : 'AGAINST ARGUMENT'}
              </span>
              <span className="text-xs text-slate-400">by @{argument.author.handle}</span>
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{argument.content}"
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Verifying facts across public web sources...</p>
                <p className="text-xs text-slate-400">Gemini is evaluating claims against factual databases</p>
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
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Factuality Analysis
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed space-y-2 p-3.5 rounded-xl bg-[#0e1322] border border-[#1b233a]">
                  {result.analysis.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Grounding Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                    <span>Google Search Grounding Sources</span>
                    <span className="text-[10px] text-slate-500">{result.sources.length} cited</span>
                  </h4>
                  <div className="space-y-1.5">
                    {result.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors group cursor-pointer"
                      >
                        <span className="text-xs text-slate-300 group-hover:text-white truncate pr-2">
                          {source.title || source.url}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              Click check to verify the factual authenticity of this comment.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#172033] bg-[#0c101c] flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Model: gemini-3.8-flash with Google Grounding
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
