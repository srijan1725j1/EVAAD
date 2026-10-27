import {
  Debate,
  Argument,
  SocialPost,
  PostComment,
  AppNotification,
  AnonymousModerationReport,
} from '../types';
import {
  INITIAL_DEBATES,
  INITIAL_ARGUMENTS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_POST_COMMENTS,
  createInitialNotifications,
} from '../data/seedData';

const DEBATES_STORAGE_KEY = 'evaad_debates_v8';
const ARGUMENTS_STORAGE_KEY = 'evaad_arguments_v8';
const SOCIAL_POSTS_STORAGE_KEY = 'evaad_social_posts_v10';
const POST_COMMENTS_STORAGE_KEY = 'evaad_post_comments_v10';
const USER_VOTES_KEY = 'evaad_user_votes_v8';
const USER_ARG_LIKES_KEY = 'evaad_user_arg_likes_v8';
const USER_DEBATE_LIKES_KEY = 'evaad_user_debate_likes_v8';
const USER_POST_LIKES_KEY = 'evaad_user_post_likes_v8';
const USER_POST_COMMENT_LIKES_KEY = 'evaad_user_post_comm_likes_v8';
const NOTIFICATIONS_STORAGE_KEY = 'evaad_notifications_v9';
const PUSH_ALERTS_ENABLED_KEY = 'evaad_push_alerts_enabled_v9';
const REPORTED_ITEMS_KEY = 'evaad_reported_items_v1';
const ANONYMOUS_REPORTS_LOG_KEY = 'evaad_anonymous_reports_v1';

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

export function getStoredSocialPosts(): SocialPost[] {
  if (typeof window === 'undefined') return INITIAL_SOCIAL_POSTS;
  try {
    const raw = localStorage.getItem(SOCIAL_POSTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveStoredSocialPosts(INITIAL_SOCIAL_POSTS);
  return INITIAL_SOCIAL_POSTS;
}

export function saveStoredSocialPosts(posts: SocialPost[]): void {
  try {
    localStorage.setItem(SOCIAL_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // quota
  }
}

export function getStoredPostComments(): PostComment[] {
  if (typeof window === 'undefined') return INITIAL_POST_COMMENTS;
  try {
    const raw = localStorage.getItem(POST_COMMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveStoredPostComments(INITIAL_POST_COMMENTS);
  return INITIAL_POST_COMMENTS;
}

export function saveStoredPostComments(comments: PostComment[]): void {
  try {
    localStorage.setItem(POST_COMMENTS_STORAGE_KEY, JSON.stringify(comments));
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

export function getStoredUserPostLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_POST_LIKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredUserPostLikes(likes: Record<string, boolean>): void {
  try {
    localStorage.setItem(USER_POST_LIKES_KEY, JSON.stringify(likes));
  } catch {
    // quota
  }
}

export function getStoredUserPostCommentLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_POST_COMMENT_LIKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredUserPostCommentLikes(likes: Record<string, boolean>): void {
  try {
    localStorage.setItem(USER_POST_COMMENT_LIKES_KEY, JSON.stringify(likes));
  } catch {
    // quota
  }
}

export function getStoredNotifications(recipientHandle: string): AppNotification[] {
  const initial = createInitialNotifications(recipientHandle);
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  saveStoredNotifications(initial);
  return initial;
}

export function saveStoredNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)));
  } catch {
    // quota
  }
}

export function getStoredPushEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(PUSH_ALERTS_ENABLED_KEY);
    if (raw !== null) return raw === 'true';
  } catch {
    // fallback
  }
  return true;
}

export function saveStoredPushEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PUSH_ALERTS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // quota
  }
}

export function getStoredReportedItems(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REPORTED_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredReportedItems(items: Record<string, boolean>): void {
  try {
    localStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // quota
  }
}

export function getStoredAnonymousReports(): AnonymousModerationReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANONYMOUS_REPORTS_LOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredAnonymousReports(reports: AnonymousModerationReport[]): void {
  try {
    localStorage.setItem(ANONYMOUS_REPORTS_LOG_KEY, JSON.stringify(reports.slice(0, 100)));
  } catch {
    // quota
  }
}


