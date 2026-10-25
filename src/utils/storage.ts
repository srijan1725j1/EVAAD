import { Debate, Argument } from '../types';
import { INITIAL_DEBATES, INITIAL_ARGUMENTS } from '../data/seedData';

const DEBATES_STORAGE_KEY = 'evaad_debates_v4';
const ARGUMENTS_STORAGE_KEY = 'evaad_arguments_v4';
const USER_VOTES_KEY = 'evaad_user_votes_v4';
const USER_ARG_LIKES_KEY = 'evaad_user_arg_likes_v4';
const USER_DEBATE_LIKES_KEY = 'evaad_user_debate_likes_v4';

export function getStoredDebates(): Debate[] {
  if (typeof window === 'undefined') return INITIAL_DEBATES;
  try {
    const raw = localStorage.getItem(DEBATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveStoredDebates(INITIAL_DEBATES);
  return INITIAL_DEBATES;
}

export function saveStoredDebates(debates: Debate[]): void {
  try {
    localStorage.setItem(DEBATES_STORAGE_KEY, JSON.stringify(debates));
  } catch {
    // quota
  }
}

export function getStoredArguments(): Argument[] {
  if (typeof window === 'undefined') return INITIAL_ARGUMENTS;
  try {
    const raw = localStorage.getItem(ARGUMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveStoredArguments(INITIAL_ARGUMENTS);
  return INITIAL_ARGUMENTS;
}

export function saveStoredArguments(args: Argument[]): void {
  try {
    localStorage.setItem(ARGUMENTS_STORAGE_KEY, JSON.stringify(args));
  } catch {
    // quota
  }
}

export function getStoredUserVotes(): Record<string, 'for' | 'against'> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_VOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredUserVotes(votes: Record<string, 'for' | 'against'>): void {
  try {
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
  } catch {
    // quota
  }
}

export function getStoredUserArgLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_ARG_LIKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredUserArgLikes(likes: Record<string, boolean>): void {
  try {
    localStorage.setItem(USER_ARG_LIKES_KEY, JSON.stringify(likes));
  } catch {
    // quota
  }
}

export function getStoredUserDebateLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_DEBATE_LIKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredUserDebateLikes(likes: Record<string, boolean>): void {
  try {
    localStorage.setItem(USER_DEBATE_LIKES_KEY, JSON.stringify(likes));
  } catch {
    // quota
  }
}
