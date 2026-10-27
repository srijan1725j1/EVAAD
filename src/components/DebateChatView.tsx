import React, { useState, useMemo, useEffect } from 'react';
import { Debate, Argument, SortFilter, Author, AuthenticityResult, DebateSummary } from '../types';
import { sortAndInterleaveArguments } from '../utils/sorting';
import { formatCompactNumber, formatRelativeTime } from '../utils/format';
import { copyToClipboard, getShareUrl } from '../utils/clipboard';
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
  Settings as SettingsIcon,
  Edit3,
  Trash2,
  CheckCheck,
  CornerDownRight,
  X,
  VenetianMask,
  Flag,
} from 'lucide-react';
import { ExpandableText } from './ExpandableText';
import { TranslatedTextBlock } from './TranslatedTextBlock';
import { LanguageSelectorButton } from './LanguageSelectorButton';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { AuthenticityModal } from './AuthenticityModal';
import { DebateAiDrawer } from './DebateAiDrawer';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';
import { EditDebateModal } from './EditDebateModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { EvaadLogo } from './EvaadLogo';
import { ReferencePostCard } from './ReferencePostCard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DebateChatViewProps {
  debate: Debate;
  argumentsList: Argument[];
  currentAuthor: Author;
  ambientEnabled: boolean;
  userVote?: 'for' | 'against';
  isDebateLiked?: boolean;
  userArgLikes: Record<string, boolean>;
  reportedItems?: Record<string, boolean>;
  onBack: () => void;
  onVote: (side: 'for' | 'against') => void;
  onToggleDebateLike?: (debateId: string) => void;
  onToggleArgLike: (argumentId: string) => void;
  onReportDebate?: (debate: Debate) => void;
  onReportArgument?: (arg: Argument) => void;
  onToggleAmbient: () => void;
  onAddArgument: (side: 'for' | 'against', content: string) => void;
  onUpdateArgumentAuthenticity?: (argumentId: string, result: AuthenticityResult) => void;
  onUpdateDebateSummary?: (summary: DebateSummary) => void;
  onEditDebate?: (debateId: string, data: { title: string; tags: string[]; imageCaption?: string }) => Promise<void>;
  onDeleteDebate?: (debateId: string) => Promise<void>;
  onEditArgument?: (argumentId: string, newContent: string) => Promise<void>;
  onDeleteArgument?: (argumentId: string) => Promise<void>;
  onOpenSettings?: () => void;
  onOpenOriginalPost?: (postId: string) => void;
  headerNotificationSlot?: React.ReactNode;
}

export const DebateChatView: React.FC<DebateChatViewProps> = ({
  debate,
  argumentsList,
  currentAuthor,
  ambientEnabled,
  userVote,
  isDebateLiked = false,
  userArgLikes,
  reportedItems = {},
  onBack,
  onVote,
  onToggleDebateLike,
  onToggleArgLike,
  onReportDebate,
  onReportArgument,
  onToggleAmbient,
  onAddArgument,
  onUpdateArgumentAuthenticity,
  onUpdateDebateSummary,
  onEditDebate,
  onDeleteDebate,
  onEditArgument,
  onDeleteArgument,
  onOpenSettings,
  onOpenOriginalPost,
  headerNotificationSlot,
}) => {
  const { isDark } = useTheme();
  const { language, t, registerTextsForTranslation, getTranslatedEntry, isShowingOriginal } = useLanguage();
  const [filter, setFilter] = useState<SortFilter>('alternating');
  const [selectedSide, setSelectedSide] = useState<'for' | 'against'>('for');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedDebate, setCopiedDebate] = useState(false);
  const [copiedArgId, setCopiedArgId] = useState<string | null>(null);
  const [highlightedArgId, setHighlightedArgId] = useState<string | null>(null);

  // Authenticity checking state
  const [selectedArgForCheck, setSelectedArgForCheck] = useState<Argument | null>(null);
  const [activeCheckResult, setActiveCheckResult] = useState<AuthenticityResult | null>(null);
  const [isCheckingAuthenticity, setIsCheckingAuthenticity] = useState(false);
  const [authenticityError, setAuthenticityError] = useState<string | null>(null);

  // AI Summary Drawer (triggered by the AI Insights button on post)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Modals for Edit & Delete
  const [isEditDebateOpen, setIsEditDebateOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemType: 'post' | 'comment';
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Inline editing for comments
  const [editingArgId, setEditingArgId] = useState<string | null>(null);
  const [editingArgContent, setEditingArgContent] = useState('');
  const [isSavingArgEdit, setIsSavingArgEdit] = useState(false);

  // Direct Reply / Challenge state
  const [replyingToArg, setReplyingToArg] = useState<Argument | null>(null);

  // Auto-scroll and highlight target argument if deep-linked via URL (?arg=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetArgId = urlParams.get('arg');
    if (targetArgId) {
      setHighlightedArgId(targetArgId);

      // If current filter hides this argument, switch to alternating so it is displayed
      const targetArg = argumentsList.find((a) => a.id === targetArgId);
      if (targetArg && filter !== 'alternating' && filter !== 'live') {
        if (filter !== targetArg.side) {
          setFilter('alternating');
        }
      }

      const scrollTimer = setTimeout(() => {
        const el = document.getElementById(`arg-${targetArgId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);

      const clearHighlightTimer = setTimeout(() => {
        setHighlightedArgId(null);
      }, 4500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearHighlightTimer);
      };
    }
  }, [argumentsList, filter]);

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

  const displayedArguments = useMemo(() => {
    return sortAndInterleaveArguments(argumentsList, filter);
  }, [argumentsList, filter]);

  const forArgsCount = argumentsList.filter((a) => a.side === 'for').length;
  const againstArgsCount = argumentsList.filter((a) => a.side === 'against').length;

  const totalVotes = debate.forVotes + debate.againstVotes;
  const forPercent =
    totalVotes > 0 ? Math.round((debate.forVotes / totalVotes) * 100) : 50;
  const againstPercent = 100 - forPercent;

  // Check if current user is debate author
  const isDebateAuthor = Boolean(
    (debate.author.uid && currentAuthor.uid && debate.author.uid === currentAuthor.uid) ||
      (debate.author.handle && currentAuthor.handle && debate.author.handle === currentAuthor.handle) ||
      (!debate.author.uid && debate.author.name === currentAuthor.name)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    let finalContent = content.trim();
    if (replyingToArg) {
      const snippet = replyingToArg.content.replace(/\s+/g, ' ').slice(0, 80);
      finalContent = `↪ ${replyingToArg.author.handle} ("${snippet}${replyingToArg.content.length > 80 ? '…' : ''}"):\n${finalContent}`;
    }
    onAddArgument(selectedSide, finalContent);
    setContent('');
    setReplyingToArg(null);
  };

  const handleShareDebate = async () => {
    const url = getShareUrl(debate.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setCopiedDebate(true);
      setTimeout(() => {
        setCopied(false);
        setCopiedDebate(false);
      }, 2000);
    }
  };

  const handleShareArgument = async (argId: string) => {
    const url = getShareUrl(debate.id, argId);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedArgId(argId);
      setTimeout(() => {
        setCopiedArgId((curr) => (curr === argId ? null : curr));
      }, 2000);
    }
  };

  const handleShare = () => {
    handleShareDebate();
  };

  const handleCheckAuthenticity = async (arg: Argument, forceRefresh = false) => {
    setSelectedArgForCheck(arg);
    setAuthenticityError(null);

    if (arg.authenticityCheck && !forceRefresh) {
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
          targetLang: language,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Verification failed. Please check your internet connection.');
      }

      const result: AuthenticityResult = await res.json();
      setActiveCheckResult(result);
      if (onUpdateArgumentAuthenticity) {
        onUpdateArgumentAuthenticity(arg.id, result);
      }
    } catch (err: any) {
      console.error('Authenticity check error:', err);
      setAuthenticityError(err.message || 'Could not verify argument authenticity.');
    } finally {
      setIsCheckingAuthenticity(false);
    }
  };

  // Argument edit handlers
  const handleStartEditArg = (arg: Argument) => {
    setEditingArgId(arg.id);
    setEditingArgContent(arg.content);
  };

  const handleCancelEditArg = () => {
    setEditingArgId(null);
    setEditingArgContent('');
  };

  const handleSaveEditArg = async (argId: string) => {
    if (!editingArgContent.trim() || !onEditArgument) return;
    setIsSavingArgEdit(true);
    try {
      await onEditArgument(argId, editingArgContent.trim());
      setEditingArgId(null);
    } catch (err) {
      console.error('Failed to edit argument:', err);
    } finally {
      setIsSavingArgEdit(false);
    }
  };

  // Argument delete handler
  const handleDeleteArgClick = (argId: string) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete Comment',
      message: 'Are you sure you want to permanently delete this argument comment?',
      itemType: 'comment',
      onConfirm: async () => {
        if (onDeleteArgument) {
          await onDeleteArgument(argId);
        }
      },
    });
  };

  // Debate delete handler
  const handleDeleteDebateClick = () => {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete Debate',
      message: 'Are you sure you want to permanently delete this debate proposition? All arguments in this debate will be removed.',
      itemType: 'post',
      onConfirm: async () => {
        if (onDeleteDebate) {
          await onDeleteDebate(debate.id);
          onBack();
        }
      },
    });
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
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Background Ambient Glow (soft & subtle) */}
      {ambientEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[160px] opacity-[0.08] transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)' }}
          />
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[160px] opacity-[0.08] transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #be123c 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* Top Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-3 sm:px-5 py-2 sm:py-3 transition-colors ${
        isDark ? 'bg-black/90 border-[#141928]' : 'bg-white/90 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 py-1 pr-2 rounded-xl text-sm transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-300 hover:text-white active:bg-white/5' : 'text-slate-600 hover:text-slate-900 active:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <EvaadLogo size={22} textSize="font-bold text-base sm:text-lg tracking-tight" />
          </button>

          {/* Right Header: Views + Args + Language + Settings + Share */}
          <div className={`flex items-center gap-1 sm:gap-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {/* Download / Install App Button (hidden on mobile inside post view) */}
            <div className="hidden md:inline-flex">
              <PWAInstallButton />
            </div>

            {/* Ambient Toggle Button (hidden on mobile inside post view) */}
            <button
              onClick={onToggleAmbient}
              title="Toggle Ambient Glow"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                ambientEnabled
                  ? isDark
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                  : isDark
                  ? 'bg-white/[0.04] text-slate-400 border border-transparent hover:text-white'
                  : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{t('ambient')}</span>
            </button>

            <span className="hidden lg:inline whitespace-nowrap tabular-nums">
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formatCompactNumber(debate.views)}</strong> {t('views')}
            </span>
            <span className="hidden lg:inline">·</span>
            <span className="hidden lg:inline whitespace-nowrap tabular-nums">
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formatCompactNumber(argumentsList.length)}</strong> {t('args')}
            </span>

            {/* Language Selector Dropdown */}
            <LanguageSelectorButton />

            {/* Notification Bell Slot */}
            {headerNotificationSlot}

            {/* Anonymous Debate Persona Badge in top bar */}
            {onOpenSettings && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onOpenSettings}
                  className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800'
                  }`}
                  title={`100% Anonymous Debate Persona: ${currentAuthor.handle} · Click to customize`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                    style={{ backgroundColor: currentAuthor.avatarColor }}
                  >
                    {currentAuthor.initials}
                  </div>
                  <VenetianMask className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden md:inline text-xs font-mono truncate max-w-[95px]">
                    {currentAuthor.handle}
                  </span>
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>
              </div>
            )}

            {/* Quick Share button in top bar */}
            <button
              onClick={handleShareDebate}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-full transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                copiedDebate
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50'
                  : isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={t('share')}
            >
              {copiedDebate ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">{t('share')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-2.5 sm:px-4 md:px-6 pt-3 sm:pt-5 pb-40 sm:pb-36 flex-1 flex flex-col relative z-10">
        {/* Main Debate Card Header with Subtle Ambient Glow */}
        <div className="relative mb-4 sm:mb-5">
          {ambientEnabled && (
            <div
              className="absolute -inset-2 sm:-inset-4 rounded-3xl blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700 opacity-[0.07]"
              style={{
                background: `radial-gradient(ellipse at 25% 50%, #0284c7, transparent 70%), radial-gradient(ellipse at 75% 50%, #be123c, transparent 70%)`,
              }}
            />
          )}

          <div className={`relative rounded-2xl p-3.5 sm:p-5 shadow-sm backdrop-blur-sm border ${
            isDark
              ? 'bg-[#060810]/95 border-[#141928]'
              : 'bg-white border-slate-200'
          }`}>
            {/* Author Row & Action Buttons (Stacks cleanly on mobile, side-by-side on desktop) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              {/* Author Info */}
              <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[7px] text-white shrink-0 opacity-80"
                    style={{ backgroundColor: debate.author.avatarColor }}
                  >
                    {debate.author.initials}
                  </div>

                  <span className={`text-xs font-medium truncate max-w-[130px] sm:max-w-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {debate.author.name}
                  </span>
                  {debate.author.handle &&
                    debate.author.handle !== debate.author.name &&
                    debate.author.handle !== `@${debate.author.name.replace(/^u\//, '')}` && (
                      <span className={`text-xs font-mono truncate hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {debate.author.handle}
                      </span>
                    )}
                  <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>·</span>
                  <span className={`text-xs font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatRelativeTime(debate.createdAt)}
                  </span>
                </div>

                {/* Mobile Author Actions (Edit & Delete) */}
                {isDebateAuthor && (
                  <div className="flex sm:hidden items-center gap-1">
                    <button
                      onClick={() => setIsEditDebateOpen(true)}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Edit debate"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteDebateClick}
                      className="p-1 rounded-md text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete debate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons Row: Desktop Edit/Delete + AI Insights + Like + Share */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Desktop Author actions: Edit & Delete Debate */}
                {isDebateAuthor && (
                  <div className="hidden sm:flex items-center gap-1 mr-1 border-r pr-2 border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setIsEditDebateOpen(true)}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Edit debate proposition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteDebateClick}
                      className="p-1 rounded-md text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete debate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* AI Insights Button */}
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer border ${
                    isDark
                      ? 'bg-sky-950/40 text-sky-300 hover:bg-sky-950/70 border-sky-800/40'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{t('aiInsights')}</span>
                </button>

                {/* Post Like Button on Header */}
                <button
                  onClick={() => onToggleDebateLike?.(debate.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                    isDebateLiked
                      ? 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                      : isDark
                      ? 'bg-[#090d18] text-slate-400 hover:text-slate-200 border-[#141e33]'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                  title={isDebateLiked ? 'Unlike debate post' : 'Like debate post'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-transform active:scale-125 shrink-0 ${
                      isDebateLiked ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span className="tabular-nums font-semibold">
                    {formatCompactNumber(debate.likes)}
                  </span>
                </button>

                {/* Debate Post Share Button */}
                <button
                  onClick={handleShareDebate}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                    copiedDebate
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50'
                      : isDark
                      ? 'bg-[#090d18] text-slate-400 hover:text-slate-200 border-[#141e33]'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                  title={t('share')}
                >
                  {copiedDebate ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] shrink-0" />
                      <span className="text-emerald-400 font-semibold">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('share')}</span>
                    </>
                  )}
                </button>

                {/* Anonymous Report Debate Button */}
                {onReportDebate && (
                  <button
                    type="button"
                    onClick={() => onReportDebate(debate)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                      reportedItems[debate.id]
                        ? 'bg-amber-950/40 text-amber-400 border-amber-700/50 font-semibold'
                        : isDark
                        ? 'bg-[#090d18] text-slate-400 hover:text-rose-400 border-[#141e33]'
                        : 'bg-slate-100 text-slate-600 hover:text-rose-600 border-slate-200'
                    }`}
                    title={
                      reportedItems[debate.id]
                        ? 'Flagged anonymously for moderation'
                        : 'Report debate anonymously (zero identity link)'
                    }
                  >
                    <Flag
                      className={`w-3.5 h-3.5 shrink-0 ${
                        reportedItems[debate.id] ? 'fill-amber-400/30 text-amber-400' : ''
                      }`}
                    />
                    <span>{reportedItems[debate.id] ? 'Reported' : 'Report'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Debate Proposition with Translation & "See original" toggle */}
            <h1 className={`text-lg sm:text-xl font-bold leading-snug mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <TranslatedTextBlock
                itemId={`view_debate_${debate.id}`}
                originalText={debate.title}
                maxLines={6}
              />
            </h1>

            {/* Quoted Reference Post / Statement (if this debate references a Post) */}
            {debate.referencePost && (
              <div className="mb-4">
                <ReferencePostCard
                  reference={debate.referencePost}
                  onOpenOriginalPost={onOpenOriginalPost}
                />
              </div>
            )}

            {/* Optional Image Attachment */}
            {debate.imageUrl && (
              <div className={`mb-4 rounded-xl overflow-hidden border max-h-96 flex flex-col ${
                isDark ? 'border-[#161f36] bg-[#03060c]' : 'border-slate-200 bg-slate-50'
              }`}>
                <img
                  src={debate.imageUrl}
                  alt={debate.title}
                  className="w-full h-auto object-contain max-h-96 rounded-t-xl"
                />
                {debate.imageCaption && (
                  <p className={`px-3.5 py-2 text-xs border-t ${
                    isDark ? 'text-slate-400 bg-[#060a14] border-[#141b2e]' : 'text-slate-600 bg-slate-100 border-slate-200'
                  }`}>
                    {isShowingOriginal(`view_debate_${debate.id}`)
                      ? debate.imageCaption
                      : getTranslatedEntry(debate.imageCaption)?.translatedText || debate.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Live Vote Poll Bar & 1-Tap Vote Buttons */}
            <div className={`pt-2.5 border-t ${isDark ? 'border-[#141928]' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-2 font-mono">
                <span className="text-[#0284c7] dark:text-[#38bdf8] font-bold">
                  {forPercent}% {t('for')} ({formatCompactNumber(debate.forVotes)} {t('votes')})
                </span>
                <span className="text-[#be123c] dark:text-[#fb7185] font-bold">
                  {againstPercent}% {t('against')} ({formatCompactNumber(debate.againstVotes)} {t('votes')})
                </span>
              </div>

              {/* Poll Bar */}
              <div className="relative mb-3.5">
                {ambientEnabled ? (
                  <>
                    <div
                      className="absolute -inset-1 rounded-full blur-md opacity-20 pointer-events-none transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(0, forPercent - 12)}%, #7c3aed ${forPercent}%, #f43f5e ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                      }}
                    />
                    <div className={`relative h-2.5 w-full rounded-full overflow-hidden p-[1px] shadow-inner ${isDark ? 'bg-[#0c101d]' : 'bg-slate-200'}`}>
                      <div
                        className="h-full w-full rounded-full transition-all duration-500"
                        style={{
                          background: `linear-gradient(90deg, #0284c7 0%, #0ea5e9 ${Math.max(0, forPercent - 12)}%, #6366f1 ${forPercent}%, #e11d48 ${Math.min(100, forPercent + 12)}%, #9f1239 100%)`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className={`relative h-2.5 w-full rounded-full overflow-hidden shadow-inner flex ${isDark ? 'bg-[#0c101d]' : 'bg-slate-200'}`}>
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

              {/* 1-Tap Vote Buttons (clicking active vote returns to neutral) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onVote('for')}
                  title={userVote === 'for' ? t('resetVoteTip') : t('voteFor')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userVote === 'for'
                      ? 'bg-sky-600 text-white font-bold ring-1 ring-sky-400 shadow-sm'
                      : isDark
                      ? 'bg-[#090d18] hover:bg-[#0e1424] text-sky-400 border border-[#141e33]'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                  }`}
                >
                  {userVote === 'for' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{userVote === 'for' ? t('votedFor') : t('voteFor')}</span>
                </button>

                <button
                  onClick={() => onVote('against')}
                  title={userVote === 'against' ? t('resetVoteTip') : t('voteAgainst')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userVote === 'against'
                      ? 'bg-rose-600 text-white font-bold ring-1 ring-rose-400 shadow-sm'
                      : isDark
                      ? 'bg-[#090d18] hover:bg-[#0e1424] text-rose-400 border border-[#141e33]'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {userVote === 'against' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{userVote === 'against' ? t('votedAgainst') : t('voteAgainst')}</span>
                </button>
              </div>

              {userVote && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <p className={`text-[11px] font-mono text-center transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('resetVoteTip')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Filter Controls (Horizontally scrollable on narrow mobile screens) */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 mb-4 gap-2 text-xs ${
          isDark ? 'border-[#141928]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            {filter === 'live' ? (
              <span className="flex items-center gap-1.5 text-emerald-500 font-mono font-semibold whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t('liveStream')}
              </span>
            ) : (
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('alternatingSorted')}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto no-scrollbar ${
            isDark ? 'bg-[#060810] border-[#141928]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setFilter('live')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'live'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700 shadow-sm font-bold'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{t('live')}</span>
            </button>

            <button
              onClick={() => setFilter('alternating')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'alternating'
                  ? isDark ? 'bg-[#141e33] text-white font-bold' : 'bg-white text-slate-900 shadow-xs font-bold'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('balanced')}
            </button>

            <button
              onClick={() => setFilter('for')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                filter === 'for'
                  ? 'bg-sky-500/20 text-sky-500 font-bold border border-sky-500/40'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('for')} ({formatCompactNumber(forArgsCount)})
            </button>

            <button
              onClick={() => setFilter('against')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                filter === 'against'
                  ? 'bg-rose-500/20 text-rose-500 font-bold border border-rose-500/40'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('against')} ({formatCompactNumber(againstArgsCount)})
            </button>
          </div>
        </div>

        {/* Arguments Timeline */}
        {displayedArguments.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {t('noArgumentsYet')}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedArguments.map((arg) => {
              const isFor = arg.side === 'for';
              const isLiked = !!userArgLikes[arg.id];
              const isArgAuthor = Boolean(
                (arg.author.uid && currentAuthor.uid && arg.author.uid === currentAuthor.uid) ||
                  (arg.author.handle && currentAuthor.handle && arg.author.handle === currentAuthor.handle) ||
                  (!arg.author.uid && arg.author.name === currentAuthor.name)
              );
              const isEditing = editingArgId === arg.id;
              const isHighlighted = highlightedArgId === arg.id;

              return (
                <div
                  key={arg.id}
                  id={`arg-${arg.id}`}
                  className={`flex flex-col ${isFor ? 'items-start' : 'items-end'} transition-all duration-500 ${
                    isHighlighted ? 'scale-[1.01]' : ''
                  }`}
                >
                  <div
                    className={`w-[97%] sm:w-auto sm:max-w-[88%] md:max-w-[82%] rounded-2xl p-3 sm:p-3.5 border transition-all ${
                      isHighlighted
                        ? 'ring-2 ring-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.35)]'
                        : ''
                    } ${
                      isDark
                        ? isFor
                          ? isHighlighted ? 'bg-sky-950/40 border-sky-400 rounded-tl-sm' : 'bg-[#060810]/95 border-[#0c203b] hover:border-[#10305a] rounded-tl-sm'
                          : isHighlighted ? 'bg-rose-950/40 border-rose-400 rounded-tr-sm' : 'bg-[#060810]/95 border-[#2d0e19] hover:border-[#421424] rounded-tr-sm'
                        : isFor
                        ? isHighlighted ? 'bg-sky-50/90 border-sky-400 rounded-tl-sm' : 'bg-white border-sky-100 shadow-xs hover:border-sky-200 rounded-tl-sm'
                        : isHighlighted ? 'bg-rose-50/90 border-rose-400 rounded-tr-sm' : 'bg-white border-rose-100 shadow-xs hover:border-rose-200 rounded-tr-sm'
                    }`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0 opacity-80"
                          style={{ backgroundColor: arg.author.avatarColor }}
                        >
                          {arg.author.initials}
                        </div>

                        <span className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {arg.author.name}
                        </span>
                        {arg.author.handle &&
                          arg.author.handle !== arg.author.name &&
                          arg.author.handle !== `@${arg.author.name.replace(/^u\//, '')}` && (
                            <span className={`text-[11px] font-mono truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {arg.author.handle}
                            </span>
                          )}

                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          isFor
                            ? 'bg-sky-500/15 text-sky-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isFor ? t('for') : t('against')}
                        </span>

                        {isHighlighted && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[10px] font-mono animate-pulse">
                            {t('sharedPoint')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Author Edit & Delete buttons */}
                        {isArgAuthor && !isEditing && (
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleStartEditArg(arg)}
                              className={`p-1 rounded text-[11px] transition-colors cursor-pointer ${
                                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Edit argument"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteArgClick(arg.id)}
                              className="p-1 rounded text-[11px] text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete argument"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <span className={`text-[11px] font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatRelativeTime(arg.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Content or Inline Edit */}
                    {isEditing ? (
                      <div className="space-y-2 my-2">
                        <textarea
                          value={editingArgContent}
                          onChange={(e) => setEditingArgContent(e.target.value)}
                          rows={3}
                          maxLength={4000}
                          className={`w-full rounded-xl p-2.5 text-xs transition-all focus:outline-none ${
                            isDark
                              ? 'bg-[#03060c] border border-sky-500/50 text-white'
                              : 'bg-slate-50 border border-sky-400 text-slate-900'
                          }`}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEditArg}
                            disabled={isSavingArgEdit}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t('cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditArg(arg.id)}
                            disabled={isSavingArgEdit || !editingArgContent.trim()}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-sm cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {isSavingArgEdit ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{t('saving')}</span>
                              </>
                            ) : (
                              <>
                                <CheckCheck className="w-3 h-3" />
                                <span>{t('save')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm leading-relaxed mb-2.5 whitespace-pre-wrap sm:pl-5.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <TranslatedTextBlock
                          itemId={`arg_${arg.id}`}
                          originalText={arg.content}
                          maxLines={6}
                        />
                      </div>
                    )}

                    {/* Actions Row: AI Authenticity Check + Challenge + Share + Anonymous Report + Upvote */}
                    <div className="flex flex-wrap items-center justify-between sm:pl-5.5 pt-2 border-t border-white/[0.04] dark:border-white/[0.04] border-slate-100 gap-2">
                      {/* AI Authenticity Check Trigger */}
                      <button
                        onClick={() => handleCheckAuthenticity(arg)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors cursor-pointer group whitespace-nowrap shrink-0 ${
                          isDark ? 'text-slate-400 hover:text-sky-300' : 'text-slate-500 hover:text-sky-600'
                        }`}
                        title="Verify factual authenticity with Google Grounded Search"
                      >
                        {arg.authenticityCheck ? (
                          renderAuthenticityBadge(arg.authenticityCheck)
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border transition-all ${
                            isDark
                              ? 'bg-white/[0.03] group-hover:bg-sky-500/10 border-white/5 group-hover:border-sky-500/30 text-slate-400 group-hover:text-sky-300'
                              : 'bg-slate-50 group-hover:bg-sky-50 border-slate-200 group-hover:border-sky-200 text-slate-600 group-hover:text-sky-700'
                          }`}>
                            <ShieldCheck className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                            <span>{t('verifyFacts')}</span>
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        {/* Challenge / Reply to this argument */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToArg(arg);
                            setSelectedSide(arg.side === 'for' ? 'against' : 'for');
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border whitespace-nowrap ${
                            replyingToArg?.id === arg.id
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-semibold'
                              : isDark
                              ? 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] border-white/5'
                              : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                          }`}
                          title="Challenge or reply to this point"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span className="text-[11px]">Challenge</span>
                        </button>

                        {/* Share Argument Link */}
                        <button
                          onClick={() => handleShareArgument(arg.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border whitespace-nowrap ${
                            copiedArgId === arg.id
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50'
                              : isDark
                              ? 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] border-white/5'
                              : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                          }`}
                          title={t('share')}
                        >
                          {copiedArgId === arg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                              <span className="text-[11px] text-emerald-400 font-semibold">{t('copied')}</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              <span className="text-[11px] hidden sm:inline">{t('share')}</span>
                            </>
                          )}
                        </button>

                        {/* Anonymous Report Argument Button */}
                        {onReportArgument && (
                          <button
                            type="button"
                            onClick={() => onReportArgument(arg)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border whitespace-nowrap ${
                              reportedItems[arg.id]
                                ? 'bg-amber-950/40 text-amber-400 border-amber-700/50 font-semibold'
                                : isDark
                                ? 'bg-white/[0.03] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-white/5'
                                : 'bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                            }`}
                            title={
                              reportedItems[arg.id]
                                ? 'Flagged anonymously for moderation'
                                : 'Report argument anonymously (zero identity link)'
                            }
                          >
                            <Flag
                              className={`w-3 h-3 ${
                                reportedItems[arg.id] ? 'fill-amber-400/30 text-amber-400' : ''
                              }`}
                            />
                            <span className="text-[11px]">
                              {reportedItems[arg.id] ? 'Reported' : 'Report'}
                            </span>
                          </button>
                        )}

                        {/* Upvote / Like Action on argument */}
                        <button
                          onClick={() => onToggleArgLike(arg.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer border whitespace-nowrap tabular-nums ${
                            isLiked
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                              : isDark
                              ? 'bg-[#090d18] text-slate-400 hover:text-white border-[#141e33]'
                              : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                        >
                          <span className={`text-[11px] ${isLiked ? 'text-rose-400 font-bold' : ''}`}>▲</span>
                          <span>{formatCompactNumber(arg.likes)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Argument Composer (Safe-area aware for mobile & crisp on PC) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t p-2.5 sm:p-3.5 pb-safe transition-colors ${
        isDark ? 'bg-black/95 border-[#141928]' : 'bg-white/95 border-slate-200 shadow-md'
      }`}>
        <div className="max-w-5xl mx-auto">
          {/* Recording Status Banner */}
          {isRecording && (
            <div className="mb-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">{t('recordingAudio')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] cursor-pointer"
                >
                  {t('done')}
                </button>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-2 py-1 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-2 p-2 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center gap-2 text-xs text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>{t('transcribingSpeech')}</span>
            </div>
          )}

          {micError && (
            <div className="mb-2 p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs">
              {micError}
            </div>
          )}

          {/* Replying / Challenging Banner */}
          {replyingToArg && (
            <div
              className={`mb-2 px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                isDark
                  ? 'bg-sky-950/40 border-sky-500/30 text-slate-200'
                  : 'bg-sky-50 border-sky-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <CornerDownRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-mono font-bold text-sky-400 shrink-0">
                  Challenging {replyingToArg.author.handle}:
                </span>
                <span className={`truncate italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  "{replyingToArg.content}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingToArg(null)}
                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Side selection toggle + "Commenting anonymously as" label beside FOR & AGAINST */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs font-medium hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('yourSide')}</span>
                  <div className={`inline-flex rounded-xl p-0.5 border text-xs shrink-0 ${
                    isDark ? 'bg-[#060810] border-[#141928]' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setSelectedSide('for')}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedSide === 'for'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('for')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSide('against')}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedSide === 'against'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('against')}
                    </button>
                  </div>
                </div>

                {/* Anonymous Identity Label beside FOR / AGAINST */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-500/25 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <VenetianMask className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    Commenting anonymously as
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    title="Click to change your anonymous debate username"
                    className="inline-flex items-center gap-1 font-mono font-bold underline decoration-dotted underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                      style={{ backgroundColor: currentAuthor.avatarColor }}
                    >
                      {currentAuthor.initials}
                    </span>
                    <span className="truncate max-w-[140px] sm:max-w-none">{currentAuthor.name || currentAuthor.handle}</span>
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
                placeholder={t('postArgumentPlaceholder')}
                className={`flex-1 rounded-xl px-3.5 sm:px-4 py-2.5 text-sm transition-all focus:outline-none ${
                  isDark
                    ? 'bg-[#060810] border border-[#141928] text-white placeholder-slate-500 focus:border-slate-400'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                }`}
              />

              {/* Mic Voice Dictation Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                title={isRecording ? t('stopRecording') : t('dictateWithVoice')}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  isRecording
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : isDark
                    ? 'bg-[#090d18] border-[#141e33] text-slate-400 hover:text-white hover:border-sky-500/50'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-sky-400'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!content.trim() || isRecording}
                className={`h-10 px-3.5 sm:px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  content.trim() && !isRecording
                    ? selectedSide === 'for'
                      ? 'bg-sky-600 hover:bg-sky-500 text-white font-bold active:scale-95 shadow-sm'
                      : 'bg-rose-600 hover:bg-rose-500 text-white font-bold active:scale-95 shadow-sm'
                    : isDark
                    ? 'bg-[#101420] text-slate-600 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('send')}</span>
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
        error={authenticityError}
        onRetry={() => {
          if (selectedArgForCheck) {
            handleCheckAuthenticity(selectedArgForCheck, true);
          }
        }}
        onClose={() => {
          setSelectedArgForCheck(null);
          setActiveCheckResult(null);
          setAuthenticityError(null);
        }}
      />

      {/* AI Summary Drawer (Triggered by AI Insights button) */}
      <DebateAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        debate={debate}
        argumentsList={argumentsList}
        onUpdateDebateSummary={onUpdateDebateSummary}
      />

      {/* Edit Debate Modal */}
      {isDebateAuthor && onEditDebate && (
        <EditDebateModal
          isOpen={isEditDebateOpen}
          debate={debate}
          onClose={() => setIsEditDebateOpen(false)}
          onSave={onEditDebate}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteModalState && (
        <ConfirmDeleteModal
          isOpen={deleteModalState.isOpen}
          title={deleteModalState.title}
          message={deleteModalState.message}
          itemType={deleteModalState.itemType}
          onClose={() => setDeleteModalState(null)}
          onConfirm={deleteModalState.onConfirm}
        />
      )}
    </div>
  );
};
