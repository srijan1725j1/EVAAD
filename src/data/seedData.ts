import { Debate, Argument } from '../types';

export const INITIAL_DEBATES: Debate[] = [
  {
    id: 'debate_ucc',
    title: 'Should India implement a Uniform Civil Code replacing personal religious family laws?',
    tags: ['POLITICS', 'CONSTITUTION', 'INDIA'],
    author: {
      name: 'Jurist #215',
      handle: '@jurist215',
      avatarColor: '#3b82f6',
      initials: 'J',
    },
    forVotes: 284,
    againstVotes: 236,
    views: 3410,
    likes: 182,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_reservation',
    title: 'Does caste-based affirmative action diminish merit, or is standardized merit a proxy for generational privilege?',
    tags: ['SOCIETY', 'EDUCATION', 'INDIA'],
    author: {
      name: 'Scholar #409',
      handle: '@scholar409',
      avatarColor: '#8b5cf6',
      initials: 'S',
    },
    forVotes: 312,
    againstVotes: 298,
    views: 4120,
    likes: 245,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_speech_blasphemy',
    title: 'Should freedom of expression protect provocative religious satire, or should hate-speech laws prohibit intentional desecration?',
    tags: ['FREE SPEECH', 'ETHICS', 'LAW'],
    author: {
      name: 'Dialectic #104',
      handle: '@dialectic104',
      avatarColor: '#06b6d4',
      initials: 'D',
    },
    forVotes: 198,
    againstVotes: 215,
    views: 2890,
    likes: 167,
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_ai_replace_creatives',
    title: 'Will generative AI democratize artistic creation, or irreversibly devalue human artistic labor?',
    tags: ['TECH', 'AI', 'CULTURE'],
    author: {
      name: 'Observer #882',
      handle: '@observer882',
      avatarColor: '#ec4899',
      initials: 'O',
    },
    forVotes: 420,
    againstVotes: 388,
    views: 5200,
    likes: 310,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_remote_work',
    title: 'Is permanent remote work eroding junior career mentorship and collective organizational trust?',
    tags: ['WORK', 'LIFESTYLE', 'FUTURE'],
    author: {
      name: 'Pragmatist #930',
      handle: '@pragmatist930',
      avatarColor: '#f59e0b',
      initials: 'P',
    },
    forVotes: 165,
    againstVotes: 184,
    views: 1980,
    likes: 124,
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_cricket_monopoly',
    title: "Does cricket's corporate dominance in India actively crowd out Olympic and grassroots athletics?",
    tags: ['SPORTS', 'INDIA', 'POLICY'],
    author: {
      name: 'Seeker #602',
      handle: '@seeker602',
      avatarColor: '#10b981',
      initials: 'S',
    },
    forVotes: 245,
    againstVotes: 210,
    views: 2750,
    likes: 153,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_ARGUMENTS: Argument[] = [
  // Uniform Civil Code
  {
    id: 'arg_ucc_for_1',
    debateId: 'debate_ucc',
    side: 'for',
    author: {
      name: 'Jurist #215',
      handle: '@jurist215',
      avatarColor: '#3b82f6',
      initials: 'J',
    },
    content:
      'Fundamental human rights must not depend on which faith one is born into. Equal rights for women regarding inheritance, divorce, and maintenance are constitutional necessities that must transcend personal law exemptions.',
    likes: 68,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_ucc_against_1',
    debateId: 'debate_ucc',
    side: 'against',
    author: {
      name: 'Constitutionalist #512',
      handle: '@const512',
      avatarColor: '#f43f5e',
      initials: 'C',
    },
    content:
      'India’s cohesion has endured because communities were guaranteed autonomy over their spiritual traditions under Article 25. A uniform code drafted by majoritarian consensus risks alienating tribal and minority customary protections.',
    likes: 62,
    createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_ucc_for_2',
    debateId: 'debate_ucc',
    side: 'for',
    author: {
      name: 'Reformer #318',
      handle: '@reformer318',
      avatarColor: '#06b6d4',
      initials: 'R',
    },
    content:
      'Most modern Muslim-majority nations (Turkey, Tunisia, Morocco) have reformed their personal codes decades ago. Framing gender parity as an anti-religious attack ignores that orthodox clergy worldwide resist equality.',
    likes: 47,
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_ucc_against_2',
    debateId: 'debate_ucc',
    side: 'against',
    author: {
      name: 'Pluralist #804',
      handle: '@pluralist804',
      avatarColor: '#ec4899',
      initials: 'P',
    },
    content:
      'Progressive reform is most durable when it emerges from within communities through social dialogue, rather than imposed through penal statutes that foster suspicion and reactionary politics.',
    likes: 41,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },

  // Reservation / Affirmative Action
  {
    id: 'arg_res_for_1',
    debateId: 'debate_reservation',
    side: 'for',
    author: {
      name: 'Sociologist #112',
      handle: '@soc112',
      avatarColor: '#8b5cf6',
      initials: 'S',
    },
    content:
      'What we call "merit" in standardized tests directly reflects three generations of clean tap water, quiet study rooms, English-speaking parents, and expensive coaching centers. Reservation corrects for structural head-starts, not lack of intellect.',
    likes: 89,
    createdAt: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_res_against_1',
    debateId: 'debate_reservation',
    side: 'against',
    author: {
      name: 'MeritAdvocate #701',
      handle: '@merit701',
      avatarColor: '#f59e0b',
      initials: 'M',
    },
    content:
      'Affirmative action should target household economic hardship rather than birth identities that are increasingly weaponized by politicians. Elite members within reserved categories capture all benefits while poor unreserved students are locked out.',
    likes: 82,
    createdAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_res_for_2',
    debateId: 'debate_reservation',
    side: 'for',
    author: {
      name: 'Historian #334',
      handle: '@historian334',
      avatarColor: '#06b6d4',
      initials: 'H',
    },
    content:
      'Caste discrimination is social stigma and spatial segregation, not just economic poverty. A wealthy Dalit family still faces marriage boycotts, housing refusals, and casteist slurs. Social representation cannot be substituted by income certificates alone.',
    likes: 58,
    createdAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_res_against_2',
    debateId: 'debate_reservation',
    side: 'against',
    author: {
      name: 'Realist #629',
      handle: '@realist629',
      avatarColor: '#f43f5e',
      initials: 'R',
    },
    content:
      '75 years of expanding quotas has not fixed primary schooling in rural areas—where the real failure occurs. Politicians expand quotas to 70% to avoid building universities and quality schools, driving India’s top researchers and talent overseas.',
    likes: 54,
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
  },

  // Free Speech vs Blasphemy
  {
    id: 'arg_sp_for_1',
    debateId: 'debate_speech_blasphemy',
    side: 'for',
    author: {
      name: 'Dialectic #104',
      handle: '@dialectic104',
      avatarColor: '#06b6d4',
      initials: 'D',
    },
    content:
      'Ideas do not have human rights; people do. The moment the law shields religious beliefs from mockery or critique, the most dogmatic faction dictates what the entire society is permitted to write, paint, or think.',
    likes: 74,
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_sp_against_1',
    debateId: 'debate_speech_blasphemy',
    side: 'against',
    author: {
      name: 'PeaceAdvocate #219',
      handle: '@peace219',
      avatarColor: '#10b981',
      initials: 'P',
    },
    content:
      'In densely packed, pluralistic societies with histories of communal riots, speech is not abstract philosophy—deliberate desecration of sacred symbols is calculated incitement intended to provoke mob violence and tear social peace apart.',
    likes: 71,
    createdAt: new Date(Date.now() - 340 * 60 * 1000).toISOString(),
  },

  // AI & Creative Labor
  {
    id: 'arg_ai_for_1',
    debateId: 'debate_ai_replace_creatives',
    side: 'for',
    author: {
      name: 'Technologist #504',
      handle: '@tech504',
      avatarColor: '#3b82f6',
      initials: 'T',
    },
    content:
      'Generative tools lower the capital threshold for storytelling. An independent kid from a small town can now generate storyboards, game textures, and symphonies that previously required a $10M Hollywood studio budget.',
    likes: 96,
    createdAt: new Date(Date.now() - 600 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_ai_against_1',
    debateId: 'debate_ai_replace_creatives',
    side: 'against',
    author: {
      name: 'Artist #882',
      handle: '@artist882',
      avatarColor: '#ec4899',
      initials: 'A',
    },
    content:
      'These models were trained on millions of copyrighted paintings and articles without compensation or consent. By turning art into zero-marginal-cost algorithmic slurry, we are bankrupting the very creators whose talent machines mimic.',
    likes: 91,
    createdAt: new Date(Date.now() - 580 * 60 * 1000).toISOString(),
  },
];
