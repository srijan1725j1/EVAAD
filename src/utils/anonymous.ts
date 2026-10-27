import { Author } from '../types';

const DEBATE_PERSONA_STORAGE_KEY = 'evaad_debate_persona_v9';
const PUBLIC_POST_PROFILE_STORAGE_KEY = 'evaad_public_post_profile_v9';

export const PUBLIC_USERNAME_COOLDOWN_DAYS = 30;
export const PUBLIC_USERNAME_COOLDOWN_MS = PUBLIC_USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export const DESI_REDDIT_ADJECTIVES = [
  'Bindaas',
  'Jugaadu',
  'Sarcastic',
  'ChaiPowered',
  'Masaledar',
  'Sleepy',
  'Curious',
  'Unfiltered',
  'Toofani',
  'Logical',
  'Overthinking',
  'Sanskari',
  'Savage',
  'Wholesome',
  'Wandering',
  'Midnight',
  'Crispy',
  'Spicy',
  'Philosophical',
  'Caffeinated',
  'Nukkad',
  'Gully',
  'Desi',
  'Rational',
];

export const DESI_REDDIT_NOUNS = [
  'Chaiwala',
  'Samosa',
  'Chanakya',
  'Pundit',
  'Backbencher',
  'Biryani',
  'Philosopher',
  'Engineer',
  'Panchayat',
  'Rickshaw',
  'Kachori',
  'Pakora',
  'Zamindar',
  'VadaPav',
  'Jalebi',
  'Umpire',
  'Babu',
  'Scholar',
  'Monk',
  'Advocate',
  'Golgappa',
  'Paratha',
  'Observer',
  'Debater',
];

export const FUNNY_INDIAN_HANDLES = [
  'chai_pe_charcha',
  'samosa_scholar',
  'biryani_philosopher',
  'filter_kaapi_critic',
  'jugaad_engineer',
  'masala_dosa_monk',
  'auto_meter_skeptic',
  'pakora_pundit',
  'sharma_ji_ka_beta',
  'mohalla_moderator',
  'cutting_chai_sage',
  'paneer_propaganda',
  'golgappa_guru',
  'vada_pav_visionary',
  'midnight_maggi_mind',
  'tatkal_survivor',
  'silkboard_strategist',
  'rajma_chawal_rebel',
  'nimbu_paani_ninja',
  'nukkad_niti',
  'paratha_patriot',
  'chaat_chanakya',
  'fufaji_unfiltered',
  'raita_spiller',
  'gulab_jamun_justice',
  'bhel_puri_boss',
  'lassi_logician',
  'jalebi_strategist',
  'desi_socrates',
  'gully_umpire',
  'chutney_champion',
  'aam_aadmi_oracle',
  'metro_seat_hunter',
  'monsoon_maverick',
  'kaju_katli_king',
  'kulhad_intellectual',
  'tandoori_thinker',
  'chai_sutta_senator',
  'idli_sambar_scholar',
  'banarasi_babu',
  'poha_jalebi_pundit',
  'momos_dip_defender',
  'rickshaw_economist',
  'dadi_ma_ke_nuskhe',
  'chole_bhature_chief',
];

const SAMPLE_INDIAN_NAMES = [
  { name: 'Aarav Sharma', handle: 'aarav_sharma' },
  { name: 'Ananya Verma', handle: 'ananya_verma' },
  { name: 'Rohan Nair', handle: 'rohan_nair' },
  { name: 'Priya Iyer', handle: 'priya_iyer' },
  { name: 'Kabir Mehta', handle: 'kabir_mehta' },
  { name: 'Ishita Patel', handle: 'ishita_patel' },
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

export function generateFunnyDesiHandle(): string {
  const useCurated = Math.random() < 0.72;
  const num = Math.floor(10 + Math.random() * 89);

  if (useCurated) {
    const base = FUNNY_INDIAN_HANDLES[Math.floor(Math.random() * FUNNY_INDIAN_HANDLES.length)];
    return `${base}_${num}`;
  }

  const adj = DESI_REDDIT_ADJECTIVES[Math.floor(Math.random() * DESI_REDDIT_ADJECTIVES.length)]
    .trim()
    .toLowerCase();
  const noun = DESI_REDDIT_NOUNS[Math.floor(Math.random() * DESI_REDDIT_NOUNS.length)]
    .trim()
    .toLowerCase();
  return `${adj}_${noun}_${num}`;
}

export function deriveInitialsFromHandle(handle: string): string {
  const clean = handle.replace(/^@/, '').replace(/^u\//, '');
  const parts = clean.split('_').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || 'E'}${parts[1][0] || 'V'}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'EV';
}

export function deriveInitialsFromName(name: string, fallbackHandle = ''): string {
  const cleanName = name.replace(/^u\//, '').replace(/^@/, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[words.length - 1][0] || ''}`.toUpperCase();
  }
  if (cleanName.length >= 2) {
    return cleanName.slice(0, 2).toUpperCase();
  }
  return deriveInitialsFromHandle(fallbackHandle || 'EV');
}

/**
 * Strips ALL traceable account fields (uid, photoURL, real name, public handle)
 * so that a Debate or Debate Argument can NEVER be traced back to a user's
 * Public Post Profile or Google Account.
 */
export function stripTraceableFieldsForDebate(debateAuthor: Author): Author {
  const clean = debateAuthor.handle.replace(/^@+/, '').replace(/^u\//, '');
  return {
    name: `u/${clean}`,
    handle: `@${clean}`,
    avatarColor: debateAuthor.avatarColor || '#0284c7',
    initials: deriveInitialsFromHandle(clean),
  };
}

export function generateDebateAuthor(): Author {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const username = generateFunnyDesiHandle();
  const initials = deriveInitialsFromHandle(username);

  return {
    name: `u/${username}`,
    handle: `@${username}`,
    avatarColor: color,
    initials,
    isAnonymousPersona: true,
  };
}

/**
 * Returns the user's 100% Anonymous Debate Persona (used ONLY in the Debates section).
 * Never contains uid, real name, or public handle. Can be changed unlimited times.
 */
export function getCurrentAuthor(): Author {
  if (typeof window === 'undefined') return generateDebateAuthor();
  try {
    const raw = localStorage.getItem(DEBATE_PERSONA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Author;
      if (parsed && parsed.handle) {
        const clean = parsed.handle.replace(/^@+/, '').replace(/^u\//, '');
        return {
          name: `u/${clean}`,
          handle: `@${clean}`,
          avatarColor: parsed.avatarColor || '#0284c7',
          initials: deriveInitialsFromHandle(clean),
          isAnonymousPersona: true,
        };
      }
    }
  } catch {
    // fallback
  }

  const fresh = generateDebateAuthor();
  saveCurrentAuthor(fresh);
  return fresh;
}

export function saveCurrentAuthor(author: Author): void {
  try {
    const clean = author.handle.replace(/^@+/, '').replace(/^u\//, '');
    const untraceablePersona: Author = {
      name: `u/${clean}`,
      handle: `@${clean}`,
      avatarColor: author.avatarColor || '#0284c7',
      initials: deriveInitialsFromHandle(clean),
      isAnonymousPersona: true,
    };
    localStorage.setItem(DEBATE_PERSONA_STORAGE_KEY, JSON.stringify(untraceablePersona));
  } catch {
    // quota
  }
}

export function rerollAuthor(): Author {
  const fresh = generateDebateAuthor();
  saveCurrentAuthor(fresh);
  return fresh;
}

/**
 * Generates an initial Public Post Profile (Real Name + Desired @username)
 * used ONLY in the Posts section so people can connect together.
 */
export function generateDefaultPublicPostAuthor(): Author {
  const sample = SAMPLE_INDIAN_NAMES[Math.floor(Math.random() * SAMPLE_INDIAN_NAMES.length)];
  const suffix = Math.floor(10 + Math.random() * 89);
  const handle = `${sample.handle}_${suffix}`;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    name: sample.name,
    handle: `@${handle}`,
    avatarColor: color,
    initials: deriveInitialsFromName(sample.name, handle),
    isAnonymousPersona: false,
  };
}

export function getPublicPostAuthor(): Author {
  if (typeof window === 'undefined') return generateDefaultPublicPostAuthor();
  try {
    const raw = localStorage.getItem(PUBLIC_POST_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Author;
      if (parsed && parsed.handle && parsed.name) {
        const clean = parsed.handle.replace(/^@+/, '').replace(/^u\//, '');
        return {
          ...parsed,
          name: parsed.name.trim(),
          handle: `@${clean}`,
          initials: deriveInitialsFromName(parsed.name, clean),
          isAnonymousPersona: false,
        };
      }
    }
  } catch {
    // fallback
  }

  const initial = generateDefaultPublicPostAuthor();
  savePublicPostAuthor(initial);
  return initial;
}

export function savePublicPostAuthor(author: Author): void {
  try {
    const clean = author.handle.replace(/^@+/, '').replace(/^u\//, '');
    const cleanName = author.name.trim() || clean;
    const saved: Author = {
      ...author,
      name: cleanName,
      handle: `@${clean}`,
      initials: deriveInitialsFromName(cleanName, clean),
      isAnonymousPersona: false,
    };
    localStorage.setItem(PUBLIC_POST_PROFILE_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // quota
  }
}

/**
 * Checks whether the user can change their Public Post @username
 * (enforces a 30-day / 1-month limit between public username changes).
 */
export function getPublicUsernameCooldownStatus(publicAuthor: Author): {
  canChange: boolean;
  daysRemaining: number;
  nextChangeDate: string | null;
} {
  if (!publicAuthor.usernameChangedAt) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const lastChangeMs = new Date(publicAuthor.usernameChangedAt).getTime();
  if (Number.isNaN(lastChangeMs)) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const elapsedMs = Date.now() - lastChangeMs;
  if (elapsedMs >= PUBLIC_USERNAME_COOLDOWN_MS) {
    return { canChange: true, daysRemaining: 0, nextChangeDate: null };
  }

  const remainingMs = PUBLIC_USERNAME_COOLDOWN_MS - elapsedMs;
  const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const nextDate = new Date(lastChangeMs + PUBLIC_USERNAME_COOLDOWN_MS).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    canChange: false,
    daysRemaining,
    nextChangeDate: nextDate,
  };
}
