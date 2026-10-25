import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { User } from 'firebase/auth';
import { LogIn, LogOut, CheckCircle, ShieldCheck, User as UserIcon } from 'lucide-react';

interface GoogleAuthButtonProps {
  currentUser: User | null;
  onUserChange?: (user: User | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  currentUser,
}) => {
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

  if (!currentUser) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-slate-100 transition-all shadow-sm cursor-pointer disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
        <span>{isSigningIn ? 'Connecting...' : 'Google Login'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs transition-colors cursor-pointer"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Google User'}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
        )}
        <span className="font-medium text-slate-200 max-w-[100px] truncate">
          {currentUser.displayName || currentUser.email}
        </span>
        <CheckCircle className="w-3 h-3 text-emerald-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#0e1322] border border-[#1d273f] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.displayName || 'Google User'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Google Account</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
