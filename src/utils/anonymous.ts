import { Author } from '../types';

const STORAGE_KEY = 'evaad_user_author_v3';

const NAMES = [
  { name: 'Thinker', initials: 'TH' },
  { name: 'Logician', initials: 'LG' },
  { name: 'Seeker', initials: 'SK' },
  { name: 'Dialectic', initials: 'DL' },
  { name: 'Observer', initials: 'OB' },
  { name: 'Skeptic', initials: 'SP' },
  { name: 'Pragmatist', initials: 'PR' },
  { name: 'Jurist', initials: 'JR' },
  { name: 'Philosopher', initials: 'PH' },
];

const COLORS = [
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#6366f1', // Indigo
];

export function generateAuthor(): Author {
  const chosen = NAMES[Math.floor(Math.random() * NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    name: `${chosen.name} #${num}`,
    handle: `@${chosen.name.toLowerCase()}${num}`,
    avatarColor: color,
    initials: chosen.initials,
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
