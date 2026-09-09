export interface MockQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topicName: string;
  subjectName: string;
  tags: string[];
}

export interface MockBundle {
  id: string;
  name: string;
  description: string;
  subjectName: string;
  difficulty: string;
  price: number;
  thumbnail: string;
  status: string;
  exam: {
    id: string;
    name: string;
    code: string;
    icon: string;
  };
  questionCount: number;
  salesCount: number;
  questions: MockQuestion[];
}

export const MOCK_BUNDLES: MockBundle[] = [
  {
    id: 'bundle_ssc_001',
    name: 'SSC CGL Quantitative Aptitude – Practice Set 1',
    description: 'Comprehensive high-yield practice set covering Percentages, Profit & Loss, Time & Work, and Ratio with in-depth step-by-step solutions.',
    subjectName: 'Quantitative Aptitude',
    difficulty: 'Mixed',
    price: 49,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    exam: {
      id: 'exam_ssc',
      name: 'SSC CGL & CHSL',
      code: 'SSC',
      icon: 'Target',
    },
    questionCount: 7,
    salesCount: 142,
    questions: [
      {
        id: 'q_ssc_01',
        questionText: 'What is 25% of 240?',
        optionA: '40',
        optionB: '50',
        optionC: '60',
        optionD: '80',
        correctAnswer: 'C',
        explanation: '25% of 240 = (25/100) * 240 = 1/4 * 240 = 60.',
        difficulty: 'Easy',
        topicName: 'Percentages',
        subjectName: 'Quantitative Aptitude',
        tags: ['Arithmetic', 'Basic', 'Percentage'],
      },
      {
        id: 'q_ssc_02',
        questionText: 'If A’s income is 25% more than B’s income, then by what percentage is B’s income less than A’s income?',
        optionA: '20%',
        optionB: '25%',
        optionC: '16.66%',
        optionD: '33.33%',
        correctAnswer: 'A',
        explanation: 'Let B = 100. Then A = 125. Difference = 25. Percentage less = (25 / 125) * 100% = 20%.',
        difficulty: 'Medium',
        topicName: 'Percentages',
        subjectName: 'Quantitative Aptitude',
        tags: ['Formula', 'Percentage'],
      },
      {
        id: 'q_ssc_03',
        questionText: 'A trader marks his goods 20% above the cost price and allows a discount of 10% on the marked price. What is his net profit percentage?',
        optionA: '6%',
        optionB: '8%',
        optionC: '10%',
        optionD: '12%',
        correctAnswer: 'B',
        explanation: 'Let CP = 100. MP = 120. SP after 10% discount = 120 - 12 = 108. Profit = 108 - 100 = 8, so profit% = 8%.',
        difficulty: 'Medium',
        topicName: 'Profit & Loss',
        subjectName: 'Quantitative Aptitude',
        tags: ['Profit and Loss', 'SSC CGL'],
      },
      {
        id: 'q_ssc_04',
        questionText: 'By selling an article for ₹720, a shopkeeper gains 20%. What was the cost price of the article?',
        optionA: '₹580',
        optionB: '₹600',
        optionC: '₹620',
        optionD: '₹640',
        correctAnswer: 'B',
        explanation: 'SP = CP * 1.20 => 720 = 1.2 * CP => CP = 720 / 1.2 = ₹600.',
        difficulty: 'Easy',
        topicName: 'Profit & Loss',
        subjectName: 'Quantitative Aptitude',
        tags: ['Arithmetic', 'Profit and Loss'],
      },
      {
        id: 'q_ssc_05',
        questionText: 'A can complete a piece of work in 12 days and B can do it in 18 days. Working together, in how many days will they complete the work?',
        optionA: '6 days',
        optionB: '7.2 days',
        optionC: '8 days',
        optionD: '9.5 days',
        correctAnswer: 'B',
        explanation: 'Work done by (A + B) in 1 day = (1/12) + (1/18) = (3 + 2)/36 = 5/36. Total days = 36/5 = 7.2 days.',
        difficulty: 'Medium',
        topicName: 'Time & Work',
        subjectName: 'Quantitative Aptitude',
        tags: ['Time and Work', 'SSC'],
      },
      {
        id: 'q_ssc_06',
        questionText: 'If 15 men can build a wall in 20 days, how many men will be required to build the same wall in 12 days?',
        optionA: '20 men',
        optionB: '25 men',
        optionC: '30 men',
        optionD: '35 men',
        correctAnswer: 'B',
        explanation: 'M1 * D1 = M2 * D2 => 15 * 20 = M2 * 12 => 300 = 12 * M2 => M2 = 25 men.',
        difficulty: 'Easy',
        topicName: 'Time & Work',
        subjectName: 'Quantitative Aptitude',
        tags: ['Man Days', 'Time and Work'],
      },
      {
        id: 'q_ssc_07',
        questionText: 'Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new ratio becomes 12 : 23. What is the smaller number?',
        optionA: '27',
        optionB: '33',
        optionC: '45',
        optionD: '55',
        correctAnswer: 'B',
        explanation: 'Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23 => 23(3x - 9) = 12(5x - 9) => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number = 3 * 11 = 33.',
        difficulty: 'Hard',
        topicName: 'Ratio & Proportion',
        subjectName: 'Quantitative Aptitude',
        tags: ['Ratio', 'Algebra'],
      },
    ],
  },
  {
    id: 'bundle_banking_002',
    name: 'Banking Reasoning Ability Master Set',
    description: 'High-yield reasoning puzzles, syllogisms, and coding-decoding practice questions designed for SBI & IBPS PO/Clerk aspirants.',
    subjectName: 'Reasoning Ability',
    difficulty: 'Medium',
    price: 79,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    exam: {
      id: 'exam_banking',
      name: 'Banking & Insurance',
      code: 'BANKING',
      icon: 'Landmark',
    },
    questionCount: 4,
    salesCount: 98,
    questions: [
      {
        id: 'q_bank_01',
        questionText: 'In a certain code language, "TEACHER" is written as "VGCEJGT". How is "CHILDREN" written in that same code language?',
        optionA: 'EJKNFTGP',
        optionB: 'EJKNFUTP',
        optionC: 'EKNJFTGP',
        optionD: 'EJLNFTGP',
        correctAnswer: 'A',
        explanation: 'Each letter is shifted forward by +2 positions in alphabetical order: C(+2)=E, H(+2)=J, I(+2)=K, L(+2)=N, D(+2)=F, R(+2)=T, E(+2)=G, N(+2)=P -> EJKNFTGP.',
        difficulty: 'Easy',
        topicName: 'Coding-Decoding',
        subjectName: 'Reasoning Ability',
        tags: ['Coding-Decoding', 'Alphabetical Pattern'],
      },
      {
        id: 'q_bank_02',
        questionText: 'If "APPLE" is coded as 50, how is "ORANGE" coded in the same system?',
        optionA: '60',
        optionB: '64',
        optionC: '68',
        optionD: '72',
        correctAnswer: 'A',
        explanation: 'A(1) + P(16) + P(16) + L(12) + E(5) = 50. For ORANGE: O(15) + R(18) + A(1) + N(14) + G(7) + E(5) = 60.',
        difficulty: 'Medium',
        topicName: 'Coding-Decoding',
        subjectName: 'Reasoning Ability',
        tags: ['Number Coding', 'Banking'],
      },
      {
        id: 'q_bank_03',
        questionText: 'Statements: All pens are books. Some books are rulers.\nConclusions: I. Some rulers are pens. II. Some books are pens.',
        optionA: 'Only conclusion I follows',
        optionB: 'Only conclusion II follows',
        optionC: 'Either I or II follows',
        optionD: 'Both I and II follow',
        correctAnswer: 'B',
        explanation: 'Since all pens are books, the converse "Some books are pens" is definitively true (Conclusion II). Conclusion I is possible but not definite. Hence, only II follows.',
        difficulty: 'Medium',
        topicName: 'Syllogism',
        subjectName: 'Reasoning Ability',
        tags: ['Syllogisms', 'Logic', 'Banking'],
      },
      {
        id: 'q_bank_04',
        questionText: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
        optionA: 'Brother',
        optionB: 'Uncle',
        optionC: 'Father',
        optionD: 'Grandfather',
        correctAnswer: 'C',
        explanation: 'The only son of Suresh\'s mother is Suresh himself. Therefore, the boy is the son of Suresh. Suresh is the boy\'s Father.',
        difficulty: 'Easy',
        topicName: 'Blood Relations',
        subjectName: 'Reasoning Ability',
        tags: ['Blood Relations', 'Reasoning'],
      },
    ],
  },
  {
    id: 'bundle_rrb_003',
    name: 'RRB General Awareness Express Set',
    description: 'Essential Indian Polity, General Science, and Static GK questions curated specifically for RRB NTPC & Group D exams.',
    subjectName: 'General Awareness',
    difficulty: 'Easy',
    price: 39,
    thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    exam: {
      id: 'exam_rrb',
      name: 'RRB Railways',
      code: 'RRB',
      icon: 'Train',
    },
    questionCount: 4,
    salesCount: 215,
    questions: [
      {
        id: 'q_rrb_01',
        questionText: 'Who is recognized as the "Father of the Indian Constitution"?',
        optionA: 'Mahatma Gandhi',
        optionB: 'Dr. B. R. Ambedkar',
        optionC: 'Jawaharlal Nehru',
        optionD: 'Dr. Rajendra Prasad',
        correctAnswer: 'B',
        explanation: 'Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly and is regarded as the Father of the Indian Constitution.',
        difficulty: 'Easy',
        topicName: 'Indian Polity',
        subjectName: 'General Awareness',
        tags: ['Polity', 'Static GK', 'RRB'],
      },
      {
        id: 'q_rrb_02',
        questionText: 'Which Article of the Constitution of India guarantees "Equality before Law"?',
        optionA: 'Article 14',
        optionB: 'Article 19',
        optionC: 'Article 21',
        optionD: 'Article 32',
        correctAnswer: 'A',
        explanation: 'Article 14 of the Indian Constitution ensures that the State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
        difficulty: 'Medium',
        topicName: 'Indian Polity',
        subjectName: 'General Awareness',
        tags: ['Fundamental Rights', 'Polity'],
      },
      {
        id: 'q_rrb_03',
        questionText: 'What is the chemical formula for Baking Soda?',
        optionA: 'Na2CO3',
        optionB: 'NaHCO3',
        optionC: 'CaCO3',
        optionD: 'NaOH',
        correctAnswer: 'B',
        explanation: 'Baking Soda is Sodium Bicarbonate, with chemical formula NaHCO3. (Na2CO3 is washing soda).',
        difficulty: 'Easy',
        topicName: 'General Science',
        subjectName: 'General Awareness',
        tags: ['Chemistry', 'General Science', 'Railways'],
      },
      {
        id: 'q_rrb_04',
        questionText: 'Which organ in the human body is primarily responsible for filtering urea from the blood?',
        optionA: 'Heart',
        optionB: 'Liver',
        optionC: 'Kidneys',
        optionD: 'Lungs',
        correctAnswer: 'C',
        explanation: 'The kidneys filter waste products including urea and excess salts from the bloodstream to produce urine.',
        difficulty: 'Easy',
        topicName: 'General Science',
        subjectName: 'General Awareness',
        tags: ['Biology', 'Human Physiology', 'Science'],
      },
    ],
  },
  {
    id: 'bundle_appsc_004',
    name: 'APPSC & TSPSC General Studies Prelims Set',
    description: 'Comprehensive general studies practice questions focusing on Constitution, Governance, and Basic Sciences.',
    subjectName: 'General Studies',
    difficulty: 'Hard',
    price: 59,
    thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    exam: {
      id: 'exam_state',
      name: 'State PSCs (APPSC/TSPSC)',
      code: 'STATE_PSC',
      icon: 'Building2',
    },
    questionCount: 6,
    salesCount: 76,
    questions: [
      {
        id: 'q_psc_01',
        questionText: 'Which Article of the Constitution of India provides for the establishment of Public Service Commissions for the Union and for the States?',
        optionA: 'Article 312',
        optionB: 'Article 315',
        optionC: 'Article 320',
        optionD: 'Article 324',
        correctAnswer: 'B',
        explanation: 'Article 315 of the Constitution provides for the establishment of a Public Service Commission for the Union and for each State.',
        difficulty: 'Hard',
        topicName: 'Constitution & Polity',
        subjectName: 'General Studies',
        tags: ['Polity', 'State PSC', 'Governance'],
      },
      {
        id: 'q_psc_02',
        questionText: 'What is 25% of 240?',
        optionA: '40',
        optionB: '50',
        optionC: '60',
        optionD: '80',
        correctAnswer: 'C',
        explanation: '25% of 240 = 60.',
        difficulty: 'Easy',
        topicName: 'Percentages',
        subjectName: 'Quantitative Aptitude',
        tags: ['Arithmetic', 'Basic', 'Percentage'],
      },
    ],
  },
];

export function getFilteredMockBundles(filters?: { exam?: string | null; difficulty?: string | null; search?: string | null }) {
  let list = [...MOCK_BUNDLES];

  if (filters?.exam && filters.exam !== 'ALL') {
    list = list.filter((b) => b.exam.code.toUpperCase() === filters.exam?.toUpperCase());
  }

  if (filters?.difficulty && filters.difficulty !== 'ALL') {
    list = list.filter((b) => b.difficulty.toUpperCase() === filters.difficulty?.toUpperCase());
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q)
    );
  }

  return list.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    subjectName: b.subjectName,
    difficulty: b.difficulty,
    price: b.price,
    thumbnail: b.thumbnail,
    status: b.status,
    exam: b.exam,
    questionCount: b.questions.length,
    salesCount: b.salesCount,
    isPurchased: false,
  }));
}

export function getMockBundleDetail(bundleId: string, isPurchased = false) {
  const found = MOCK_BUNDLES.find((b) => b.id === bundleId);
  if (!found) return null;

  const topicsMap = new Map<string, number>();
  found.questions.forEach((q) => {
    topicsMap.set(q.topicName, (topicsMap.get(q.topicName) || 0) + 1);
  });

  const topicDistribution = Array.from(topicsMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  const previewQuestions = found.questions.slice(0, 2).map((q, idx) => ({
    index: idx + 1,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    difficulty: q.difficulty,
    topic: q.topicName,
    correctAnswer: isPurchased ? q.correctAnswer : undefined,
    explanation: isPurchased ? q.explanation : 'Buy bundle to unlock detailed solution and all questions.',
  }));

  return {
    id: found.id,
    name: found.name,
    description: found.description,
    exam: found.exam,
    subjectName: found.subjectName,
    difficulty: found.difficulty,
    price: found.price,
    thumbnail: found.thumbnail,
    status: found.status,
    questionCount: found.questions.length,
    salesCount: found.salesCount,
    isPurchased,
    topicDistribution,
    previewQuestions,
  };
}

export function getMockQuestionsForBundle(bundleId: string) {
  const found = MOCK_BUNDLES.find((b) => b.id === bundleId);
  if (!found) return null;

  const questions = found.questions.map((q, index) => ({
    index: index + 1,
    id: q.id,
    questionText: q.questionText,
    imageUrl: undefined,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topicName: q.topicName,
    subjectName: q.subjectName,
    tags: q.tags,
  }));

  return {
    bundle: {
      id: found.id,
      name: found.name,
      examName: found.exam.name,
      subjectName: found.subjectName,
      difficulty: found.difficulty,
      totalQuestions: questions.length,
    },
    questions,
  };
}

