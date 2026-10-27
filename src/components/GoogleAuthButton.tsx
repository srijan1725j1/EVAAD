import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { User } from 'firebase/auth';
import { LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface GoogleAuthButtonProps {
  currentUser: User | null;
  onUserChange?: (user: User | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  currentUser,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Only show signed-in profile if not an anonymous user
  if (!currentUser || currentUser.isAnonymous) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        title={t('googleLogin')}
        className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0 border ${
          isDark
            ? 'bg-white text-black hover:bg-slate-100 border-white/20'
            : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
        }`}
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
        <span className="hidden md:inline">{isSigningIn ? '...' : t('googleLogin')}</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title={currentUser.displayName || currentUser.email || 'Google Account'}
        className={`flex items-center gap-1.5 p-1 sm:pl-1 sm:pr-2.5 sm:py-1 rounded-full border text-xs transition-colors cursor-pointer ${
          isDark
            ? 'bg-white/[0.06] hover:bg-white/[0.1] border-white/10 text-slate-200'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
        }`}
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Google User'}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
        )}
        <span className={`font-medium max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {currentUser.displayName || currentUser.email}
        </span>
        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
      </button>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#0e1322] border-[#1d273f] text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className={`px-3 py-2 border-b mb-1 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentUser.displayName || 'Google User'}
            </p>
            <p className={`text-[11px] font-mono truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentUser.email}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Google Account</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('signOut')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
