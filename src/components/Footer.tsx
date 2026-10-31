import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { InfoPageRoute } from './InfoPagesView';

interface FooterProps {
  activePage: InfoPageRoute | null;
  onNavigateInfoPage: (page: InfoPageRoute) => void;
  onNavigateMainFeed: (section: 'debates' | 'posts' | 'trending') => void;
  onOpenAdSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activePage,
  onNavigateInfoPage,
  onNavigateMainFeed,
  onOpenAdSettings,
}) => {
  const { isDark } = useTheme();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: InfoPageRoute) => {
    e.preventDefault();
    onNavigateInfoPage(page);
  };

  return (
    <footer
      aria-label="Site Footer"
      className={`w-full border-t mt-auto pb-20 sm:pb-6 pt-5 px-4 sm:px-6 transition-colors relative z-10 ${
        isDark
          ? 'border-[#141928] bg-[#04060c] text-slate-400'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
          <a
            href="/debates"
            onClick={(e) => {
              e.preventDefault();
              onNavigateMainFeed('debates');
            }}
            className={`font-bold tracking-tight transition-colors whitespace-nowrap ${
              isDark ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'
            }`}
          >
            evaad
          </a>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <a
            href="/about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className={`transition-colors whitespace-nowrap hover:underline ${
              activePage === 'about'
                ? 'text-sky-400 font-bold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            About
          </a>
          <a
            href="/guidelines"
            onClick={(e) => handleLinkClick(e, 'guidelines')}
            className={`transition-colors whitespace-nowrap hover:underline ${
              activePage === 'guidelines'
                ? 'text-sky-400 font-bold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Community Guidelines
          </a>
          <a
            href="/privacy"
            onClick={(e) => handleLinkClick(e, 'privacy')}
            className={`transition-colors whitespace-nowrap hover:underline ${
              activePage === 'privacy'
                ? 'text-sky-400 font-bold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </a>
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className={`transition-colors whitespace-nowrap hover:underline ${
              activePage === 'contact'
                ? 'text-sky-400 font-bold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Contact
          </a>
          <a
            href="/moderation"
            onClick={(e) => handleLinkClick(e, 'moderation')}
            className={`transition-colors whitespace-nowrap hover:underline ${
              activePage === 'moderation'
                ? 'text-sky-400 font-bold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Moderation &amp; Safety
          </a>
          <button
            type="button"
            onClick={onOpenAdSettings}
            className={`transition-colors whitespace-nowrap hover:underline cursor-pointer ${
              isDark ? 'hover:text-white' : 'hover:text-slate-900'
            }`}
          >
            Ad Preferences
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
          © {new Date().getFullYear()} evaad · 180° Public Discourse
        </div>
      </div>
    </footer>
  );
};
