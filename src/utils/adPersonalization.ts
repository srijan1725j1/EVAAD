export interface AdPreferences {
  personalizedAdsEnabled: boolean;
  tagAffinities: Record<string, number>;
  dismissedAdIds: string[];
  updatedAt: string;
}

export interface SponsoredAdCampaign {
  id: string;
  advertiserName: string;
  advertiserHandle: string;
  advertiserInitials: string;
  avatarColor: string;
  categoryTag: string;
  tags: string[];
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  domainLabel: string;
  sponsoredDebatePrompt?: string;
  metricsLabel: string;
}

const AD_PREFS_STORAGE_KEY = 'evaad_ad_preferences_v1';

const DEFAULT_TAG_AFFINITIES: Record<string, number> = {
  INDIA: 4,
  TECH: 3,
  WORK: 2,
  SPORTS: 2,
  EDUCATION: 2,
};

export const SPONSORED_CAMPAIGNS: SponsoredAdCampaign[] = [
  {
    id: 'ad_scaler_ai_eng',
    advertiserName: 'Scaler Tech Academy',
    advertiserHandle: '@scaler_official',
    advertiserInitials: 'SC',
    avatarColor: '#0284c7',
    categoryTag: 'TECH',
    tags: ['TECH', 'WORK', 'EDUCATION', 'INDIA'],
    headline: 'Master System Design & Applied AI Engineering in 2026',
    body: 'Join 45,000+ software engineers upskilling with live weekend architecture labs mentored by principal engineers.',
    ctaLabel: 'Explore Curriculum',
    ctaUrl: 'https://www.scaler.com',
    domainLabel: 'scaler.com',
    sponsoredDebatePrompt: 'Will AI engineering replace traditional full-stack roles by 2028, or augment senior developers?',
    metricsLabel: '4.8★ · 45K+ Alumni',
  },
  {
    id: 'ad_zerodha_varsity',
    advertiserName: 'Varsity by Zerodha',
    advertiserHandle: '@zerodhavarsity',
    advertiserInitials: 'ZV',
    avatarColor: '#059669',
    categoryTag: 'ECONOMY',
    tags: ['ECONOMY', 'INDIA', 'WORK', 'POLITICS'],
    headline: 'Free, Zero-Jargon Modules on Personal Finance & Indian Markets',
    body: 'Understand inflation, taxation, index funds, and long-term wealth building with structured chapters and certified quizzes.',
    ctaLabel: 'Start Learning Free',
    ctaUrl: 'https://zerodha.com/varsity/',
    domainLabel: 'zerodha.com/varsity',
    sponsoredDebatePrompt: 'Should financial literacy and tax basics be mandatory in Indian high schools?',
    metricsLabel: '100% Free · 2.4M Readers',
  },
  {
    id: 'ad_cricbuzz_plus',
    advertiserName: 'CricPulse Pro Analytics',
    advertiserHandle: '@cricpulse_pro',
    advertiserInitials: 'CP',
    avatarColor: '#d97706',
    categoryTag: 'SPORTS',
    tags: ['SPORTS', 'INDIA', 'CULTURE'],
    headline: 'Real-Time Win Probability & Ball-by-Ball Matchups for Every T20',
    body: 'Go beyond the scorecard with live wagon wheels, bowler release speed telemetry, and historical batter vs bowler splits.',
    ctaLabel: 'View Live Stats',
    ctaUrl: 'https://www.cricbuzz.com',
    domainLabel: 'cricbuzz.com',
    sponsoredDebatePrompt: 'Does data-driven matchup analytics make modern T20 captaincy too predictable?',
    metricsLabel: 'Live T20 Telemetry',
  },
  {
    id: 'ad_notion_workspaces',
    advertiserName: 'Notion India',
    advertiserHandle: '@NotionHQ',
    advertiserInitials: 'NT',
    avatarColor: '#334155',
    categoryTag: 'WORK',
    tags: ['WORK', 'TECH', 'EDUCATION'],
    headline: 'One Connected Workspace for Docs, Sprints, and Engineering Wikis',
    body: 'Cut meetings in half with async project specs, sprint boards, and instant team knowledge search built for modern teams.',
    ctaLabel: 'Try Notion Free',
    ctaUrl: 'https://www.notion.so',
    domainLabel: 'notion.so',
    sponsoredDebatePrompt: 'Does async written documentation produce better team decisions than daily standup meetings?',
    metricsLabel: 'Free for Students & Startups',
  },
  {
    id: 'ad_hindu_editorial',
    advertiserName: 'The Civic Dispatch',
    advertiserHandle: '@civic_dispatch',
    advertiserInitials: 'CD',
    avatarColor: '#4f46e5',
    categoryTag: 'POLITICS',
    tags: ['POLITICS', 'INDIA', 'SOCIETY', 'EDUCATION'],
    headline: 'Unbiased Policy Briefs: Both Sides of Every Parliamentary Bill',
    body: 'Read concise 5-minute briefings summarizing constitutional arguments, fiscal impact data, and expert viewpoints across the spectrum.',
    ctaLabel: 'Read Daily Brief',
    ctaUrl: 'https://prsindia.org',
    domainLabel: 'prsindia.org',
    sponsoredDebatePrompt: 'Should every new legislative bill include a mandatory public citizen consultation window?',
    metricsLabel: 'Non-Partisan Policy Research',
  },
  {
    id: 'ad_unstop_competitions',
    advertiserName: 'Unstop Hackathons',
    advertiserHandle: '@unstop_world',
    advertiserInitials: 'UN',
    avatarColor: '#0d9488',
    categoryTag: 'EDUCATION',
    tags: ['EDUCATION', 'TECH', 'WORK', 'INDIA'],
    headline: 'Compete in National Case Studies & Engineering Hackathons',
    body: 'Showcase real problem-solving skills to top recruiters through national coding challenges, product case competitions, and fellowships.',
    ctaLabel: 'Browse Challenges',
    ctaUrl: 'https://unstop.com',
    domainLabel: 'unstop.com',
    sponsoredDebatePrompt: 'Are real-world hackathons and portfolios better than standardized exams for hiring freshers?',
    metricsLabel: '11M+ Students & Early Pros',
  },
];

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  }
}

export function loadAdPreferences(): AdPreferences {
  try {
    const raw = localStorage.getItem(AD_PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdPreferences>;
      return {
        personalizedAdsEnabled:
          typeof parsed.personalizedAdsEnabled === 'boolean'
            ? parsed.personalizedAdsEnabled
            : true,
        tagAffinities:
          parsed.tagAffinities && typeof parsed.tagAffinities === 'object'
            ? parsed.tagAffinities
            : { ...DEFAULT_TAG_AFFINITIES },
        dismissedAdIds: Array.isArray(parsed.dismissedAdIds) ? parsed.dismissedAdIds : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Ignore storage error
  }
  return {
    personalizedAdsEnabled: true,
    tagAffinities: { ...DEFAULT_TAG_AFFINITIES },
    dismissedAdIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function saveAdPreferences(prefs: AdPreferences): void {
  try {
    localStorage.setItem(AD_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage error
  }
  syncAdSensePrivacyFlags(prefs.personalizedAdsEnabled);
}

export function recordTagAffinity(
  currentPrefs: AdPreferences,
  tags: string[],
  weight = 1
): AdPreferences {
  if (!currentPrefs.personalizedAdsEnabled || !tags || tags.length === 0) {
    return currentPrefs;
  }
  const updatedAffinities = { ...currentPrefs.tagAffinities };
  for (const rawTag of tags) {
    const clean = rawTag.replace(/^#/, '').trim().toUpperCase();
    if (!clean || clean === 'ALL') continue;
    updatedAffinities[clean] = Math.min(99, (updatedAffinities[clean] || 0) + weight);
  }
  const next: AdPreferences = {
    ...currentPrefs,
    tagAffinities: updatedAffinities,
    updatedAt: new Date().toISOString(),
  };
  saveAdPreferences(next);
  return next;
}

export function getTopInterestTags(prefs: AdPreferences, limit = 5): string[] {
  return Object.entries(prefs.tagAffinities)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function syncAdSensePrivacyFlags(personalizedAdsEnabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = (window.adsbygoogle = window.adsbygoogle || []);
    queue.requestNonPersonalizedAds = personalizedAdsEnabled ? 0 : 1;

    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
    if (clientId && clientId.startsWith('ca-pub-')) {
      const existingScript = document.querySelector('script[data-evaad-adsense="true"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
          clientId
        )}`;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-evaad-adsense', 'true');
        document.head.appendChild(script);
      }
    }
  } catch {
    // Ignore AdSense loader error in preview
  }
}

const AD_PACING_SEED_KEY = 'evaad_ad_pacing_seed_v1';
let memorySessionSeed: number | null = null;

function getSessionAdPacingSeed(): number {
  if (memorySessionSeed !== null) return memorySessionSeed;
  if (typeof window !== 'undefined') {
    try {
      const existing = window.sessionStorage.getItem(AD_PACING_SEED_KEY);
      if (existing) {
        const parsed = parseInt(existing, 10);
        if (!Number.isNaN(parsed)) {
          memorySessionSeed = parsed;
          return parsed;
        }
      }
      const generated = Math.floor(Math.random() * 1_000_000) + 1;
      window.sessionStorage.setItem(AD_PACING_SEED_KEY, String(generated));
      memorySessionSeed = generated;
      return generated;
    } catch {
      // Fallback to in-memory seed if sessionStorage is restricted
    }
  }
  memorySessionSeed = 48271;
  return memorySessionSeed;
}

function hashStepToRange(seed: number, feedKey: string, stepIndex: number, min: number, max: number): number {
  const str = `${seed}:${feedKey}:${stepIndex}`;
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const span = Math.max(1, max - min + 1);
  return min + (Math.abs(hash) % span);
}

/**
 * Computes session-stable variable ad placements spaced every `minGap` to `maxGap` items (default 6 to 10).
 * Returns a Map where key = 0-based item index after which an ad should render, and value = sequential slotIndex.
 * Feeds shorter than `minGap` items receive zero in-feed ads.
 */
export function getVariableAdPlacements(
  totalItems: number,
  feedKey = 'default',
  minGap = 6,
  maxGap = 10
): Map<number, number> {
  const placements = new Map<number, number>();
  if (totalItems < minGap) {
    return placements;
  }

  const seed = getSessionAdPacingSeed();
  let cursor = -1;
  let slotIndex = 0;

  while (cursor < totalItems) {
    const gap = hashStepToRange(seed, feedKey, slotIndex, minGap, maxGap);
    cursor += gap;
    if (cursor < totalItems) {
      placements.set(cursor, slotIndex);
      slotIndex += 1;
    }
  }

  return placements;
}

function applyAffiliateOverrides(campaign: SponsoredAdCampaign): SponsoredAdCampaign {
  const env = import.meta.env as Record<string, string | undefined>;
  const categorySpecificUrl =
    env[`VITE_AFFILIATE_${campaign.categoryTag.toUpperCase()}_URL`]?.trim() ||
    env.VITE_AFFILIATE_DEFAULT_URL?.trim();

  if (!categorySpecificUrl) {
    return campaign;
  }

  let domainLabel = campaign.domainLabel;
  try {
    const parsedUrl = new URL(categorySpecificUrl);
    domainLabel = parsedUrl.hostname.replace(/^www\./, '');
  } catch {
    // Keep original domainLabel if custom URL cannot be parsed
  }

  return {
    ...campaign,
    ctaUrl: categorySpecificUrl,
    domainLabel,
  };
}

export function selectCampaignForSlot(
  slotIndex: number,
  prefs: AdPreferences,
  contextualTags: string[] = []
): {
  campaign: SponsoredAdCampaign;
  matchedTag: string;
  isPersonalizedMatch: boolean;
} {
  const available = SPONSORED_CAMPAIGNS.filter(
    (c) => !prefs.dismissedAdIds.includes(c.id)
  );
  const pool = available.length > 0 ? available : SPONSORED_CAMPAIGNS;

  const normalizedContext = contextualTags
    .map((t) => t.replace(/^#/, '').trim().toUpperCase())
    .filter((t) => t && t !== 'ALL');

  // 1. If Personalized Ads is ON, score campaigns by user tag affinities + context
  if (prefs.personalizedAdsEnabled) {
    const topInterests = getTopInterestTags(prefs, 4);
    const scored = pool.map((campaign) => {
      let score = 0;
      let bestTag = campaign.categoryTag;
      let highestTagScore = -1;

      for (const tag of campaign.tags) {
        const tagScore = prefs.tagAffinities[tag] || 0;
        score += tagScore * 2;
        if (normalizedContext.includes(tag)) {
          score += 5;
        }
        if (tagScore > highestTagScore) {
          highestTagScore = tagScore;
          bestTag = tag;
        }
      }
      return {
        campaign,
        score,
        bestTag: topInterests.find((t) => campaign.tags.includes(t)) || bestTag,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[slotIndex % scored.length];
    return {
      campaign: applyAffiliateOverrides(chosen.campaign),
      matchedTag: chosen.bestTag,
      isPersonalizedMatch: true,
    };
  }

  // 2. Contextual-Only Mode (Personalized Ads OFF)
  if (normalizedContext.length > 0) {
    const contextMatches = pool.filter((c) =>
      c.tags.some((t) => normalizedContext.includes(t))
    );
    if (contextMatches.length > 0) {
      const chosen = contextMatches[slotIndex % contextMatches.length];
      const matched =
        chosen.tags.find((t) => normalizedContext.includes(t)) || chosen.categoryTag;
      return {
        campaign: applyAffiliateOverrides(chosen),
        matchedTag: matched,
        isPersonalizedMatch: false,
      };
    }
  }

  const fallback = pool[slotIndex % pool.length];
  return {
    campaign: applyAffiliateOverrides(fallback),
    matchedTag: fallback.categoryTag,
    isPersonalizedMatch: false,
  };
}

