export interface Author {
  name: string;
  handle: string;
  avatarColor: string;
  initials: string;
  uid?: string;
  photoURL?: string;
  isGoogleUser?: boolean;
  usernameChangedAt?: string;
  isAnonymousPersona?: boolean;
}

export interface AuthenticitySource {
  title: string;
  url: string;
}

export interface AuthenticityResult {
  verdict: 'Verified Authentic' | 'Mostly Accurate' | 'Questionable / Unverified' | 'False or Misleading';
  score: number;
  analysis: string;
  sources: AuthenticitySource[];
  checkedAt: string;
}

export interface DebateSummary {
  overview: string;
  forPoints: string[];
  againstPoints: string[];
  consensusPoints: string[];
  frictionPoints: string[];
  keyTakeaway: string;
  generatedAt: string;
}

export interface ReferencePostEmbed {
  postId: string;
  authorName: string;
  authorHandle: string;
  authorAvatarColor: string;
  authorInitials: string;
  speakerLabel?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface Debate {
  id: string;
  title: string;
  tags: string[];
  author: Author;
  forVotes: number;
  againstVotes: number;
  views: number;
  likes: number;
  imageUrl?: string;
  imageCaption?: string;
  referencePost?: ReferencePostEmbed;
  createdAt: string;
  aiSummary?: DebateSummary;
}

export interface Argument {
  id: string;
  debateId: string;
  side: 'for' | 'against';
  author: Author;
  content: string;
  likes: number;
  imageUrl?: string;
  createdAt: string;
  authenticityCheck?: AuthenticityResult;
}

export interface SocialPost {
  id: string;
  author: Author;
  speakerTitle?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  views: number;
  debatesCreatedCount?: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  likes: number;
  createdAt: string;
}

export type SortFilter = 'alternating' | 'live' | 'for' | 'against';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface UsernameRecord {
  handle: string;
  uid: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'debate_comment'
  | 'debate_like'
  | 'argument_like'
  | 'post_comment'
  | 'post_like'
  | 'post_comment_like'
  | 'post_referenced';

export interface AppNotification {
  id: string;
  type: NotificationType;
  recipientHandle: string;
  recipientUid?: string;
  actor: Author;
  targetId: string;
  targetType: 'debate' | 'post';
  targetTitle: string;
  commentSnippet?: string;
  side?: 'for' | 'against';
  read: boolean;
  createdAt: string;
}

export type ModerationReportReason =
  | 'hate_speech'
  | 'harassment'
  | 'doxxing_privacy'
  | 'misinformation'
  | 'copyright'
  | 'spam'
  | 'other';

/**
 * 100% Untraceable Moderation Report
 * Strictly excludes any uid, handle, name, or session identifier so a report
 * can NEVER link back to the reporting user's identity.
 */
export interface AnonymousModerationReport {
  id: string;
  targetType: 'debate' | 'argument' | 'post' | 'post_comment';
  targetId: string;
  debateId: string;
  targetPreview: string;
  reason: ModerationReportReason;
  details?: string;
  status?: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}



