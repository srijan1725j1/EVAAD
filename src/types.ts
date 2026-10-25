export interface Author {
  name: string;
  handle: string;
  avatarColor: string;
  initials: string;
  uid?: string;
  photoURL?: string;
  isGoogleUser?: boolean;
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

export type SortFilter = 'alternating' | 'live' | 'for' | 'against';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
