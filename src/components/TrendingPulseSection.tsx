import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Users,
  MessageSquarePlus,
} from 'lucide-react';
import { Debate } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AiSearchSynthesis } from './AiSearchCard';
import { AdPreferences } from '../utils/adPersonalization';
import { AdUnitCard } from './AdUnitCard';
import { InfoPageRoute } from './InfoPagesView';

export interface TrendingPulseItem {
  id: string;
  rank: number;
  hashtag: string;
  category: string;
  regionLabel: string;
  headline: string;
  hook: string;
  volume: string;
  forPercent: number;
  forPoint: string;
  againstPoint: string;
  tags: string[];
}

const FALLBACK_TRENDS: TrendingPulseItem[] = [
  {
    id: 'trend-one-nation-election',
    rank: 1,
    hashtag: '#OneNationOneElection',
    category: 'Politics · Hot Today',
    regionLabel: 'POLITICS',
    headline: 'Should India hold Lok Sabha and all State elections together at the same time?',
    hook: 'Supporters say it saves thousands of crores and governance time; critics say it hurts regional state issues.',
    volume: '1.2 Lakh debating',
    forPercent: 54,
    forPoint: 'Holding elections once every 5 years saves huge public money and lets governments focus on development instead of non-stop campaigning.',
    againstPoint: 'National topics will overshadow local state problems, and voters may lose the power to hold state governments accountable mid-term.',
    tags: ['POLITICS', 'INDIA'],
  },
  {
    id: 'trend-70hr-work',
    rank: 2,
    hashtag: '#70HourWorkWeek',
    category: 'Jobs & Work · Hot Today',
    regionLabel: 'WORK',
    headline: 'Is working 60–70 hours a week good for India’s youth, or should work-life balance come first?',
    hook: 'Company founders and young employees debate hard work for nation-building vs health and family life.',
    volume: '85K debating',
    forPercent: 32,
    forPoint: 'Fast-growing countries need dedicated hard work from young professionals to build world-class companies and infrastructure.',
    againstPoint: 'Long hours without extra pay cause burnout and poor health—smart productivity matters much more than sitting late in the office.',
    tags: ['WORK', 'INDIA'],
  },
  {
    id: 'trend-ipl-impact-player',
    rank: 3,
    hashtag: '#ImpactPlayerRule',
    category: 'Cricket · Hot Today',
    regionLabel: 'SPORTS',
    headline: 'Should IPL remove the Impact Player rule to help Indian all-rounders grow?',
    hook: 'Fans love 250+ six-hitting matches, but senior players warn it is hurting genuine all-rounders.',
    volume: '94K debating',
    forPercent: 62,
    forPoint: 'The rule stops captains from bowling all-rounders like Shivam Dube or Washington Sundar, which hurts Team India in World Cups.',
    againstPoint: 'It makes every IPL match exciting till the last ball and gives uncapped Indian batters and bowlers more chances to shine.',
    tags: ['SPORTS', 'INDIA'],
  },
  {
    id: 'trend-freebies-vs-development',
    rank: 4,
    hashtag: '#FreebiesVsDevelopment',
    category: 'Economy · Hot Today',
    regionLabel: 'POLITICS',
    headline: 'Should state governments give monthly cash & free schemes, or spend that money only on roads, schools, and jobs?',
    hook: 'Voters and taxpayers debate direct family financial support versus long-term infrastructure.',
    volume: '76K debating',
    forPercent: 48,
    forPoint: 'Direct cash and free bus/electricity schemes give immediate relief to poor families and women struggling with price rise.',
    againstPoint: 'Free schemes empty state budgets, increase taxes, and leave less money for hospitals, schools, and new factories.',
    tags: ['POLITICS', 'ECONOMY', 'INDIA'],
  },
  {
    id: 'trend-ai-it-jobs',
    rank: 5,
    hashtag: '#AIvsITJobs',
    category: 'Tech & Careers · Hot Today',
    regionLabel: 'TECH',
    headline: 'Will AI take away fresher IT jobs in India, or create better new tech careers?',
    hook: 'Engineering students and tech leaders discuss the future of campus placements and coding jobs.',
    volume: '68K debating',
    forPercent: 56,
    forPoint: 'Basic coding, testing, and support work is now done by AI in seconds, reducing mass hiring of freshers in IT companies.',
    againstPoint: 'AI tools allow young Indian engineers to build global startups and products much faster than ever before.',
    tags: ['TECH', 'WORK', 'INDIA'],
  },
  {
    id: 'trend-neet-jee-coaching',
    rank: 6,
    hashtag: '#CoachingCulture',
    category: 'Education · Hot Today',
    regionLabel: 'EDUCATION',
    headline: 'Are NEET and JEE coaching centres putting too much pressure on school students?',
    hook: 'Parents, students, and teachers discuss exam stress, high coaching fees, and fair admissions.',
    volume: '54K debating',
    forPercent: 68,
    forPoint: 'Lakhs of teenagers face extreme stress and huge fees in coaching hubs while losing their normal school childhood.',
    againstPoint: 'A single merit-based entrance exam is the fairest way for hard-working students from small towns to enter top colleges.',
    tags: ['EDUCATION', 'INDIA', 'SOCIETY'],
  },
  {
    id: 'trend-wfh-vs-office',
    rank: 7,
    hashtag: '#WorkFromHome',
    category: 'City Life · Hot Today',
    regionLabel: 'WORK',
    headline: 'Should IT and office companies allow permanent Work From Home to reduce metro city traffic and rent?',
    hook: 'Employees in Bengaluru, Mumbai, and NCR debate traffic jams and high rent vs office teamwork.',
    volume: '49K debating',
    forPercent: 74,
    forPoint: 'Working from hometowns saves 3 hours of daily traffic, cuts pollution, and lets people save money instead of paying high metro rent.',
    againstPoint: 'Working together in the office builds stronger teamwork, faster learning for freshers, and supports local city businesses.',
    tags: ['WORK', 'INDIA', 'SOCIETY'],
  },
];

const SIMPLE_CATEGORIES = [
  { id: 'ALL', label: '🔥 All Hot Today' },
  { id: 'POLITICS', label: 'Politics' },
  { id: 'SPORTS', label: 'Cricket' },
  { id: 'WORK', label: 'Jobs & Work' },
  { id: 'TECH', label: 'Tech & AI' },
  { id: 'EDUCATION', label: 'Education' },
];

interface TrendingPulseSectionProps {
  variant: 'glimpse' | 'sidebar' | 'page';
  debates: Debate[];
  adPreferences?: AdPreferences;
  contextualTags?: string[];
  onOpenTrendingPage: () => void;
  onBackToDebates?: () => void;
  onSelectDebate: (debate: Debate) => void;
  onLaunchTrendDebate: (synthesis: AiSearchSynthesis) => void;
  onDismissAd?: (campaignId: string) => void;
  onOpenAdSettings?: () => void;
  onNavigateInfoPage?: (page: InfoPageRoute) => void;
}

export const TrendingPulseSection: React.FC<TrendingPulseSectionProps> = ({
  variant,
  debates,
  adPreferences,
  contextualTags = [],
  onOpenTrendingPage,
  onBackToDebates,
  onSelectDebate,
  onLaunchTrendDebate,
  onDismissAd,
  onOpenAdSettings,
  onNavigateInfoPage,
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [items, setItems] = useState<TrendingPulseItem[]>(FALLBACK_TRENDS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrendingPulse = useCallback(
    async (category: string, refresh: boolean) => {
      if (refresh) setIsRefreshing(true);
      try {
        const res = await fetch('/api/trending-pulse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            refresh,
            targetLang: language,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch {
        // Keep fallback seamlessly
      } finally {
        setIsRefreshing(false);
      }
    },
    [language]
  );

  useEffect(() => {
    fetchTrendingPulse(activeCategory, false);
  }, [activeCategory, fetchTrendingPulse]);

  const findMatchingDebate = (trend: TrendingPulseItem): Debate | undefined => {
    const cleanHashtag = trend.hashtag.replace(/^#/, '').toLowerCase();
    const headlineWords = trend.headline
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 4);

    return debates.find((d) => {
      const tLower = d.title.toLowerCase();
      if (tLower === trend.headline.toLowerCase()) return true;
      if (cleanHashtag.length > 3 && tLower.includes(cleanHashtag)) return true;
      const matchCount = headlineWords.filter((w) => tLower.includes(w)).length;
      return matchCount >= 4;
    });
  };

  const handleOpenOrLaunchTrend = (trend: TrendingPulseItem) => {
    const existing = findMatchingDebate(trend);
    if (existing) {
      onSelectDebate(existing);
      return;
    }
    onLaunchTrendDebate({
      framedQuestion: trend.headline,
      contextSummary: `${trend.hashtag}: ${trend.hook}`,
      forPoints: [trend.forPoint],
      againstPoints: [trend.againstPoint],
      suggestedTags: trend.tags && trend.tags.length > 0 ? trend.tags : ['INDIA'],
      estimatedForPercent: trend.forPercent,
    });
  };

  // ===========================================================================
  // 1. GLIMPSE VARIANT (Horizontal "Hot Today" glimpse strip in mobile/tablet feed)
  // ===========================================================================
  if (variant === 'glimpse') {
    const topFour = items.slice(0, 4);
    return (
      <div className="px-3.5 sm:px-0 mb-3.5 lg:hidden">
        <div
          className={`rounded-2xl border p-3 transition-colors ${
            isDark
              ? 'bg-gradient-to-r from-[#130d08] via-[#0b0d18] to-[#140912] border-amber-500/25'
              : 'bg-gradient-to-r from-amber-50/70 via-white to-rose-50/60 border-amber-200/80 shadow-2xs'
          }`}
        >
          {/* Glimpse Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </span>
              <span
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  isDark ? 'text-amber-300' : 'text-amber-800'
                }`}
              >
                Hot Topics Today
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenTrendingPage}
              className={`inline-flex items-center gap-1 text-xs font-bold cursor-pointer ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <span>Full Trending Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal swipeable glimpse cards */}
          <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
            {topFour.map((trend) => {
              const againstPercent = 100 - trend.forPercent;
              return (
                <div
                  key={trend.id}
                  onClick={() => handleOpenOrLaunchTrend(trend)}
                  className={`w-64 shrink-0 rounded-xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#080b14]/90 border-white/[0.08] hover:border-amber-500/40'
                      : 'bg-white border-slate-200/90 hover:border-amber-400 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 dark:text-amber-300 text-[10px] font-mono font-bold">
                        #{trend.rank} HOT
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {trend.volume}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold text-sky-500 dark:text-sky-400 truncate mb-0.5">
                      {trend.hashtag}
                    </div>

                    <p
                      className={`text-xs font-semibold leading-snug line-clamp-2 mb-2 ${
                        isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}
                    >
                      {trend.headline}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                      <span className="text-sky-500">{trend.forPercent}% YES</span>
                      <span className="text-rose-500">{againstPercent}% NO</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full w-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(
                            8,
                            trend.forPercent - 10
                          )}%, #7c3aed ${trend.forPercent}%, #f43f5e ${Math.min(
                            92,
                            trend.forPercent + 10
                          )}%, #9f1239 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 2. SIDEBAR VARIANT (X-Style Right Sticky Sidebar on Desktop)
  // ===========================================================================
  if (variant === 'sidebar') {
    const topFive = items.slice(0, 5);
    return (
      <aside className="hidden lg:block w-80 xl:w-[340px] shrink-0">
        <div className="sticky top-28">
          <div
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark
                ? 'bg-[#070a14] border-[#1a2236] shadow-lg'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
          {/* Distinct Hot Topic Today Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border-[#1a2236]'
                : 'bg-gradient-to-r from-amber-50 via-orange-50/60 to-rose-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h2
                  className={`text-sm font-extrabold tracking-tight leading-none ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Hot in India Today
                </h2>
                <span
                  className={`text-[10px] font-mono ${
                    isDark ? 'text-amber-300/80' : 'text-amber-800'
                  }`}
                >
                  What the country is debating
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchTrendingPulse('ALL', true)}
              disabled={isRefreshing}
              title="Refresh hot topics"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Hot Today Items */}
          <div className="divide-y divide-slate-200 dark:divide-[#141b2d]">
            {topFive.map((trend) => {
              const againstPercent = 100 - trend.forPercent;
              return (
                <div
                  key={trend.id}
                  onClick={() => handleOpenOrLaunchTrend(trend)}
                  className={`p-3.5 transition-colors cursor-pointer group ${
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-amber-50/30'
                  }`}
                >
                  {/* Top row: Rank badge + Category + Volume */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                          trend.rank === 1
                            ? 'bg-amber-500 text-black'
                            : isDark
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        #{trend.rank}
                      </span>
                      <span
                        className={`text-[11px] truncate ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {trend.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {trend.volume}
                    </span>
                  </div>

                  {/* Hashtag + Question */}
                  <div className="text-xs font-extrabold text-sky-500 dark:text-sky-400 mb-0.5 group-hover:underline">
                    {trend.hashtag}
                  </div>
                  <p
                    className={`text-xs font-semibold leading-snug line-clamp-2 mb-2 ${
                      isDark ? 'text-slate-100 group-hover:text-white' : 'text-slate-800'
                    }`}
                  >
                    {trend.headline}
                  </p>

                  {/* Mini Tug-of-War Split Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-sky-500 shrink-0">
                      {trend.forPercent}% FOR
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full w-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(
                            8,
                            trend.forPercent - 10
                          )}%, #7c3aed ${trend.forPercent}%, #f43f5e ${Math.min(
                            92,
                            trend.forPercent + 10
                          )}%, #9f1239 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-500 shrink-0">
                      {againstPercent}% NO
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

            {/* Open Full Dedicated Trending Page Button */}
            <button
              type="button"
              onClick={onOpenTrendingPage}
              className={`w-full px-4 py-3 text-xs font-bold border-t flex items-center justify-between transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#1a2236] bg-[#0a0f1e] text-amber-400 hover:bg-[#10172d]'
                  : 'border-slate-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/60'
              }`}
            >
              <span>Open Full Trending Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Right Sidebar Display Ad Unit */}
          {adPreferences && onDismissAd && onOpenAdSettings && (
            <AdUnitCard
              slotIndex={0}
              placement="sidebar"
              adPreferences={adPreferences}
              contextualTags={contextualTags}
              onDismissAd={onDismissAd}
              onOpenAdSettings={onOpenAdSettings}
            />
          )}

          {/* Pinned Sticky Sidebar Quick Links (Always visible while scrolling long feeds) */}
          {onNavigateInfoPage && (
            <nav
              aria-label="Sidebar Policy and Platform Links"
              className={`mt-3 px-3.5 py-3 rounded-2xl border text-[11px] leading-relaxed transition-colors ${
                isDark
                  ? 'bg-[#060913]/90 border-[#141b2d] text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateInfoPage('about');
                  }}
                  className={`font-semibold transition-colors hover:underline ${
                    isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                  }`}
                >
                  About
                </a>
                <span aria-hidden="true" className="opacity-40">·</span>
                <a
                  href="/guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateInfoPage('guidelines');
                  }}
                  className={`font-semibold transition-colors hover:underline ${
                    isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                  }`}
                >
                  Community Guidelines
                </a>
                <span aria-hidden="true" className="opacity-40">·</span>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateInfoPage('privacy');
                  }}
                  className={`font-semibold transition-colors hover:underline ${
                    isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                  }`}
                >
                  Privacy Policy
                </a>
                <span aria-hidden="true" className="opacity-40">·</span>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateInfoPage('contact');
                  }}
                  className={`font-semibold transition-colors hover:underline ${
                    isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                  }`}
                >
                  Contact
                </a>
                <span aria-hidden="true" className="opacity-40">·</span>
                <a
                  href="/moderation"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateInfoPage('moderation');
                  }}
                  className={`font-semibold transition-colors hover:underline ${
                    isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                  }`}
                >
                  Moderation &amp; Safety
                </a>
                {onOpenAdSettings && (
                  <>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <button
                      type="button"
                      onClick={onOpenAdSettings}
                      className={`font-semibold transition-colors hover:underline cursor-pointer ${
                        isDark ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-700'
                      }`}
                    >
                      Ad Preferences
                    </button>
                  </>
                )}
              </div>
              <div className="mt-1.5 text-[10px] font-mono opacity-70">
                © {new Date().getFullYear()} evaad · Respectful 180° Perspectives
              </div>
            </nav>
          )}
        </div>
      </aside>
    );
  }

  // ===========================================================================
  // 3. DEDICATED FULL TRENDING PAGE VARIANT (Completely separate from Debates feed)
  // ===========================================================================
  const heroTrend = items[0] || FALLBACK_TRENDS[0];
  const remainingTrends = items.slice(1);

  return (
    <div className="w-full px-3.5 sm:px-0 pb-10">
      {/* Top Navigation & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {onBackToDebates && (
            <button
              type="button"
              onClick={onBackToDebates}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.1] text-slate-200 hover:bg-white/[0.08]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Debates Feed</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              <h1
                className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Hot in India Today
              </h1>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Live burning topics the whole country is chatting and debating about today
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTrendingPulse(activeCategory, true)}
          disabled={isRefreshing}
          className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isDark
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Updating Hot Topics...' : 'Refresh Today’s Pulse'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
        {SIMPLE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-transparent shadow-sm'
                  : isDark
                  ? 'bg-[#0a0f1d] border-[#1a233a] text-slate-300 hover:border-amber-500/40'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* #1 HOT TOPIC IN INDIA TODAY — HERO SPOTLIGHT CARD */}
      {heroTrend && (
        <div
          onClick={() => handleOpenOrLaunchTrend(heroTrend)}
          className={`relative rounded-2xl border p-4 sm:p-6 mb-5 transition-all cursor-pointer overflow-hidden group ${
            isDark
              ? 'bg-gradient-to-br from-[#191007] via-[#0c1020] to-[#1b0b16] border-amber-500/40 hover:border-amber-400/70 shadow-xl'
              : 'bg-gradient-to-br from-amber-50 via-white to-rose-50 border-amber-300 hover:border-amber-400 shadow-md'
          }`}
        >
          {/* Top Spotlight Badge + People Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-black text-xs font-extrabold tracking-wide shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-black text-black" />
                #1 HOT IN INDIA TODAY
              </span>
              <span
                className={`text-xs font-semibold ${
                  isDark ? 'text-amber-200/80' : 'text-amber-900'
                }`}
              >
                {heroTrend.category}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                isDark
                  ? 'bg-white/[0.07] text-slate-200 border border-white/[0.1]'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              {heroTrend.volume}
            </span>
          </div>

          {/* Big Hashtag & Main Question */}
          <div className="text-base sm:text-lg font-mono font-extrabold text-sky-500 dark:text-sky-400 mb-1">
            {heroTrend.hashtag}
          </div>
          <h2
            className={`text-lg sm:text-2xl font-extrabold leading-snug mb-2 ${
              isDark ? 'text-white group-hover:text-amber-100' : 'text-slate-900'
            }`}
          >
            {heroTrend.headline}
          </h2>
          <p
            className={`text-xs sm:text-sm mb-4 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {heroTrend.hook}
          </p>

          {/* Both Sides Snapshot (YES vs NO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark
                  ? 'bg-sky-950/30 border-sky-500/30 text-slate-200'
                  : 'bg-sky-50/90 border-sky-200 text-slate-800'
              }`}
            >
              <div className="font-mono font-extrabold text-sky-500 dark:text-sky-400 mb-1">
                👍 WHY PEOPLE SAY YES ({heroTrend.forPercent}%)
              </div>
              {heroTrend.forPoint}
            </div>
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark
                  ? 'bg-rose-950/30 border-rose-500/30 text-slate-200'
                  : 'bg-rose-50/90 border-rose-200 text-slate-800'
              }`}
            >
              <div className="font-mono font-extrabold text-rose-500 dark:text-rose-400 mb-1">
                👎 WHY PEOPLE SAY NO ({100 - heroTrend.forPercent}%)
              </div>
              {heroTrend.againstPoint}
            </div>
          </div>

          {/* Live Tug of War Bar + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono font-extrabold mb-1">
                <span className="text-sky-500 dark:text-sky-400">
                  {heroTrend.forPercent}% FOR
                </span>
                <span className="text-rose-500 dark:text-rose-400">
                  {100 - heroTrend.forPercent}% AGAINST
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(
                      8,
                      heroTrend.forPercent - 10
                    )}%, #7c3aed ${heroTrend.forPercent}%, #f43f5e ${Math.min(
                      92,
                      heroTrend.forPercent + 10
                    )}%, #9f1239 100%)`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenOrLaunchTrend(heroTrend);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xs tracking-tight shadow-sm hover:opacity-95 cursor-pointer shrink-0"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Join #1 Hot Debate</span>
            </button>
          </div>
        </div>
      )}

      {/* OTHER HOT TOPICS TODAY (#2, #3, #4...) — DISTINCT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {remainingTrends.map((trend) => {
          const againstPercent = 100 - trend.forPercent;
          return (
            <div
              key={trend.id}
              onClick={() => handleOpenOrLaunchTrend(trend)}
              className={`rounded-2xl border p-4 transition-all cursor-pointer group flex flex-col justify-between ${
                isDark
                  ? 'bg-[#080c18] border-[#1a2236] hover:border-amber-500/50 hover:bg-[#0b1020]'
                  : 'bg-white border-slate-200 hover:border-amber-400 shadow-2xs'
              }`}
            >
              <div>
                {/* Top Rank Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold ${
                        isDark
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      #{trend.rank} HOT
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {trend.category}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {trend.volume}
                  </span>
                </div>

                {/* Hashtag + Question */}
                <div className="text-sm font-mono font-extrabold text-sky-500 dark:text-sky-400 mb-1 group-hover:underline">
                  {trend.hashtag}
                </div>
                <h3
                  className={`text-base font-bold leading-snug mb-1.5 ${
                    isDark ? 'text-white group-hover:text-amber-100' : 'text-slate-900'
                  }`}
                >
                  {trend.headline}
                </h3>
                <p
                  className={`text-xs leading-relaxed mb-3.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {trend.hook}
                </p>
              </div>

              {/* Bottom Vote Bar & Join Link */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                  <span className="text-sky-500 dark:text-sky-400">
                    {trend.forPercent}% FOR
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-sans font-bold ${
                      isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-700'
                    }`}
                  >
                    Tap to Debate →
                  </span>
                  <span className="text-rose-500 dark:text-rose-400">
                    {againstPercent}% AGAINST
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${Math.max(
                        8,
                        trend.forPercent - 10
                      )}%, #7c3aed ${trend.forPercent}%, #f43f5e ${Math.min(
                        92,
                        trend.forPercent + 10
                      )}%, #9f1239 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
