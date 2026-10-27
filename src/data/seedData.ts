import { Debate, Argument, SocialPost, PostComment, AppNotification } from '../types';

export const INITIAL_DEBATES: Debate[] = [
  {
    id: 'debate_india_vegetarianism',
    title: 'Does official NFHS survey data prove that India being a predominantly vegetarian country is an urban myth?',
    tags: ['CULTURE', 'DATA', 'INDIA', 'SOCIETY'],
    imageUrl: '/assets/india_veg_chart.svg',
    imageCaption: 'NFHS-5: Over 71% of Indian adults report consuming meat, poultry, fish, or eggs, challenging the global stereotype.',
    author: {
      name: 'u/curious_caterpillar_89',
      handle: '@curious_caterpillar_89',
      avatarColor: '#0ea5e9',
      initials: 'CC',
    },
    forVotes: 1840,
    againstVotes: 1420,
    views: 24800,
    likes: 1240,
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: 'debate_70_hour_workweek',
    title: 'Is a 70-hour work week necessary for India to become a developed economy, or is it toxic exploitation disguised as patriotism?',
    tags: ['CAREER', 'STARTUPS', 'INDIA', 'WORK'],
    referencePost: {
      postId: 'post_founder_70hr_statement',
      authorName: 'u/narayan_tech_vision',
      authorHandle: '@narayan_tech_vision',
      authorAvatarColor: '#0284c7',
      authorInitials: 'NT',
      speakerLabel: 'IT Industry Veteran · Public Statement',
      content:
        '"India’s work productivity is among the lowest in the world. Just like Japan and Germany rebuilt after WWII, our youngsters must say: This is my country, I want to work 70 hours a week to make India #1."',
      createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    },
    author: {
      name: 'u/throwaway_delhi_coder',
      handle: '@throwaway_delhi_coder',
      avatarColor: '#f59e0b',
      initials: 'TD',
    },
    forVotes: 680,
    againstVotes: 1940,
    views: 19500,
    likes: 890,
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: 'debate_tier1_vs_tier2',
    title: 'Are people wasting their prime youth paying ₹45k rent and breathing toxic smog in Bangalore/Delhi instead of moving to Tier-2 cities?',
    tags: ['LIFESTYLE', 'BANGALORE', 'CITIES', 'RENT'],
    author: {
      name: 'u/silkboard_survivor_99',
      handle: '@silkboard_survivor_99',
      avatarColor: '#ec4899',
      initials: 'SS',
    },
    forVotes: 1320,
    againstVotes: 940,
    views: 16200,
    likes: 780,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_delivery_platform_fees',
    title: 'Has quick-commerce transformed from convenient service into a gouging racket of hidden platform fees and exploited gig riders?',
    tags: ['CONSUMER', 'STARTUPS', 'TECH'],
    author: {
      name: 'u/midnight_swiggy_fiend',
      handle: '@midnight_swiggy_fiend',
      avatarColor: '#10b981',
      initials: 'MS',
    },
    forVotes: 1540,
    againstVotes: 620,
    views: 14100,
    likes: 830,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_engineering_degree_scam',
    title: 'Is paying ₹15–25 Lakhs for a tier-3 private engineering degree an outright financial scam in the era of generative AI?',
    tags: ['EDUCATION', 'TECH', 'STUDENTS'],
    author: {
      name: 'u/tech_pleb_blr',
      handle: '@tech_pleb_blr',
      avatarColor: '#8b5cf6',
      initials: 'TP',
    },
    forVotes: 1180,
    againstVotes: 510,
    views: 12400,
    likes: 670,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'debate_ucc',
    title: 'Should India implement a Uniform Civil Code replacing faith-based personal family laws with common civil rights?',
    tags: ['POLITICS', 'CONSTITUTION', 'INDIA'],
    author: {
      name: 'u/rational_redditor_01',
      handle: '@rational_redditor_01',
      avatarColor: '#3b82f6',
      initials: 'RR',
    },
    forVotes: 890,
    againstVotes: 810,
    views: 10900,
    likes: 540,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_ARGUMENTS: Argument[] = [
  // --- Vegetarianism in India (NFHS Data) ---
  {
    id: 'arg_veg_for_1',
    debateId: 'debate_india_vegetarianism',
    side: 'for',
    author: {
      name: 'u/chai_pe_charcha_23',
      handle: '@chai_pe_charcha_23',
      avatarColor: '#0ea5e9',
      initials: 'CP',
    },
    content:
      'Grew up in Kolkata and moved to Bangalore for tech. Walk into literally any fish market in Bengal, Kerala, Andhra, or coastal Goa at 6:30 AM on a Sunday — people from every single social and income strata are standing in knee-deep slush bargaining for rohu, hilsa, and mutton.\n\nThe NFHS-5 survey numbers aren’t a statistical fluke: eastern and southern states report 95%+ non-vegetarian consumption. The global myth that 1.4 billion Indians survive exclusively on paneer and moong dal was created and exported by upper-caste urban diaspora who dominated western media and academia for decades while representing less than 15% of the subcontinent.\n\nEven in states like Maharashtra and Punjab, the majority of youth eat poultry outside their family homes. When you aggregate actual ground reality, India is undeniably a meat-eating civilization.',
    likes: 312,
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_veg_against_1',
    debateId: 'debate_india_vegetarianism',
    side: 'against',
    author: {
      name: 'u/dal_chawal_gang_42',
      handle: '@dal_chawal_gang_42',
      avatarColor: '#f59e0b',
      initials: 'DC',
    },
    content:
      'Reddit always conflates "Do you ever eat meat?" checkboxes on a survey with actual dietary reality.\n\nLook at FAO per capita meat consumption statistics: India consumes roughly 4.5 kg of meat per person per year. For comparison, the USA is at 124 kg, Europe is at 80 kg, and China is at 63 kg. Even Vietnam and Thailand eat 10x more meat per capita than India!\n\nWhy? Because 90% of meals in an Indian home are dal, roti, seasonal sabzi, rice, and dahi. Eating chicken biryani once every two weeks on a Sunday or having a roll with college friends does not make you a meat-centric diet culture.\n\nFurthermore, look at the sacred calendar: people observe strict vegetarianism on Tuesdays, Thursdays, Saturdays, during Navratri, Shravan month, Pitru Paksha, and Ekadashi. We have over 380 million strict lifelong vegetarians — larger than the entire population of the US. No other country in the world mandates green/red dots on every single processed grocery item by federal statute.',
    likes: 278,
    createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_veg_for_2',
    debateId: 'debate_india_vegetarianism',
    side: 'for',
    author: {
      name: 'u/Quiet_Carpenter_814',
      handle: '@Quiet_Carpenter_814',
      avatarColor: '#10b981',
      initials: 'QC',
    },
    content:
      'Doctor here working in rural health centers across MP and Bihar. Let’s talk about the dark side of this debate:\n\nEquating low per capita meat intake with "peaceful spiritual choice" is an insult to poor families who literally cannot afford protein. In our malnutrition clinics, we see 4-year-olds with kwashiorkor and chronic stunting because their daily food is watered-down rice starch and salt.\n\nWhenever state governments try to introduce boiled eggs into midday school meals — the single cheapest, most bioavailable protein for anemic children — moral police and religious lobbies protest outside collectorates and force eggs off the menu. Forcing poverty-induced protein starvation into a celebrated cultural badge of vegetarianism is actively harming our children’s neurological development.',
    likes: 245,
    createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_veg_against_2',
    debateId: 'debate_india_vegetarianism',
    side: 'against',
    author: {
      name: 'u/samosa_supremacist_42',
      handle: '@samosa_supremacist_42',
      avatarColor: '#ec4899',
      initials: 'SS',
    },
    content:
      'Where else on planet earth does an international corporate food giant like McDonald’s, Domino’s, or KFC have to build physically partitioned kitchens, separate cooking utensils, dedicated fryers, and separate delivery bags just to be allowed to operate?\n\nWalk through Gujarat, Rajasthan, MP, Haryana, or West UP. Entire highway corridors spanning hundreds of kilometers have strict "Pure Veg Only" dhabas because truck drivers and family road-trippers will not stop anywhere else. You cannot dismiss 400 million people who refuse to even share a refrigerator with eggs as a "myth".',
    likes: 198,
    createdAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_veg_for_3',
    debateId: 'debate_india_vegetarianism',
    side: 'for',
    author: {
      name: 'u/delhi_smog_breather',
      handle: '@delhi_smog_breather',
      avatarColor: '#06b6d4',
      initials: 'DS',
    },
    content:
      'Check ancient Ayurvedic compendiums like Charaka Samhita and Sushruta Samhita. Entire chapters detail the therapeutic virtues of venison broth, partridge, goat meat, and fish for patients recovering from wasting diseases and combat trauma.\n\nThe idea that ancient India had a monolithic Satvik diet is a modern revisionist fantasy that erases India’s tribal communities, coastal fisheries, and regional culinary history.',
    likes: 142,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },

  // --- 70-Hour Work Week ---
  {
    id: 'arg_70hr_for_1',
    debateId: 'debate_70_hour_workweek',
    side: 'for',
    author: {
      name: 'u/Logical_Walrus_19',
      handle: '@Logical_Walrus_19',
      avatarColor: '#3b82f6',
      initials: 'LW',
    },
    content:
      'Unpopular opinion on Reddit, but look at macroeconomic history without emotional blinders:\n\nPost-WWII Japan rebuilt from atomic devastation through brutal 70-hour weeks. South Korea transformed from an agrarian wasteland poorer than Sub-Saharan Africa into a semiconductor powerhouse (Samsung, Hyundai, LG) through the "Saemaul Undong" era of relentless overtime. Shenzhen in the 1980s and 1990s didn’t achieve 15% GDP growth with 35-hour European work weeks and 2-month summer holidays.\n\nDeveloping nations with a per-capita GDP of $2,600 simply cannot afford Scandinavian work-life balance while 300 million citizens live below the poverty line. We need intense industrial productivity to build basic global competitiveness before we earn the luxury of chilling.',
    likes: 184,
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_70hr_against_1',
    debateId: 'debate_70_hour_workweek',
    side: 'against',
    author: {
      name: 'u/Alert_Candidate_339',
      handle: '@Alert_Candidate_339',
      avatarColor: '#f43f5e',
      initials: 'AC',
    },
    content:
      'Notice how it is ALWAYS billionaire founders with thousands of crores in equity dividends telling freshers earning ₹25,000 a month to work 70 hours a week?\n\nIf you own 10% of the startup or company, working 70 hours makes total financial sense — your upside is generational wealth. But asking an outsourced IT service engineer or contract junior dev to sacrifice their health, family, and sanity for a 3% annual hike while the CEO buys a sea-facing duplex in Worli is not "nation building" — it is unvarnished feudal exploitation.\n\nMultiple scientific studies on cognitive labor show that software engineering and knowledge work suffer diminishing returns after 40 hours. Past 50 hours, sleep-deprived engineers write buggy code, introduce security vulnerabilities, and spend the remaining 20 hours fixing their own mistakes.',
    likes: 420,
    createdAt: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_70hr_against_2',
    debateId: 'debate_70_hour_workweek',
    side: 'against',
    author: {
      name: 'u/whitefield_coder_77',
      handle: '@whitefield_coder_77',
      avatarColor: '#8b5cf6',
      initials: 'WC',
    },
    content:
      'Let’s do the math on a "70-hour work week" in Bangalore:\n\n• 14 hours per day at the desk (e.g. 9 AM to 11 PM)\n• 2.5 hours round-trip commute stuck at Marathahalli / Silk Board / Hebbal\n• 6 hours sleep (if you fall asleep the second your head hits the pillow)\n• 1.5 hours for eating, bathing, and basic human hygiene\n\nTotal = 24 hours. Zero time for physical exercise, zero time to call your aging parents, zero time to cook a wholesome meal, zero time for hobbies or dating. In your 30s, you end up with hypertension, fatty liver, slipped discs, and psychiatric burnout. Then your corporate HR replaces you in 48 hours without a second thought.',
    likes: 389,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },

  // --- Tier 1 vs Tier 2 Living ---
  {
    id: 'arg_tier1_for_1',
    debateId: 'debate_tier1_vs_tier2',
    side: 'for',
    author: {
      name: 'u/kothibangla_checker',
      handle: '@kothibangla_checker',
      avatarColor: '#0ea5e9',
      initials: 'KC',
    },
    content:
      'I left Gurgaon last year and moved back to Indore while keeping my remote tech salary. Let me break down the difference in quality of life:\n\n1. Rent: Went from paying ₹48,000 for a water-logging 2BHK on Golf Course Ext Road to ₹16,000 for a sprawling 3BHK independent villa with a lawn and fruit trees.\n2. AQI: Delhi-NCR AQI was 450+ throughout winter — my daughter was on nebulizers every night. In Indore, the air is clean, sky is actually blue, and my chronic sinus inflammation disappeared.\n3. Commute: I haven’t touched a clutch pedal in gridlock traffic in 14 months. Everything in town is 15 minutes away.\n4. Savings: My monthly savings rate jumped from 32% to 68%. Stop drinking the Kool-Aid that you must suffer metro misery to be successful.',
    likes: 295,
    createdAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_tier1_against_1',
    debateId: 'debate_tier1_vs_tier2',
    side: 'against',
    author: {
      name: 'u/filter_coffee_purist',
      handle: '@filter_coffee_purist',
      avatarColor: '#f59e0b',
      initials: 'FC',
    },
    content:
      'People who say "just move to a Tier-2 town" tend to be married senior engineers with established networks who already made their career connections.\n\nIf you are 23 years old, moving back to your hometown is career suicide in disguise. In Bangalore or Gurgaon:\n• You bump into founders, VCs, and open-source contributors at third-wave coffee shops and weekend tech meetups.\n• When your startup hits a layoff wave, you have 5 in-person interviews lined up within a 10 km radius within two weeks.\n• Social freedom: You can live your life without conservative nosy neighbors tracking what time you come home or who visits you.\n\nAgglomeration economics exist for a reason. Silicon Valley didn’t happen in Montana, and Indian tech will not be replaced by sleepy tier-3 towns.',
    likes: 230,
    createdAt: new Date(Date.now() - 145 * 60 * 1000).toISOString(),
  },

  // --- Quick-Commerce Platform Fees ---
  {
    id: 'arg_delivery_for_1',
    debateId: 'debate_delivery_platform_fees',
    side: 'for',
    author: {
      name: 'u/auto_meter_skeptic',
      handle: '@auto_meter_skeptic',
      avatarColor: '#f43f5e',
      initials: 'AM',
    },
    content:
      'Remember when food delivery apps gave you 50% discounts and free delivery to build the habit? The bait-and-switch is now in full throttle.\n\nTake a standard ₹150 chicken roll:\n• Base dish price marked up by 25% on the app compared to the physical dine-in menu: ₹190\n• Platform fee: ₹10\n• Delivery fee: ₹45\n• Rain surge fee (it’s a light drizzle 3 km away): ₹35\n• Packaging & restaurant handling fee: ₹20\n• GST on service & food: ₹18\n\nTotal paid: ₹318 for a ₹150 street roll! And what does the gig worker who drove through knee-deep water on a two-wheeler get out of this ₹318? Exactly ₹22. The customer feels ripped off and the delivery partner is struggling to pay their bike EMI while unicorn executives buy luxury villas.',
    likes: 310,
    createdAt: new Date(Date.now() - 260 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_delivery_against_1',
    debateId: 'debate_delivery_platform_fees',
    side: 'against',
    author: {
      name: 'u/SnooHabits5920',
      handle: '@SnooHabits5920',
      avatarColor: '#10b981',
      initials: 'SH',
    },
    content:
      'No one is forcing you at gunpoint to order ice cream at 1:30 AM in a torrential downpour.\n\nThe venture capital subsidies that paid for our free deliveries from 2017 to 2021 are gone — interest rates rose globally and companies actually have to stop burning cash and reach profitability. Building a dark-store fulfillment network that gets milk, bread, and medicine to your door in 9 minutes is a triumph of modern engineering and logistics.\n\nIf ₹10 platform fee is too expensive, put on your shoes, walk down three flights of stairs, haggle with the local kirana store, and carry the 10 kg atta bag up yourself. The convenience fee reflects real economic cost.',
    likes: 195,
    createdAt: new Date(Date.now() - 235 * 60 * 1000).toISOString(),
  },

  // --- Tier-3 Engineering Degrees ---
  {
    id: 'arg_eng_for_1',
    debateId: 'debate_engineering_degree_scam',
    side: 'for',
    author: {
      name: 'u/desitech_throwaway',
      handle: '@desitech_throwaway',
      avatarColor: '#ec4899',
      initials: 'DT',
    },
    content:
      'I graduated from a private tier-3 college in Greater Noida in 2023. Our syllabus was literally from 2008. We were forced to write Turbo C++ code on paper in lab notebooks with blue ballpoint pens for internal marks!\n\nOur professors had never deployed a single application to AWS, Docker, or Vercel in their entire lives. When campus placements arrived, Mass Recruiter IT firms offered ₹3.6 LPA — the EXACT same package they offered my uncle back in 2004! Adjusted for inflation, real fresher wages have dropped by 65% while college tuition increased 400%.\n\nMeanwhile, everything you need to become an exceptional engineer — CS50, MIT OpenCourseWare, NeetCode, roadmap.sh, full-stack open, and AI pair-programming — is 100% free online.',
    likes: 275,
    createdAt: new Date(Date.now() - 410 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_eng_against_1',
    debateId: 'debate_engineering_degree_scam',
    side: 'against',
    author: {
      name: 'u/cautious_optimist_88',
      handle: '@cautious_optimist_88',
      avatarColor: '#3b82f6',
      initials: 'CO',
    },
    content:
      'Tell this "degrees are useless" advice to HR departments and visa immigration officers and watch your resume get discarded by ATS automated filters in 0.4 seconds.\n\nTry applying for a US H-1B, German Opportunity Card, Singapore Tech Pass, or higher education MS abroad without a recognized 4-year undergraduate degree. Try sitting for UPSC, CAT, GATE, or public sector banking exams without an official bachelor’s certificate.\n\nYes, the curriculum is dated and you have to self-teach coding on GitHub. But the degree is a mandatory institutional passport that buys you eligibility to play the game in the first place.',
    likes: 215,
    createdAt: new Date(Date.now() - 380 * 60 * 1000).toISOString(),
  },

  // --- Uniform Civil Code ---
  {
    id: 'arg_ucc_for_1',
    debateId: 'debate_ucc',
    side: 'for',
    author: {
      name: 'u/Deep_Astronaut_77',
      handle: '@Deep_Astronaut_77',
      avatarColor: '#0ea5e9',
      initials: 'DA',
    },
    content:
      'Fundamental constitutional rights must belong to the individual citizen, not to religious orthodoxies.\n\nWhy should an Indian woman’s legal share of ancestral inheritance, minimum marriageable age, protection against unilateral abandonment, and child custody rights depend on which faith her parents happened to practice? A 21st-century secular democracy cannot maintain separate civil family codes based on theological dogmas written centuries ago.',
    likes: 180,
    createdAt: new Date(Date.now() - 650 * 60 * 1000).toISOString(),
  },
  {
    id: 'arg_ucc_against_1',
    debateId: 'debate_ucc',
    side: 'against',
    author: {
      name: 'u/Odd_Bat_4912',
      handle: '@Odd_Bat_4912',
      avatarColor: '#f43f5e',
      initials: 'OB',
    },
    content:
      'The issue is not gender justice — everyone supports women’s property rights. The issue is political centralization and weaponization against minorities and indigenous tribes.\n\nIndia is an empire-sized federation of hundreds of distinct cultures. Look at Nagaland, Mizoram, and Meghalaya under Article 371: their customary marriage and land inheritance laws are deeply matrilineal and distinct. Enforcing a blanket pan-India uniformity from Delhi without local tribal consensus undermines federal trust.',
    likes: 165,
    createdAt: new Date(Date.now() - 610 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_founder_70hr_statement',
    author: {
      name: 'Vikramaditya Rao',
      handle: '@vikram_tech_vision',
      avatarColor: '#0284c7',
      initials: 'VR',
    },
    speakerTitle: 'IT Industry Veteran · Public Statement',
    content:
      '"India’s work productivity is among the lowest in the world. Just like Japan and Germany rebuilt after WWII, our youngsters must say: This is my country, I want to work 70 hours a week to make India #1."',
    tags: ['WORK', 'INDIA', 'STARTUPS'],
    likes: 3420,
    commentsCount: 6,
    views: 92400,
    debatesCreatedCount: 4,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post_rohit_impact_player_quote',
    author: {
      name: 'Siddharth Deshmukh',
      handle: '@siddharth_cricket',
      avatarColor: '#f59e0b',
      initials: 'SD',
    },
    speakerTitle: 'Senior Cricket Captain · Press Statement',
    content:
      '"Honestly, I am not a big fan of the Impact Player rule in IPL. It is holding back Indian all-rounders because teams just bring in an extra specialist batter or bowler, and guys like Shivam Dube or Washington Sundar don’t get to bowl under pressure."',
    tags: ['SPORTS', 'IPL', 'INDIA'],
    likes: 5180,
    commentsCount: 4,
    views: 118000,
    debatesCreatedCount: 3,
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post_supreme_court_freebies_note',
    author: {
      name: 'Meera Krishnan',
      handle: '@meera_policy_in',
      avatarColor: '#8b5cf6',
      initials: 'MK',
    },
    speakerTitle: 'Economic Policy Observer · Statement',
    content:
      '"When states spend 25% of their tax revenue on unconditional pre-election cash handouts and freebies, who pays for government hospitals, primary schools, and highways? Voters are being bribed with their own future tax money."',
    tags: ['POLITICS', 'ECONOMY', 'INDIA'],
    likes: 2890,
    commentsCount: 2,
    views: 64200,
    debatesCreatedCount: 2,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post_nfhs_food_infographic',
    author: {
      name: 'Arjun Chatterjee',
      handle: '@arjun_data_bharat',
      avatarColor: '#10b981',
      initials: 'AC',
    },
    speakerTitle: 'Data & Demographics Post',
    content:
      'Most people outside India (and even inside metro cities) assume India is 80% vegetarian. Look at the actual National Family Health Survey (NFHS-5) numbers across states—over 71% of Indian adults eat eggs, fish, chicken, or meat!',
    imageUrl: '/assets/india_veg_chart.svg',
    tags: ['DATA', 'CULTURE', 'INDIA'],
    likes: 1940,
    commentsCount: 1,
    views: 41300,
    debatesCreatedCount: 1,
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post_ai_ceo_coding_statement',
    author: {
      name: 'Neha Kapoor',
      handle: '@neha_ai_insider',
      avatarColor: '#ec4899',
      initials: 'NK',
    },
    speakerTitle: 'Global AI CEO · Keynote Statement',
    content:
      '"Nobody should force kids to memorize syntax anymore. Within 24 months, AI agents will write 90% of the world’s production software code. The era of hiring 50,000 junior coders to maintain legacy apps is over."',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['TECH', 'AI', 'EDUCATION'],
    likes: 4120,
    commentsCount: 2,
    views: 87500,
    debatesCreatedCount: 5,
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_POST_COMMENTS: PostComment[] = [
  {
    id: 'pcomm_1',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Rohan Kulkarni',
      handle: '@rohan_kulkarni',
      avatarColor: '#0ea5e9',
      initials: 'RK',
    },
    content: 'Easy to preach 70 hours when you own 4,000 crores in company stock. Pay overtime by the hour like Japan or Germany and watch how gladly people work!',
    likes: 342,
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_2',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Divya Nair',
      handle: '@divya_nair_blr',
      avatarColor: '#10b981',
      initials: 'DN',
    },
    content: 'Include 3 hours of Bengaluru Silk Board traffic every day and Indian techies are already spending 75 hours a week for work.',
    likes: 218,
    createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_3',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Aditya Singhania',
      handle: '@aditya_builds',
      avatarColor: '#f59e0b',
      initials: 'AS',
    },
    content: 'His point about building manufacturing & deep-tech capacity in our 20s isn’t wrong though—China worked crazy hours from 1995 to 2015.',
    likes: 89,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_3b',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Karthik Subramanian',
      handle: '@karthik_dev',
      avatarColor: '#8b5cf6',
      initials: 'KS',
    },
    content: 'Productivity comes from better engineering tools and clear product vision, not from sitting at a desk till 10 PM waiting for the manager to leave.',
    likes: 164,
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_3c',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Pooja Malhotra',
      handle: '@pooja_malhotra',
      avatarColor: '#ec4899',
      initials: 'PM',
    },
    content: 'Notice how founders want Silicon Valley working hours from freshers while paying ₹3.5 LPA salaries that haven’t changed since 2012.',
    likes: 295,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_3d',
    postId: 'post_founder_70hr_statement',
    author: {
      name: 'Harpreet Gill',
      handle: '@harpreet_gill',
      avatarColor: '#14b8a6',
      initials: 'HG',
    },
    content: 'If someone is building their own startup or doctors/IAS officers in crisis, 70 hours makes sense. Making it mandatory for salaried employees is burnout.',
    likes: 112,
    createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_4',
    postId: 'post_rohit_impact_player_quote',
    author: {
      name: 'Saurabh Tiwari',
      handle: '@saurabh_cric',
      avatarColor: '#f43f5e',
      initials: 'ST',
    },
    content: '100% facts. Cricket is an 11 vs 11 game, not 12 vs 12. Bowlers are being reduced to bowling machines on flat highways.',
    likes: 410,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_5',
    postId: 'post_rohit_impact_player_quote',
    author: {
      name: 'u/biryani_diplomat_07',
      handle: '@biryani_diplomat_07',
      avatarColor: '#8b5cf6',
      initials: 'BD',
    },
    content: 'As a spectator in the stadium, chasing 240 in 20 overs is pure cinema though!',
    likes: 156,
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_5b',
    postId: 'post_rohit_impact_player_quote',
    author: {
      name: 'u/yorker_specialist_99',
      handle: '@yorker_specialist_99',
      avatarColor: '#0ea5e9',
      initials: 'YS',
    },
    content: 'Look at how hard it is to find a seam-bowling all-rounder after Hardik Pandya. When IPL teams use an 8th specialist batter, nobody bowls those 2 crucial middle overs.',
    likes: 184,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_5c',
    postId: 'post_rohit_impact_player_quote',
    author: {
      name: 'u/stadium_vada_pav',
      handle: '@stadium_vada_pav',
      avatarColor: '#10b981',
      initials: 'SV',
    },
    content: 'Keep Impact Player only if a team loses 3 wickets inside the Powerplay—that way it helps balance collapses instead of creating 270+ run fests.',
    likes: 97,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_6',
    postId: 'post_supreme_court_freebies_note',
    author: {
      name: 'u/pav_bhaji_philosopher',
      handle: '@pav_bhaji_philosopher',
      avatarColor: '#06b6d4',
      initials: 'PB',
    },
    content: 'Corporate loan write-offs of ₹10 lakh crore are called "economic stimulus", but ₹1,500/month for a rural mother is called a "freebie"? Think about both sides.',
    likes: 275,
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_7',
    postId: 'post_supreme_court_freebies_note',
    author: {
      name: 'u/autorickshaw_oracle',
      handle: '@autorickshaw_oracle',
      avatarColor: '#ec4899',
      initials: 'AO',
    },
    content: 'Give free world-class education and free healthcare—nobody complains about that. Unconditional cash just before voting day is what distorts budgets.',
    likes: 198,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_8',
    postId: 'post_nfhs_food_infographic',
    author: {
      name: 'u/masala_dosa_monk',
      handle: '@masala_dosa_monk',
      avatarColor: '#3b82f6',
      initials: 'MD',
    },
    content: 'Even in non-veg states, frequency matters—most Indian families eat meat once or twice a week, unlike daily meat consumption in the West.',
    likes: 134,
    createdAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_9',
    postId: 'post_ai_ceo_coding_statement',
    author: {
      name: 'u/filter_coffee_fanatic',
      handle: '@filter_coffee_fanatic',
      avatarColor: '#14b8a6',
      initials: 'FC',
    },
    content: 'Someone still has to understand system architecture, security, and debugging when that 90% AI-generated code breaks in production at 2 AM!',
    likes: 312,
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
  },
  {
    id: 'pcomm_10',
    postId: 'post_ai_ceo_coding_statement',
    author: {
      name: 'u/late_night_maggi_11',
      handle: '@late_night_maggi_11',
      avatarColor: '#f97316',
      initials: 'LN',
    },
    content: 'Started a debate on this statement—every B.Tech student in India needs to discuss this seriously.',
    likes: 145,
    createdAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
  },
];

export function createInitialNotifications(recipientHandle: string): AppNotification[] {
  const cleanRecipient = recipientHandle.startsWith('@') ? recipientHandle : `@${recipientHandle}`;
  return [
    {
      id: 'notif_seed_1',
      type: 'debate_comment',
      recipientHandle: cleanRecipient,
      actor: {
        name: 'u/chai_pe_charcha_42',
        handle: '@chai_pe_charcha_42',
        avatarColor: '#0ea5e9',
        initials: 'CP',
      },
      targetId: 'debate_70_hour_workweek',
      targetType: 'debate',
      targetTitle: 'Is a 70-hour work week necessary for India to become a developed economy, or is it toxic exploitation disguised as patriotism?',
      commentSnippet: 'Pay overtime by the hour like Japan or Germany and watch how gladly people work—without fair pay it is just burnout.',
      side: 'against',
      read: false,
      createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_seed_2',
      type: 'post_comment',
      recipientHandle: cleanRecipient,
      actor: {
        name: 'u/jugaad_engineer_88',
        handle: '@jugaad_engineer_88',
        avatarColor: '#10b981',
        initials: 'JE',
      },
      targetId: 'post_founder_70hr_statement',
      targetType: 'post',
      targetTitle: '"India’s work productivity is among the lowest in the world. Just like Japan and Germany rebuilt after WWII..."',
      commentSnippet: 'Include 3 hours of Bengaluru Silk Board traffic every day and Indian techies are already spending 75 hours a week for work.',
      read: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_seed_3',
      type: 'debate_like',
      recipientHandle: cleanRecipient,
      actor: {
        name: 'u/gully_cricket_umpire',
        handle: '@gully_cricket_umpire',
        avatarColor: '#f43f5e',
        initials: 'GC',
      },
      targetId: 'debate_ipl_impact_player',
      targetType: 'debate',
      targetTitle: 'Has the IPL "Impact Player" rule ruined the development of genuine all-rounders in Indian cricket?',
      read: false,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_seed_4',
      type: 'post_like',
      recipientHandle: cleanRecipient,
      actor: {
        name: 'u/biryani_diplomat_07',
        handle: '@biryani_diplomat_07',
        avatarColor: '#8b5cf6',
        initials: 'BD',
      },
      targetId: 'post_rohit_impact_player_quote',
      targetType: 'post',
      targetTitle: '"Honestly, I am not a big fan of the Impact Player rule in IPL. It is holding back Indian all-rounders..."',
      read: true,
      createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    },
  ];
}

