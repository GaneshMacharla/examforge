import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.attemptAnswer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.bundleQuestion.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const studentPasswordHash = bcrypt.hashSync('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@examhub.com',
      mobile: '9876543210',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const ganeshPasswordHash = bcrypt.hashSync('evokevoicegani@2026', 10);
  await prisma.user.create({
    data: {
      name: 'Ganesh Macharla (Admin)',
      email: 'ganimacharla2004@gmail.com',
      mobile: '9876543210',
      passwordHash: ganeshPasswordHash,
      role: 'ADMIN',
    },
  });

  const studentRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      mobile: '9876543211',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      targetExam: 'SSC CGL',
    },
  });

  const studentPriya = await prisma.user.create({
    data: {
      name: 'Priya Verma',
      email: 'priya@gmail.com',
      mobile: '9876543212',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      targetExam: 'Banking IBPS PO',
    },
  });

  // 3. Create Exams
  const ssc = await prisma.exam.create({
    data: {
      name: 'SSC CGL & CHSL',
      code: 'SSC',
      description: 'Staff Selection Commission Combined Graduate & Higher Secondary Level Exams',
      icon: 'Target',
    },
  });

  const banking = await prisma.exam.create({
    data: {
      name: 'Banking & Insurance',
      code: 'BANKING',
      description: 'IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant & Insurance Examinations',
      icon: 'Landmark',
    },
  });

  const rrb = await prisma.exam.create({
    data: {
      name: 'RRB Railways',
      code: 'RRB',
      description: 'Railway Recruitment Board NTPC, Group D, and ALP examinations',
      icon: 'Train',
    },
  });

  const statePsc = await prisma.exam.create({
    data: {
      name: 'State PSCs (APPSC/TSPSC)',
      code: 'STATE_PSC',
      description: 'Group 1, 2, and departmental civil service examinations for States',
      icon: 'Building2',
    },
  });

  // 4. Create Subjects & Topics
  // SSC Subjects
  const quantSubject = await prisma.subject.create({
    data: {
      examId: ssc.id,
      name: 'Quantitative Aptitude',
      description: 'Arithmetic, Algebra, Geometry, Trigonometry, and Data Interpretation',
    },
  });

  const topicPercentage = await prisma.topic.create({
    data: { subjectId: quantSubject.id, name: 'Percentages' },
  });

  const topicProfitLoss = await prisma.topic.create({
    data: { subjectId: quantSubject.id, name: 'Profit & Loss' },
  });

  const topicTimeWork = await prisma.topic.create({
    data: { subjectId: quantSubject.id, name: 'Time & Work' },
  });

  const topicRatio = await prisma.topic.create({
    data: { subjectId: quantSubject.id, name: 'Ratio & Proportion' },
  });

  // Banking Subjects
  const reasoningSubject = await prisma.subject.create({
    data: {
      examId: banking.id,
      name: 'Reasoning Ability',
      description: 'Verbal, Non-Verbal, Logical Reasoning and Puzzles',
    },
  });

  const topicCoding = await prisma.topic.create({
    data: { subjectId: reasoningSubject.id, name: 'Coding-Decoding' },
  });

  const topicSyllogism = await prisma.topic.create({
    data: { subjectId: reasoningSubject.id, name: 'Syllogism' },
  });

  const topicBloodRelations = await prisma.topic.create({
    data: { subjectId: reasoningSubject.id, name: 'Blood Relations' },
  });

  // RRB Subject
  const gaSubject = await prisma.subject.create({
    data: {
      examId: rrb.id,
      name: 'General Awareness',
      description: 'Indian Polity, History, Geography, and Science',
    },
  });

  const topicPolity = await prisma.topic.create({
    data: { subjectId: gaSubject.id, name: 'Indian Constitution & Polity' },
  });

  const topicScience = await prisma.topic.create({
    data: { subjectId: gaSubject.id, name: 'General Science' },
  });

  // 5. Create Questions
  const questionsData = [
    {
      subjectId: quantSubject.id,
      topicId: topicPercentage.id,
      questionText: 'What is 25% of 240?',
      optionA: '40',
      optionB: '50',
      optionC: '60',
      optionD: '80',
      correctAnswer: 'C',
      explanation: '25% of 240 = (25/100) * 240 = 1/4 * 240 = 60.',
      difficulty: 'Easy',
      tags: 'Arithmetic, Basic, Percentage',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicPercentage.id,
      questionText: 'If A’s income is 25% more than B’s income, then by what percentage is B’s income less than A’s income?',
      optionA: '20%',
      optionB: '25%',
      optionC: '16.66%',
      optionD: '33.33%',
      correctAnswer: 'A',
      explanation: 'Let B = 100. Then A = 125. Difference = 25. Percentage less = (25 / 125) * 100% = 20%.',
      difficulty: 'Medium',
      tags: 'Formula, Percentage',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicProfitLoss.id,
      questionText: 'A trader marks his goods 20% above the cost price and allows a discount of 10% on the marked price. What is his net profit percentage?',
      optionA: '6%',
      optionB: '8%',
      optionC: '10%',
      optionD: '12%',
      correctAnswer: 'B',
      explanation: 'Let CP = 100. MP = 120. SP after 10% discount = 120 - 12 = 108. Profit = 108 - 100 = 8, so profit% = 8%.',
      difficulty: 'Medium',
      tags: 'Profit and Loss, SSC CGL',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicProfitLoss.id,
      questionText: 'By selling an article for ₹720, a shopkeeper gains 20%. What was the cost price of the article?',
      optionA: '₹580',
      optionB: '₹600',
      optionC: '₹620',
      optionD: '₹640',
      correctAnswer: 'B',
      explanation: 'SP = CP * 1.20 => 720 = 1.2 * CP => CP = 720 / 1.2 = ₹600.',
      difficulty: 'Easy',
      tags: 'Arithmetic, Profit and Loss',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicTimeWork.id,
      questionText: 'A can complete a piece of work in 12 days and B can do it in 18 days. Working together, in how many days will they complete the work?',
      optionA: '6 days',
      optionB: '7.2 days',
      optionC: '8 days',
      optionD: '9.5 days',
      correctAnswer: 'B',
      explanation: 'Work done by (A + B) in 1 day = (1/12) + (1/18) = (3 + 2)/36 = 5/36. Total days = 36/5 = 7.2 days.',
      difficulty: 'Medium',
      tags: 'Time and Work, SSC',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicTimeWork.id,
      questionText: 'If 15 men can build a wall in 20 days, how many men will be required to build the same wall in 12 days?',
      optionA: '20 men',
      optionB: '25 men',
      optionC: '30 men',
      optionD: '35 men',
      correctAnswer: 'B',
      explanation: 'M1 * D1 = M2 * D2 => 15 * 20 = M2 * 12 => 300 = 12 * M2 => M2 = 25 men.',
      difficulty: 'Easy',
      tags: 'Man Days, Time and Work',
    },
    {
      subjectId: quantSubject.id,
      topicId: topicRatio.id,
      questionText: 'Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new ratio becomes 12 : 23. What is the smaller number?',
      optionA: '27',
      optionB: '33',
      optionC: '45',
      optionD: '55',
      correctAnswer: 'B',
      explanation: 'Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23 => 23(3x - 9) = 12(5x - 9) => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number = 3 * 11 = 33.',
      difficulty: 'Hard',
      tags: 'Ratio, Algebra',
    },
    // Banking Reasoning Questions
    {
      subjectId: reasoningSubject.id,
      topicId: topicCoding.id,
      questionText: 'In a certain code language, "TEACHER" is written as "VGCEJGT". How is "CHILDREN" written in that same code language?',
      optionA: 'EJKNFTGP',
      optionB: 'EJKNFUTP',
      optionC: 'EKNJFTGP',
      optionD: 'EJLNFTGP',
      correctAnswer: 'A',
      explanation: 'Each letter is shifted forward by +2 positions in alphabetical order: C(+2)=E, H(+2)=J, I(+2)=K, L(+2)=N, D(+2)=F, R(+2)=T, E(+2)=G, N(+2)=P -> EJKNFTGP.',
      difficulty: 'Easy',
      tags: 'Coding-Decoding, Alphabetical Pattern',
    },
    {
      subjectId: reasoningSubject.id,
      topicId: topicCoding.id,
      questionText: 'If "APPLE" is coded as 50, how is "ORANGE" coded in the same system?',
      optionA: '60',
      optionB: '64',
      optionC: '68',
      optionD: '72',
      correctAnswer: 'A',
      explanation: 'A(1) + P(16) + P(16) + L(12) + E(5) = 50. For ORANGE: O(15) + R(18) + A(1) + N(14) + G(7) + E(5) = 60.',
      difficulty: 'Medium',
      tags: 'Number Coding, Banking',
    },
    {
      subjectId: reasoningSubject.id,
      topicId: topicSyllogism.id,
      questionText: 'Statements: All pens are books. Some books are rulers.\nConclusions: I. Some rulers are pens. II. Some books are pens.',
      optionA: 'Only conclusion I follows',
      optionB: 'Only conclusion II follows',
      optionC: 'Either I or II follows',
      optionD: 'Both I and II follow',
      correctAnswer: 'B',
      explanation: 'Since all pens are books, the converse "Some books are pens" is definitively true (Conclusion II). Conclusion I is possible but not definite. Hence, only II follows.',
      difficulty: 'Medium',
      tags: 'Syllogisms, Logic, Banking',
    },
    {
      subjectId: reasoningSubject.id,
      topicId: topicBloodRelations.id,
      questionText: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
      optionA: 'Brother',
      optionB: 'Uncle',
      optionC: 'Father',
      optionD: 'Grandfather',
      correctAnswer: 'C',
      explanation: 'The only son of Suresh\'s mother is Suresh himself. Therefore, the boy is the son of Suresh. Suresh is the boy\'s Father.',
      difficulty: 'Easy',
      tags: 'Blood Relations, Reasoning',
    },
    // RRB GA Questions
    {
      subjectId: gaSubject.id,
      topicId: topicPolity.id,
      questionText: 'Who is recognized as the "Father of the Indian Constitution"?',
      optionA: 'Mahatma Gandhi',
      optionB: 'Dr. B. R. Ambedkar',
      optionC: 'Jawaharlal Nehru',
      optionD: 'Dr. Rajendra Prasad',
      correctAnswer: 'B',
      explanation: 'Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly and is regarded as the Father of the Indian Constitution.',
      difficulty: 'Easy',
      tags: 'Polity, Static GK, RRB',
    },
    {
      subjectId: gaSubject.id,
      topicId: topicPolity.id,
      questionText: 'Which Article of the Constitution of India guarantees "Equality before Law"?',
      optionA: 'Article 14',
      optionB: 'Article 19',
      optionC: 'Article 21',
      optionD: 'Article 32',
      correctAnswer: 'A',
      explanation: 'Article 14 of the Indian Constitution ensures that the State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
      difficulty: 'Medium',
      tags: 'Fundamental Rights, Polity',
    },
    {
      subjectId: gaSubject.id,
      topicId: topicScience.id,
      questionText: 'What is the chemical formula for Baking Soda?',
      optionA: 'Na2CO3',
      optionB: 'NaHCO3',
      optionC: 'CaCO3',
      optionD: 'NaOH',
      correctAnswer: 'B',
      explanation: 'Baking Soda is Sodium Bicarbonate, with chemical formula NaHCO3. (Na2CO3 is washing soda).',
      difficulty: 'Easy',
      tags: 'Chemistry, General Science, Railways',
    },
    {
      subjectId: gaSubject.id,
      topicId: topicScience.id,
      questionText: 'Which organ in the human body is primarily responsible for filtering urea from the blood?',
      optionA: 'Heart',
      optionB: 'Liver',
      optionC: 'Kidneys',
      optionD: 'Lungs',
      correctAnswer: 'C',
      explanation: 'The kidneys filter waste products including urea and excess salts from the bloodstream to produce urine.',
      difficulty: 'Easy',
      tags: 'Biology, Human Physiology, Science',
    },
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: q,
    });
    createdQuestions.push(question);
  }

  // 6. Create Bundles
  const sscBundle = await prisma.bundle.create({
    data: {
      name: 'SSC CGL Quantitative Aptitude – Practice Set 1',
      description: 'Comprehensive 500-question practice set covering Percentages, Profit & Loss, Time & Work, and Ratio with in-depth step-by-step solutions.',
      examId: ssc.id,
      subjectName: 'Quantitative Aptitude',
      difficulty: 'Mixed',
      price: 49,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    },
  });

  const bankingBundle = await prisma.bundle.create({
    data: {
      name: 'Banking Reasoning Ability Master Set',
      description: 'High-yield reasoning puzzles, syllogisms, and coding-decoding practice questions designed for SBI & IBPS PO/Clerk aspirants.',
      examId: banking.id,
      subjectName: 'Reasoning Ability',
      difficulty: 'Medium',
      price: 79,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    },
  });

  const rrbBundle = await prisma.bundle.create({
    data: {
      name: 'RRB General Awareness Express Set',
      description: 'Essential Indian Polity, General Science, and Static GK questions curated specifically for RRB NTPC & Group D exams.',
      examId: rrb.id,
      subjectName: 'General Awareness',
      difficulty: 'Easy',
      price: 39,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
    },
  });

  const appscBundle = await prisma.bundle.create({
    data: {
      name: 'APPSC & TSPSC General Studies Prelims Set',
      description: 'Comprehensive general studies practice questions focusing on Constitution, Governance, and Basic Sciences.',
      examId: statePsc.id,
      subjectName: 'General Studies',
      difficulty: 'Hard',
      price: 59,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    },
  });

  // 7. Associate Questions with Bundles
  // SSC Bundle gets quant questions
  const quantQuestions = createdQuestions.filter((q) => q.subjectId === quantSubject.id);
  for (const q of quantQuestions) {
    await prisma.bundleQuestion.create({
      data: {
        bundleId: sscBundle.id,
        questionId: q.id,
      },
    });
  }

  // Banking Bundle gets reasoning questions
  const reasoningQuestions = createdQuestions.filter((q) => q.subjectId === reasoningSubject.id);
  for (const q of reasoningQuestions) {
    await prisma.bundleQuestion.create({
      data: {
        bundleId: bankingBundle.id,
        questionId: q.id,
      },
    });
  }

  // RRB Bundle gets GA questions
  const gaQuestions = createdQuestions.filter((q) => q.subjectId === gaSubject.id);
  for (const q of gaQuestions) {
    await prisma.bundleQuestion.create({
      data: {
        bundleId: rrbBundle.id,
        questionId: q.id,
      },
    });
  }

  // APPSC Bundle gets combination of polity & math
  for (const q of [...gaQuestions, ...quantQuestions.slice(0, 2)]) {
    await prisma.bundleQuestion.create({
      data: {
        bundleId: appscBundle.id,
        questionId: q.id,
      },
    });
  }

  // 8. Seed a Purchase for Rahul (SSC Bundle)
  const rahulPurchase = await prisma.purchase.create({
    data: {
      userId: studentRahul.id,
      bundleId: sscBundle.id,
      amount: 49,
      razorpayOrderId: 'order_mock_seed_101',
      razorpayPaymentId: 'pay_mock_seed_201',
      status: 'PAID',
    },
  });

  // Priya purchases Banking bundle
  await prisma.purchase.create({
    data: {
      userId: studentPriya.id,
      bundleId: bankingBundle.id,
      amount: 79,
      razorpayOrderId: 'order_mock_seed_102',
      razorpayPaymentId: 'pay_mock_seed_202',
      status: 'PAID',
    },
  });

  // 9. Seed a Test Attempt for Rahul so his Dashboard has active stats
  const attempt = await prisma.attempt.create({
    data: {
      userId: studentRahul.id,
      bundleId: sscBundle.id,
      mode: 'TEST',
      score: 5,
      totalQuestions: quantQuestions.length,
      correct: 5,
      incorrect: 2,
      unanswered: 0,
      accuracy: 71.4,
      timeTakenSec: 420, // 7 minutes
    },
  });

  // Add attempt answers
  for (let i = 0; i < quantQuestions.length; i++) {
    const q = quantQuestions[i];
    const isCorrect = i < 5;
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedAnswer: isCorrect ? q.correctAnswer : 'A',
        isCorrect: isCorrect,
      },
    });
  }

  console.log('Seeding completed successfully!');
  console.log('Admin account: admin@examhub.com / admin123');
  console.log('Student demo: rahul@gmail.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
