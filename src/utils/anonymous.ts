import { Author } from '../types';

const STORAGE_KEY = 'evaad_user_author_v7';

const REDDIT_PREFIXES = [
  'Quiet',
  'Curious',
  'Snoo',
  'Alert',
  'Odd',
  'Deep',
  'Logical',
  'Cautious',
  'Wholesome',
  'Remarkable',
  'Sleepy',
  'Intrepid',
  'Mysterious',
  'Humble',
  'Sarcastic',
  'Hyper',
  'Zenith',
  'Nomadic',
  'Wandering',
  'Caffeinated',
];

const REDDIT_NOUNS = [
  'Carpenter',
  'Otter',
  'Astronaut',
  'Candidate',
  'Bat',
  'Walrus',
  'Habits',
  'Philosopher',
  'Explorer',
  'Redditor',
  'Developer',
  'Observer',
  'Pigeon',
  'Badger',
  'Thinker',
  'Mechanic',
  'Architect',
  'Voyager',
  'ChaiWallah',
  'Savant',
];

const COMMUNITY_ANON_HANDLES = [
  'throwaway_delhi',
  'silkboard_survivor',
  'chai_pe_charcha',
  'samosa_supremacist',
  'whitefield_coder',
  'kothibangla_check',
  'filter_coffee_purist',
  'auto_meter_skeptic',
  'midnight_swiggy_fiend',
  'metro_commuter_blr',
  'dal_chawal_gang',
  'tech_pleb_blr',
  'rational_redditor',
  'lurker_since_2016',
  'peak_bengaluru_moment',
  'delhi_smog_breather',
  'garam_masala_drop',
  'indiaspora_anon',
  'cynical_optimist',
  'hyderabad_biryani_fan',
];

const COLORS = [
  '#0284c7', // Sky Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#e11d48', // Crimson
];

export function generateAuthor(): Author {
  const isCommunityAnon = Math.random() > 0.45;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  if (isCommunityAnon) {
    const base = COMMUNITY_ANON_HANDLES[Math.floor(Math.random() * COMMUNITY_ANON_HANDLES.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const username = `${base}_${num}`;
    const initials = username
      .split('_')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

    return {
      name: `u/${username}`,
      handle: `@${username}`,
      avatarColor: color,
      initials: initials || 'RD',
    };
  }

  const prefix = REDDIT_PREFIXES[Math.floor(Math.random() * REDDIT_PREFIXES.length)];
  const noun = REDDIT_NOUNS[Math.floor(Math.random() * REDDIT_NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const username = `${prefix}_${noun}_${num}`;
  const initials = `${prefix[0]}${noun[0]}`.toUpperCase();

  return {
    name: `u/${username}`,
    handle: `@${username}`,
    avatarColor: color,
    initials,
  };
}

export function getCurrentAuthor(): Author {
  if (typeof window === 'undefined') return generateAuthor();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const fresh = generateAuthor();
  saveCurrentAuthor(fresh);
  return fresh;
}

export function saveCurrentAuthor(author: Author): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(author));
  } catch {
    // quota
  }
}

export function rerollAuthor(): Author {
  const fresh = generateAuthor();
  saveCurrentAuthor(fresh);
  return fresh;
}
