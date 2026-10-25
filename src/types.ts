export interface Author {
  name: string;
  handle: string;
  avatarColor: string;
  initials: string;
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
  createdAt: string;
}

export interface Argument {
  id: string;
  debateId: string;
  side: 'for' | 'against';
  author: Author;
  content: string;
  likes: number;
  createdAt: string;
}

export type SortFilter = 'alternating' | 'for' | 'against';
