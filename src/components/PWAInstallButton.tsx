import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, X, Share, PlusSquare, Check } from 'lucide-react';
import { EvaadLogo } from './EvaadLogo';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  // If already running standalone or marked as installed, hide the button completely
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={t('installApp')}
        className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border ${
          isDark
            ? 'bg-gradient-to-r from-cyan-500/15 to-rose-500/15 hover:from-cyan-500/25 hover:to-rose-500/25 text-white border-cyan-500/30 hover:border-cyan-400/50'
            : 'bg-sky-50 hover:bg-sky-100 text-slate-800 border-sky-200 hover:border-sky-300'
        }`}
      >
        <Download className={`w-3.5 h-3.5 stroke-[2.2] shrink-0 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
        <span className="hidden md:inline">{t('installApp')}</span>
      </button>

      {/* Install App Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? 'bg-[#090d1a] border-[#1e293b] text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Icon & Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md shrink-0 ${
                  isDark ? 'bg-[#f8fafc] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <EvaadLogo size={38} showText={false} />
              </div>
              <div>
                <h3 className={`text-lg font-bold tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('installApp')} — evaad
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                    PWA
                  </span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Install to your home screen or desktop dock
                </p>
              </div>
            </div>

            {/* Quick 1-click install button if available */}
            {isInstallable && (
              <div className="mb-5">
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 hover:from-sky-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('installApp')}</span>
                </button>
              </div>
            )}

            {/* Platform Guides */}
            <div className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {/* iOS Guide */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isIOS
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : isDark
                    ? 'bg-white/[0.03] border-white/[0.06]'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`flex items-center gap-2 font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Smartphone className="w-4 h-4 text-sky-500" />
                  <span>iPhone & iPad (Safari)</span>
                </div>
                <ol className={`list-decimal list-inside space-y-1 leading-relaxed pl-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li>
                    Tap the{' '}
                    <strong className={`inline-flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <Share className="w-3 h-3 inline text-sky-500" /> Share
                    </strong>{' '}
                    button in Safari's bottom toolbar.
                  </li>
                  <li>
                    Scroll down and select{' '}
                    <strong className={`inline-flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <PlusSquare className="w-3 h-3 inline text-rose-500" /> Add to Home Screen
                    </strong>
                    .
                  </li>
                  <li>
                    Tap <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Add</strong> in the top right to launch full-screen.
                  </li>
                </ol>
              </div>

              {/* Android & Chrome Guide */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`flex items-center gap-2 font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Android (Chrome / Brave / Edge)</span>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tap the <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>three dots menu (⋮)</strong> at the top right of the browser and choose{' '}
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Install app</strong> or{' '}
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Add to Home screen</strong>.
                </p>
              </div>

              {/* Desktop Mac / Windows Guide */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`flex items-center gap-2 font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Laptop className="w-4 h-4 text-purple-500" />
                  <span>Desktop (Chrome, Edge, Brave, Safari)</span>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Look for the <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Install icon (⊕ or ⬇)</strong> on the right side of the browser URL address bar, or click browser menu →{' '}
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Install evaad</strong>.
                </p>
              </div>
            </div>

            <div className={`mt-5 pt-4 border-t flex items-center justify-between gap-2 ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => {
                  markAsInstalled();
                  setShowModal(false);
                }}
                className={`inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors cursor-pointer ${
                  isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Already installed? Hide button</span>
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
      )}
    </>
  );
};
