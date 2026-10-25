import { Debate, Argument } from '../types';

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
