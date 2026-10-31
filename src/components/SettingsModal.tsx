import React, { useState, useEffect } from 'react';
import { Author } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';
import {
  cleanUsername,
  isValidUsername,
  checkUsernameAvailability,
  claimUsername,
  findOwnedPublicProfileByUid,
} from '../utils/username';
import {
  saveCurrentAuthor,
  savePublicPostAuthor,
  deriveInitialsFromHandle,
  deriveInitialsFromName,
  getPublicUsernameCooldownStatus,
  PUBLIC_USERNAME_COOLDOWN_DAYS,
} from '../utils/anonymous';
import { auth, signOut, signInWithPopup, googleProvider } from '../firebase';
import {
  X,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Globe,
  Check,
  LogOut,
  Lock,
  MessageSquareText,
  EyeOff,
  SlidersHorizontal,
  RotateCcw,
  Scale,
  Shield,
  FileText,
  Mail,
  Flag,
} from 'lucide-react';
import { AdPreferences, getTopInterestTags } from '../utils/adPersonalization';
import { InfoPageRoute } from './InfoPagesView';

interface SettingsModalProps {
  isOpen: boolean;
  currentAuthor: Author;
  publicPostAuthor?: Author;
  ambientEnabled: boolean;
  initialTab?: 'debate' | 'post';
  adPreferences?: AdPreferences;
  onClose: () => void;
  onUpdateAuthor: (debateAuthor: Author) => void;
  onUpdatePublicPostAuthor?: (publicAuthor: Author) => void;
  onToggleAmbient: () => void;
  onTogglePersonalizedAds?: () => void;
  onResetAdInterests?: () => void;
  onNavigateInfoPage?: (page: InfoPageRoute) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentAuthor,
  publicPostAuthor,
  ambientEnabled,
  initialTab = 'debate',
  adPreferences,
  onClose,
  onUpdateAuthor,
  onUpdatePublicPostAuthor,
  onToggleAmbient,
  onTogglePersonalizedAds,
  onResetAdInterests,
  onNavigateInfoPage,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t, isBatchTranslating } = useLanguage();

  const [activeIdentityTab, setActiveIdentityTab] = useState<'debate' | 'post'>(initialTab);

  // Anonymous Debate Handle State
  const [debateHandleInput, setDebateHandleInput] = useState(() =>
    cleanUsername(currentAuthor.handle)
  );

  // Public Post Profile State (Name + @username with 30-day limit)
  const effectivePublicAuthor: Author = publicPostAuthor || {
    name: 'Aarav Sharma',
    handle: '@aarav_sharma',
    avatarColor: '#0284c7',
    initials: 'AS',
  };
  const [realNameInput, setRealNameInput] = useState(effectivePublicAuthor.name);
  const [publicHandleInput, setPublicHandleInput] = useState(() =>
    cleanUsername(effectivePublicAuthor.handle)
  );
  const [isCheckingPublic, setIsCheckingPublic] = useState(false);
  const [isSavingPublic, setIsSavingPublic] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [publicAvailability, setPublicAvailability] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: true,
    available: true,
    message: 'Current username',
  });

  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const cooldownStatus = getPublicUsernameCooldownStatus(effectivePublicAuthor);

  useEffect(() => {
    if (isOpen) {
      setActiveIdentityTab(initialTab);
      setDebateHandleInput(cleanUsername(currentAuthor.handle));
      setRealNameInput(effectivePublicAuthor.name);
      setPublicHandleInput(cleanUsername(effectivePublicAuthor.handle));
      setStatusFeedback(null);
    }
  }, [isOpen, initialTab, currentAuthor.handle, effectivePublicAuthor.name, effectivePublicAuthor.handle]);

  // Debounced live availability check for Public Post @username
  useEffect(() => {
    const clean = cleanUsername(publicHandleInput);
    const currentClean = cleanUsername(effectivePublicAuthor.handle);
    const debateClean = cleanUsername(currentAuthor.handle);

    if (!clean) {
      setPublicAvailability({
        checked: false,
        available: false,
        message: 'Please enter a desired username',
      });
      return;
    }

    if (clean === debateClean) {
      setPublicAvailability({
        checked: true,
        available: false,
        message: 'Must be different from your anonymous Debate username.',
      });
      return;
    }

    const validation = isValidUsername(clean);
    if (!validation.valid) {
      setPublicAvailability({
        checked: true,
        available: false,
        message: validation.message || 'Invalid username format',
      });
      return;
    }

    if (clean === currentClean) {
      setPublicAvailability({
        checked: true,
        available: true,
        message: 'Current username',
      });
      return;
    }

    if (!cooldownStatus.canChange) {
      setPublicAvailability({
        checked: true,
        available: false,
        message: `Username can be changed in ${cooldownStatus.daysRemaining} day${
          cooldownStatus.daysRemaining === 1 ? '' : 's'
        }`,
      });
      return;
    }

    setIsCheckingPublic(true);
    const timer = setTimeout(async () => {
      const userUid = effectivePublicAuthor.uid || auth.currentUser?.uid || 'guest';
      const result = await checkUsernameAvailability(clean, userUid);
      setPublicAvailability({
        checked: true,
        available: result.available,
        message: result.message,
      });
      setIsCheckingPublic(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [publicHandleInput, effectivePublicAuthor.handle, effectivePublicAuthor.uid, currentAuthor.handle, cooldownStatus.canChange, cooldownStatus.daysRemaining]);

  if (!isOpen) return null;

  const handleSaveDebatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanUsername(debateHandleInput);
    const validation = isValidUsername(clean);
    if (!validation.valid) {
      setStatusFeedback({
        type: 'error',
        text: validation.message || 'Invalid anonymous username',
      });
      return;
    }

    if (clean === cleanUsername(effectivePublicAuthor.handle)) {
      setStatusFeedback({
        type: 'error',
        text: 'Anonymous debate username cannot be the same as your Posts username.',
      });
      return;
    }

    const updatedDebateAuthor: Author = {
      name: `u/${clean}`,
      handle: `@${clean}`,
      avatarColor: currentAuthor.avatarColor || '#0284c7',
      initials: deriveInitialsFromHandle(clean),
      isAnonymousPersona: true,
    };

    saveCurrentAuthor(updatedDebateAuthor);
    onUpdateAuthor(updatedDebateAuthor);
    setStatusFeedback({
      type: 'success',
      text: `Anonymous debate username updated to u/${clean}`,
    });
  };

  const handleSavePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = realNameInput.trim();
    const cleanHandle = cleanUsername(publicHandleInput);
    const currentCleanHandle = cleanUsername(effectivePublicAuthor.handle);
    const isHandleChanging = cleanHandle !== currentCleanHandle;

    if (!cleanName || cleanName.length < 2) {
      setStatusFeedback({
        type: 'error',
        text: 'Please enter your name (at least 2 characters).',
      });
      return;
    }

    if (cleanHandle === cleanUsername(currentAuthor.handle)) {
      setStatusFeedback({
        type: 'error',
        text: 'Your Posts username must be different from your anonymous Debate username.',
      });
      return;
    }

    if (isHandleChanging && !cooldownStatus.canChange) {
      setStatusFeedback({
        type: 'error',
        text: `Username can only be changed once every ${PUBLIC_USERNAME_COOLDOWN_DAYS} days (${cooldownStatus.daysRemaining} days left).`,
      });
      return;
    }

    if (isHandleChanging && !publicAvailability.available) {
      setStatusFeedback({
        type: 'error',
        text: publicAvailability.message,
      });
      return;
    }

    setIsSavingPublic(true);
    setStatusFeedback(null);

    const userUid =
      effectivePublicAuthor.uid ||
      auth.currentUser?.uid ||
      `pub_${Date.now().toString(36)}`;

    try {
      if (isHandleChanging) {
        const claimRes = await claimUsername(
          cleanHandle,
          userUid,
          effectivePublicAuthor.handle,
          cleanName,
          effectivePublicAuthor.usernameChangedAt
        );
        if (!claimRes.success) {
          setStatusFeedback({ type: 'error', text: claimRes.message });
          setIsSavingPublic(false);
          return;
        }
        const updatedPublic: Author = {
          ...effectivePublicAuthor,
          name: cleanName,
          handle: `@${cleanHandle}`,
          initials: deriveInitialsFromName(cleanName, cleanHandle),
          uid: userUid,
          usernameChangedAt: claimRes.usernameChangedAt || new Date().toISOString(),
          isAnonymousPersona: false,
        };
        savePublicPostAuthor(updatedPublic);
        onUpdatePublicPostAuthor?.(updatedPublic);
        setStatusFeedback({
          type: 'success',
          text: `Profile updated (${cleanName} · @${cleanHandle})`,
        });
      } else {
        const updatedPublic: Author = {
          ...effectivePublicAuthor,
          name: cleanName,
          handle: `@${currentCleanHandle}`,
          initials: deriveInitialsFromName(cleanName, currentCleanHandle),
          uid: userUid,
          isAnonymousPersona: false,
        };
        savePublicPostAuthor(updatedPublic);
        onUpdatePublicPostAuthor?.(updatedPublic);
        setStatusFeedback({
          type: 'success',
          text: `Name updated to "${cleanName}"`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setStatusFeedback({ type: 'error', text: msg });
    } finally {
      setIsSavingPublic(false);
    }
  };

  const handleGoogleBackupLink = async () => {
    setIsLinkingGoogle(true);
    setStatusFeedback(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const gUser = cred.user;
      if (gUser) {
        const existingProfile = await findOwnedPublicProfileByUid(gUser.uid);
        const resolvedName =
          existingProfile?.displayName ||
          gUser.displayName ||
          realNameInput.trim() ||
          effectivePublicAuthor.name;
        let resolvedHandle =
          existingProfile?.handle || cleanUsername(publicHandleInput || effectivePublicAuthor.handle);

        if (resolvedHandle === cleanUsername(currentAuthor.handle)) {
          resolvedHandle = `${resolvedHandle}_${Math.floor(10 + Math.random() * 89)}`;
        }

        const claimRes = await claimUsername(
          resolvedHandle,
          gUser.uid,
          undefined,
          resolvedName,
          existingProfile?.usernameChangedAt || effectivePublicAuthor.usernameChangedAt
        );

        const finalHandle = claimRes.success ? claimRes.handle : resolvedHandle;

        const backedUpPublic: Author = {
          ...effectivePublicAuthor,
          name: resolvedName,
          handle: `@${finalHandle}`,
          initials: deriveInitialsFromName(resolvedName, finalHandle),
          uid: gUser.uid,
          isGoogleUser: true,
          usernameChangedAt:
            existingProfile?.usernameChangedAt || effectivePublicAuthor.usernameChangedAt,
          isAnonymousPersona: false,
        };

        setRealNameInput(resolvedName);
        setPublicHandleInput(finalHandle);
        savePublicPostAuthor(backedUpPublic);
        onUpdatePublicPostAuthor?.(backedUpPublic);
        setStatusFeedback({
          type: 'success',
          text: `Connected Google account (${resolvedName} · @${finalHandle})`,
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setStatusFeedback({
        type: 'error',
        text: 'Google login was cancelled or could not complete.',
      });
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      const unlinkedPublic: Author = {
        ...effectivePublicAuthor,
        isGoogleUser: false,
      };
      savePublicPostAuthor(unlinkedPublic);
      onUpdatePublicPostAuthor?.(unlinkedPublic);
      setStatusFeedback({
        type: 'success',
        text: 'Signed out of Google account.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl overflow-hidden transition-colors pb-safe ${
          isDark
            ? 'bg-[#0a0d16] border-[#1e2538] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Mobile Sheet Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-500/40" />
        </div>

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-[#1a2133] bg-[#070910]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight">
              Profile &amp; {t('settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 max-h-[82vh] overflow-y-auto custom-comments-scrollbar">
          {/* Status Feedback Banner */}
          {statusFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                statusFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}
            >
              {statusFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusFeedback.text}</span>
            </div>
          )}

          {/* Simple Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-slate-200 dark:border-[#182238] bg-slate-100/70 dark:bg-[#050811]">
            <button
              type="button"
              onClick={() => {
                setActiveIdentityTab('post');
                setStatusFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeIdentityTab === 'post'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Posts Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveIdentityTab('debate');
                setStatusFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeIdentityTab === 'debate'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Debate Handle (Anon)</span>
            </button>
          </div>

          {/* =================================================================
              TAB: ANONYMOUS DEBATE HANDLE
             ================================================================= */}
          {activeIdentityTab === 'debate' ? (
            <div
              className={`p-4 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#060913] border-[#192236]' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{ backgroundColor: currentAuthor.avatarColor }}
                >
                  {currentAuthor.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold font-mono truncate">
                    {currentAuthor.name}
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Used anonymously in Debates · Change anytime
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDebatePersona} className="space-y-3">
                <div>
                  <label
                    className={`block text-xs font-mono uppercase tracking-wider font-semibold mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Anonymous Username
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      u/
                    </span>
                    <input
                      type="text"
                      value={debateHandleInput}
                      onChange={(e) => setDebateHandleInput(e.target.value)}
                      placeholder="anonymous_handle"
                      maxLength={25}
                      className={`w-full rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono font-semibold transition-all focus:outline-none ${
                        isDark
                          ? 'bg-[#0a0f1d] border border-[#1e293b] text-white focus:border-emerald-500'
                          : 'bg-white border border-slate-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-[0.99]"
                >
                  <span>Save Debate Username</span>
                </button>
              </form>
            </div>
          ) : (
            /* =================================================================
               TAB: POSTS PROFILE (Real Name + Desired @username with 1-Month Limit)
               ================================================================= */
            <div
              className={`p-4 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#060913] border-[#192236]' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.07]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: effectivePublicAuthor.avatarColor }}
                  >
                    {effectivePublicAuthor.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">
                      {effectivePublicAuthor.name}
                    </div>
                    <div className="text-xs font-mono text-sky-400 truncate">
                      {effectivePublicAuthor.handle}
                    </div>
                  </div>
                </div>

                {/* Google Link / Sign Out Action */}
                <div className="shrink-0">
                  {effectivePublicAuthor.isGoogleUser ? (
                    <button
                      type="button"
                      onClick={handleGoogleSignOut}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        isDark
                          ? 'bg-white/[0.05] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-800'
                          : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('signOut')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleBackupLink}
                      disabled={isLinkingGoogle}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>{isLinkingGoogle ? 'Linking...' : 'Connect Google'}</span>
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSavePublicProfile} className="space-y-3.5">
                {/* Field 1: Name */}
                <div>
                  <label
                    className={`block text-xs font-mono uppercase tracking-wider font-semibold mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={realNameInput}
                    onChange={(e) => setRealNameInput(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    maxLength={50}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all focus:outline-none ${
                      isDark
                        ? 'bg-[#0a0f1d] border border-[#1e293b] text-white focus:border-sky-500'
                        : 'bg-white border border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                {/* Field 2: @username (30-Day Change Limit) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Username
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                        cooldownStatus.canChange ? 'text-slate-400' : 'text-rose-400'
                      }`}
                    >
                      {!cooldownStatus.canChange && <Lock className="w-2.5 h-2.5" />}
                      <span>
                        {cooldownStatus.canChange
                          ? `1 change per ${PUBLIC_USERNAME_COOLDOWN_DAYS} days`
                          : `Available in ${cooldownStatus.daysRemaining}d`}
                      </span>
                    </span>
                  </div>

                  <div className="relative">
                    <span
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={publicHandleInput}
                      disabled={!cooldownStatus.canChange}
                      onChange={(e) => setPublicHandleInput(e.target.value)}
                      placeholder="aarav_sharma"
                      maxLength={25}
                      className={`w-full rounded-xl pl-8 pr-10 py-2.5 text-xs font-mono font-semibold transition-all focus:outline-none ${
                        !cooldownStatus.canChange
                          ? isDark
                            ? 'bg-white/[0.03] border border-white/10 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                          : isDark
                          ? 'bg-[#0a0f1d] border border-[#1e293b] text-white focus:border-sky-500'
                          : 'bg-white border border-slate-300 text-slate-900 focus:border-sky-500'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {!cooldownStatus.canChange ? (
                        <Lock className="w-4 h-4 text-rose-400" />
                      ) : isCheckingPublic ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : publicAvailability.checked && publicAvailability.available ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : publicAvailability.checked && !publicAvailability.available ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono px-1 mt-1">
                    <span
                      className={
                        publicAvailability.available
                          ? 'text-emerald-400 font-medium'
                          : 'text-rose-400 font-medium'
                      }
                    >
                      {publicAvailability.message}
                    </span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                      {cleanUsername(publicHandleInput).length}/25
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPublic || isCheckingPublic}
                  className="w-full py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-sky-500 hover:bg-sky-400 text-white shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {isSavingPublic ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('saving')}</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Language Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('language')}</span>
              </label>
              {isBatchTranslating && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{t('translating')}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 rounded-xl border border-slate-200 dark:border-[#182030] bg-slate-50/50 dark:bg-white/[0.01]">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold shadow-xs'
                          : 'bg-sky-50 border-sky-300 text-sky-700 font-bold shadow-xs'
                        : isDark
                        ? 'bg-[#060810] border-white/[0.05] text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate text-left">
                      <div className="truncate leading-tight">{lang.nativeName}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {lang.name}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme & Appearance */}
          <div>
            <label
              className={`block text-xs font-mono uppercase tracking-wider mb-2 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {t('themeAppearance')}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-sky-950/40 border-sky-500/40 text-sky-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-4 h-4 text-sky-400" />
                <span>{t('darkMode')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t('lightMode')}</span>
              </button>
            </div>

            {/* Ambient Glow Toggle */}
            <div
              className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-white/[0.02] border-[#182030]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-bold">{t('subtleAmbientGlow')}</div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('ambientDesc')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleAmbient}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  ambientEnabled
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : isDark
                    ? 'bg-white/5 text-slate-400 border border-transparent'
                    : 'bg-slate-200 text-slate-600 border border-transparent'
                }`}
              >
                {ambientEnabled ? t('enabled') : t('disabled')}
              </button>
            </div>
          </div>

          {/* Ad Preferences (Personalized Topic-Tag Ads & AdSense Control) */}
          {adPreferences && (
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-2 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Ad Preferences &amp; Privacy
              </label>

              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/[0.02] border-[#182030]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <SlidersHorizontal className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">
                        Personalized Ads (Topic Affinity)
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed mt-0.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {adPreferences.personalizedAdsEnabled
                          ? 'Ads are tailored locally to the topic tags (#TECH, #SPORTS, #INDIA) you engage with. Your anonymous debate handle is never linked.'
                          : 'Turned off — showing contextual-only ads (Google AdSense non-personalized mode active).'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onTogglePersonalizedAds?.();
                      setStatusFeedback({
                        type: 'success',
                        text: !adPreferences.personalizedAdsEnabled
                          ? 'Personalized topic-tag ads enabled.'
                          : 'Switched to contextual-only (non-personalized) ads.',
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      adPreferences.personalizedAdsEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isDark
                        ? 'bg-white/5 text-slate-400 border border-white/10'
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {adPreferences.personalizedAdsEnabled ? t('enabled') : t('disabled')}
                  </button>
                </div>

                {/* Active Topic Interests & Reset Button */}
                <div
                  className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${
                    isDark ? 'border-[#182030] text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="truncate">
                    <span>Top Topic Signals: </span>
                    <strong className={isDark ? 'text-sky-400' : 'text-sky-600'}>
                      {getTopInterestTags(adPreferences, 4)
                        .map((tag) => `#${tag}`)
                        .join(' · ') || 'None'}
                    </strong>
                  </div>

                  {onResetAdInterests && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetAdInterests();
                        setStatusFeedback({
                          type: 'success',
                          text: 'Ad topic interests and hidden ads have been reset.',
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Ad Interests</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Platform Info, Community Guidelines & Legal Quick Links (Easy mobile & desktop access) */}
          {onNavigateInfoPage && (
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-2 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                About, Guidelines &amp; Legal Policies
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'about' as InfoPageRoute, label: 'About evaad', icon: Scale },
                  { id: 'guidelines' as InfoPageRoute, label: 'Community Guidelines', icon: Shield },
                  { id: 'privacy' as InfoPageRoute, label: 'Privacy Policy', icon: FileText },
                  { id: 'contact' as InfoPageRoute, label: 'Contact Us', icon: Mail },
                  { id: 'moderation' as InfoPageRoute, label: 'Moderation & Safety', icon: Flag },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={`/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onNavigateInfoPage(item.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isDark
                          ? 'bg-white/[0.02] border-[#182030] text-slate-200 hover:bg-white/[0.06] hover:border-sky-500/40'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-sky-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDark ? 'border-[#1a2133] bg-[#070910]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
};
