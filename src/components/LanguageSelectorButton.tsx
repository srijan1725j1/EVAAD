import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const LanguageSelectorButton: React.FC = () => {
  const { isDark } = useTheme();
  const { language, currentLanguageObj, setLanguage, isBatchTranslating, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`${t('language')} (${currentLanguageObj.name})`}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
          language !== 'en'
            ? isDark
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/35'
              : 'bg-sky-50 text-sky-700 border-sky-200'
            : isDark
            ? 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {isBatchTranslating ? (
          <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        )}
        <span className="font-semibold text-[11px]">{currentLanguageObj.shortLabel}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#0a0d16] border-[#1e263b] text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`px-3.5 py-2.5 border-b text-[11px] font-mono uppercase tracking-wider font-semibold ${
              isDark ? 'border-[#161d2f] bg-[#060810] text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
            }`}
          >
            {t('selectLanguage')}
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5 grid grid-cols-1 gap-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-500/20 text-sky-300 font-bold'
                        : 'bg-sky-50 text-sky-700 font-bold'
                      : isDark
                      ? 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{lang.nativeName}</span>
                    {lang.nativeName !== lang.name && (
                      <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        ({lang.name})
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
