import React, { useState, useEffect } from 'react';
import { ModerationReportReason, AnonymousModerationReport } from '../types';
import {
  Flag,
  X,
  ShieldCheck,
  VenetianMask,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export interface ReportTargetInfo {
  targetType: 'debate' | 'argument' | 'post' | 'post_comment';
  targetId: string;
  debateId: string;
  targetPreview: string;
  targetAuthorHandle?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  target: ReportTargetInfo | null;
  onClose: () => void;
  onSubmitReport: (report: AnonymousModerationReport) => void;
}

const REPORT_REASONS: Array<{
  id: ModerationReportReason;
  label: string;
  description: string;
}> = [
  {
    id: 'hate_speech',
    label: 'Hate Speech or Communal Abuse',
    description: 'Slurs, communal incitement, caste/religious hatred, or dehumanizing language.',
  },
  {
    id: 'harassment',
    label: 'Harassment, Threats, or Bullying',
    description: 'Targeted abuse, threats of violence, illegal content, or intimidation.',
  },
  {
    id: 'doxxing_privacy',
    label: 'Doxxing / Exposing Private Identity',
    description: 'Attempting to reveal real names, phone numbers, addresses, or trace anonymous users.',
  },
  {
    id: 'misinformation',
    label: 'Dangerous Misinformation or Doctored Media',
    description: 'Fabricated quotes, manipulated images, or harmful unverified claims.',
  },
  {
    id: 'copyright',
    label: 'Copyright or Intellectual Property Infringement',
    description: 'Unauthorized reproduction of copyrighted text, images, or video.',
  },
  {
    id: 'spam',
    label: 'Spam, Bot Activity, or Off-Topic',
    description: 'Repetitive promotional links, automated flooding, or derailing the discussion.',
  },
  {
    id: 'other',
    label: 'Other Moderation Concern',
    description: 'Violates community guidelines for constructive 180° public discourse.',
  },
];

function getTargetLabel(targetType: ReportTargetInfo['targetType']): string {
  switch (targetType) {
    case 'debate':
      return 'Debate Proposition';
    case 'argument':
      return 'Argument';
    case 'post':
      return 'Post';
    case 'post_comment':
      return 'Post Comment';
  }
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  target,
  onClose,
  onSubmitReport,
}) => {
  const { isDark } = useTheme();
  const [selectedReason, setSelectedReason] = useState<ModerationReportReason>('hate_speech');
  const [details, setDetails] = useState('');
  const [submittedReport, setSubmittedReport] = useState<AnonymousModerationReport | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason('hate_speech');
      setDetails('');
      setSubmittedReport(null);
    }
  }, [isOpen, target?.targetId]);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct a 100% untraceable report payload with ZERO user/account/handle fields
    const cleanReport: AnonymousModerationReport = {
      id: `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      targetType: target.targetType,
      targetId: target.targetId,
      debateId: target.debateId,
      targetPreview: target.targetPreview.slice(0, 280),
      reason: selectedReason,
      ...(details.trim() ? { details: details.trim().slice(0, 500) } : {}),
      createdAt: new Date().toISOString(),
    };

    onSubmitReport(cleanReport);
    setSubmittedReport(cleanReport);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl overflow-hidden transition-all pb-safe ${
          isDark
            ? 'bg-[#070a14] border-[#182238] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-500/40" />
        </div>

        {/* Modal Header */}
        <div
          className={`px-4 sm:px-5 py-3.5 sm:py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#141d30] bg-[#0a0f1d]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                Report {getTargetLabel(target.targetType)}
              </h3>
              <p className={`text-[11px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                100% Untraceable · Zero Identity Link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedReport ? (
          /* Confirmation Receipt State */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold">
                Flagged Anonymously for Moderation
              </h4>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Thank you for keeping EVAAD constructive. This report was submitted with{' '}
                <strong className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
                  zero link to your account, real name, or anonymous handle
                </strong>
                .
              </p>
            </div>

            {/* Untraceable Payload Verification Box */}
            <div
              className={`text-left rounded-xl p-3.5 border text-xs font-mono space-y-1 ${
                isDark
                  ? 'bg-[#04070e] border-emerald-500/25 text-slate-300'
                  : 'bg-emerald-50/60 border-emerald-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Report Receipt ID:</span>
                <span className="font-bold text-emerald-400">#{submittedReport.id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Target Type:</span>
                <span className="uppercase">{submittedReport.targetType}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Reporter Identity Stored:</span>
                <span className="text-emerald-400 font-bold">NONE (Stripped & Untraceable)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs tracking-wide transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Zero-Traceability Guarantee Banner */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                isDark
                  ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <VenetianMask className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Blind Moderation Guarantee:</span> Your Google UID, Posts{' '}
                <span className="font-mono">@username</span>, real name, and anonymous Debate handle are{' '}
                <span className="underline decoration-dotted">never included</span> in this report record.
              </div>
            </div>

            {/* Preview of Content Being Flagged */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                isDark
                  ? 'bg-[#04070e] border-[#151e32] text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-mono text-slate-400">
                <span>
                  Flagging {getTargetLabel(target.targetType)}
                  {target.targetAuthorHandle ? ` by ${target.targetAuthorHandle}` : ''}
                </span>
                <Lock className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="line-clamp-2 italic">"{target.targetPreview}"</p>
            </div>

            {/* Select Reason */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Reason for Moderation
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((item) => {
                  const active = selectedReason === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setSelectedReason(item.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? isDark
                            ? 'bg-rose-500/15 border-rose-500/50 text-white'
                            : 'bg-rose-50 border-rose-300 text-slate-900'
                          : isDark
                          ? 'bg-[#0b101e] border-[#162038] text-slate-300 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="moderation_reason"
                        checked={active}
                        onChange={() => setSelectedReason(item.id)}
                        className="mt-1 accent-rose-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Additional Context */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Additional Context (Optional — Do not include personal info)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Briefly explain why this violates community standards..."
                className={`w-full rounded-xl p-2.5 text-xs transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-[#04070e] border border-[#162038] text-white placeholder-slate-500 focus:border-rose-500/60'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-400'
                }`}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Submit Anonymous Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
