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
  await prisma.userDevice.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const adminHash        = bcrypt.hashSync('admin123', 10);
  const ganeshHash       = bcrypt.hashSync('evokevoicegani@2026', 10);
  const studentHash      = bcrypt.hashSync('student123', 10);
  const testStudentHash  = bcrypt.hashSync('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@examhub.com',
      mobile: '9876543210',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  void admin; // used later optionally

  await prisma.user.create({
    data: {
      name: 'Ganesh Macharla (Admin)',
      email: 'ganimacharla2004@gmail.com',
      mobile: '9876543210',
      passwordHash: ganeshHash,
      role: 'ADMIN',
    },
  });

  const studentRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      mobile: '9876543211',
      passwordHash: studentHash,
      role: 'STUDENT',
      targetExam: 'SSC CGL',
    },
  });

  const studentPriya = await prisma.user.create({
    data: {
      name: 'Priya Verma',
      email: 'priya@gmail.com',
      mobile: '9876543212',
      passwordHash: studentHash,
      role: 'STUDENT',
      targetExam: 'Banking IBPS PO',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Razorpay Test Student',
      email: 'teststudent@examforge.com',
      mobile: '9999999999',
      passwordHash: testStudentHash,
      role: 'STUDENT',
      targetExam: 'General',
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

  // â”€â”€â”€ 4. SUBJECTS & TOPICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // SSC: Quantitative Aptitude
  const quantSubject = await prisma.subject.create({
    data: {
      examId: ssc.id,
      name: 'Quantitative Aptitude',
      description: 'Arithmetic, Algebra, Geometry, Trigonometry, and Data Interpretation',
    },
  });
  const topicPercentage   = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Percentages' } });
  const topicProfitLoss   = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Profit & Loss' } });
  const topicTimeWork     = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Time & Work' } });
  const topicRatio        = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Ratio & Proportion' } });
  const topicSI           = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Simple & Compound Interest' } });
  const topicAverages     = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Averages' } });
  const topicNumberSystem = await prisma.topic.create({ data: { subjectId: quantSubject.id, name: 'Number System' } });

  // Banking: Reasoning Ability
  const reasoningSubject = await prisma.subject.create({
    data: {
      examId: banking.id,
      name: 'Reasoning Ability',
      description: 'Verbal, Non-Verbal, Logical Reasoning and Puzzles',
    },
  });
  const topicCoding         = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Coding-Decoding' } });
  const topicSyllogism      = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Syllogism' } });
  const topicBloodRelations = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Blood Relations' } });
  const topicSeating        = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Seating Arrangement' } });
  const topicInequalities   = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Inequalities' } });
  const topicDirection      = await prisma.topic.create({ data: { subjectId: reasoningSubject.id, name: 'Direction Sense' } });

  // Banking: English Language (NEW)
  const englishSubject = await prisma.subject.create({
    data: {
      examId: banking.id,
      name: 'English Language',
      description: 'Reading Comprehension, Grammar, Vocabulary and Error Detection',
    },
  });
  const topicRC         = await prisma.topic.create({ data: { subjectId: englishSubject.id, name: 'Reading Comprehension' } });
  const topicErrorSpot  = await prisma.topic.create({ data: { subjectId: englishSubject.id, name: 'Error Spotting' } });
  const topicFillBlanks = await prisma.topic.create({ data: { subjectId: englishSubject.id, name: 'Fill in the Blanks' } });
  const topicVocab      = await prisma.topic.create({ data: { subjectId: englishSubject.id, name: 'Vocabulary & Synonyms' } });
  void topicRC; // RC questions can be added later

  // RRB: General Awareness
  const gaSubject = await prisma.subject.create({
    data: {
      examId: rrb.id,
      name: 'General Awareness',
      description: 'Indian Polity, History, Geography, and Science',
    },
  });
  const topicPolity  = await prisma.topic.create({ data: { subjectId: gaSubject.id, name: 'Indian Constitution & Polity' } });
  const topicScience = await prisma.topic.create({ data: { subjectId: gaSubject.id, name: 'General Science' } });
  const topicHistory = await prisma.topic.create({ data: { subjectId: gaSubject.id, name: 'History & Culture' } });
  const topicGeo     = await prisma.topic.create({ data: { subjectId: gaSubject.id, name: 'Geography of India & World' } });

  // State PSC: General Studies (NEW)
  const gsSubject = await prisma.subject.create({
    data: {
      examId: statePsc.id,
      name: 'General Studies',
      description: 'Economy, Governance, Environment, Science & Current Affairs for State PSC exams',
    },
  });
  const topicEconomy     = await prisma.topic.create({ data: { subjectId: gsSubject.id, name: 'Indian Economy' } });
  const topicGovernance  = await prisma.topic.create({ data: { subjectId: gsSubject.id, name: 'Governance & Public Policy' } });
  const topicEnvironment = await prisma.topic.create({ data: { subjectId: gsSubject.id, name: 'Environment & Ecology' } });
  const topicSciTech     = await prisma.topic.create({ data: { subjectId: gsSubject.id, name: 'Science & Technology' } });

  // â”€â”€â”€ 5. QUESTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  type QuestionInput = {
    subjectId: string; topicId: string; questionText: string;
    optionA: string; optionB: string; optionC: string; optionD: string;
    correctAnswer: string; explanation: string; difficulty: string; tags: string;
  };

  const allQuestions: QuestionInput[] = [
    // â”€â”€ Percentages â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicPercentage.id,
      questionText: 'What is 25% of 240?',
      optionA: '40', optionB: '50', optionC: '60', optionD: '80',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '25% of 240 = (25/100) Ã— 240 = 60.',
      tags: 'Arithmetic, Basic, Percentage',
    },
    {
      subjectId: quantSubject.id, topicId: topicPercentage.id,
      questionText: 'If A\'s income is 25% more than B\'s income, by what percentage is B\'s income less than A\'s?',
      optionA: '20%', optionB: '25%', optionC: '16.66%', optionD: '33.33%',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'Let B = 100 â†’ A = 125. % less = (25/125) Ã— 100 = 20%.',
      tags: 'Formula, Percentage',
    },
    {
      subjectId: quantSubject.id, topicId: topicPercentage.id,
      questionText: 'The price of a commodity rises from â‚¹200 to â‚¹250. What is the percentage increase?',
      optionA: '20%', optionB: '25%', optionC: '30%', optionD: '15%',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'Increase = 50. % increase = (50/200) Ã— 100 = 25%.',
      tags: 'Percentage, SSC',
    },
    {
      subjectId: quantSubject.id, topicId: topicPercentage.id,
      questionText: 'In an election, a candidate gets 60% of total votes and wins by 2400 votes. What are the total votes?',
      optionA: '10000', optionB: '12000', optionC: '15000', optionD: '18000',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'Winning margin = 60% âˆ’ 40% = 20% of total = 2400. Total = 12000.',
      tags: 'Election, Percentage, SSC CGL',
    },
    // â”€â”€ Profit & Loss â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicProfitLoss.id,
      questionText: 'A trader marks goods 20% above cost and allows 10% discount. What is his net profit%?',
      optionA: '6%', optionB: '8%', optionC: '10%', optionD: '12%',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'CP=100, MP=120, SP=108. Profit% = 8%.',
      tags: 'Profit and Loss, SSC CGL',
    },
    {
      subjectId: quantSubject.id, topicId: topicProfitLoss.id,
      questionText: 'By selling an article for â‚¹720, a shopkeeper gains 20%. What was the cost price?',
      optionA: 'â‚¹580', optionB: 'â‚¹600', optionC: 'â‚¹620', optionD: 'â‚¹640',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'CP = 720 / 1.20 = â‚¹600.',
      tags: 'Arithmetic, Profit and Loss',
    },
    {
      subjectId: quantSubject.id, topicId: topicProfitLoss.id,
      questionText: 'A person bought an article for â‚¹400 and sold it at a 15% loss. What is the selling price?',
      optionA: 'â‚¹320', optionB: 'â‚¹330', optionC: 'â‚¹340', optionD: 'â‚¹360',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'SP = 400 Ã— 0.85 = â‚¹340.',
      tags: 'Loss, Profit and Loss',
    },
    {
      subjectId: quantSubject.id, topicId: topicProfitLoss.id,
      questionText: 'A dishonest merchant uses a weight of 900g instead of 1kg but claims to sell at cost price. What is his profit%?',
      optionA: '10%', optionB: '11.11%', optionC: '9.09%', optionD: '12.5%',
      correctAnswer: 'B', difficulty: 'Hard',
      explanation: 'Profit% = (100/900) Ã— 100 = 11.11%.',
      tags: 'Dishonest Merchant, Profit and Loss, SSC CGL',
    },
    // â”€â”€ Time & Work â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicTimeWork.id,
      questionText: 'A can complete a job in 12 days and B in 18 days. Together, how many days?',
      optionA: '6 days', optionB: '7.2 days', optionC: '8 days', optionD: '9.5 days',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'Combined rate = 1/12 + 1/18 = 5/36. Days = 36/5 = 7.2.',
      tags: 'Time and Work, SSC',
    },
    {
      subjectId: quantSubject.id, topicId: topicTimeWork.id,
      questionText: 'If 15 men build a wall in 20 days, how many men are needed to build it in 12 days?',
      optionA: '20 men', optionB: '25 men', optionC: '30 men', optionD: '35 men',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: '15 Ã— 20 = M2 Ã— 12 â†’ M2 = 25.',
      tags: 'Man Days, Time and Work',
    },
    {
      subjectId: quantSubject.id, topicId: topicTimeWork.id,
      questionText: 'A does a job in 10 days, B in 15. They work together 4 days, then A leaves. How many more days for B alone?',
      optionA: '3 days', optionB: '4 days', optionC: '5 days', optionD: '6 days',
      correctAnswer: 'C', difficulty: 'Hard',
      explanation: 'In 4 days together: 4 Ã— (1/10 + 1/15) = 4 Ã— 1/6 = 2/3 done. Remaining 1/3 by B alone = (1/3)/(1/15) = 5 days.',
      tags: 'Time and Work, Combined Work',
    },
    // â”€â”€ Ratio & Proportion â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicRatio.id,
      questionText: 'Two numbers are in ratio 3:5. If 9 is subtracted from each, new ratio is 12:23. What is the smaller number?',
      optionA: '27', optionB: '33', optionC: '45', optionD: '55',
      correctAnswer: 'B', difficulty: 'Hard',
      explanation: '(3xâˆ’9)/(5xâˆ’9) = 12/23 â†’ x = 11. Smaller = 33.',
      tags: 'Ratio, Algebra',
    },
    {
      subjectId: quantSubject.id, topicId: topicRatio.id,
      questionText: 'Ratio of ages of two brothers is 3:4. After 5 years, ratio is 4:5. Present age of elder brother?',
      optionA: '15 years', optionB: '16 years', optionC: '20 years', optionD: '24 years',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: '(3x+5)/(4x+5) = 4/5 â†’ x = 5. Elder = 4 Ã— 5 = 20.',
      tags: 'Ages, Ratio',
    },
    // â”€â”€ Simple & Compound Interest â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicSI.id,
      questionText: 'Find the simple interest on â‚¹5000 at 8% per annum for 3 years.',
      optionA: 'â‚¹1000', optionB: 'â‚¹1200', optionC: 'â‚¹1500', optionD: 'â‚¹1800',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'SI = (5000 Ã— 8 Ã— 3)/100 = â‚¹1200.',
      tags: 'Simple Interest, SSC',
    },
    {
      subjectId: quantSubject.id, topicId: topicSI.id,
      questionText: 'Compound interest on â‚¹8000 at 10% per annum for 2 years (compounded annually)?',
      optionA: 'â‚¹1600', optionB: 'â‚¹1640', optionC: 'â‚¹1680', optionD: 'â‚¹1720',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: 'A = 8000 Ã— 1.21 = â‚¹9680. CI = â‚¹1680.',
      tags: 'Compound Interest, SSC CGL',
    },
    {
      subjectId: quantSubject.id, topicId: topicSI.id,
      questionText: 'A sum doubles itself in 8 years at simple interest. What is the rate per annum?',
      optionA: '10%', optionB: '12%', optionC: '12.5%', optionD: '15%',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: 'R = (100 Ã— P)/(P Ã— 8) = 12.5%.',
      tags: 'Simple Interest, Rate',
    },
    // â”€â”€ Averages â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicAverages.id,
      questionText: 'Average of 5 numbers is 27. If one is excluded, average becomes 25. What is the excluded number?',
      optionA: '35', optionB: '37', optionC: '39', optionD: '42',
      correctAnswer: 'A', difficulty: 'Easy',
      explanation: 'Total of 5 = 135. Total of 4 = 100. Excluded = 35.',
      tags: 'Averages, SSC',
    },
    {
      subjectId: quantSubject.id, topicId: topicAverages.id,
      questionText: 'Average age of 30 students is 14. Including teacher, average becomes 15. Teacher\'s age?',
      optionA: '35 years', optionB: '40 years', optionC: '45 years', optionD: '50 years',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '31 Ã— 15 âˆ’ 30 Ã— 14 = 465 âˆ’ 420 = 45.',
      tags: 'Averages, Ages',
    },
    // â”€â”€ Number System â”€â”€
    {
      subjectId: quantSubject.id, topicId: topicNumberSystem.id,
      questionText: 'What is the LCM of 12, 18, and 24?',
      optionA: '36', optionB: '48', optionC: '72', optionD: '96',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '12=2Â²Ã—3, 18=2Ã—3Â², 24=2Â³Ã—3. LCM = 2Â³Ã—3Â² = 72.',
      tags: 'LCM, Number System',
    },
    {
      subjectId: quantSubject.id, topicId: topicNumberSystem.id,
      questionText: 'Find the HCF of 72 and 120.',
      optionA: '12', optionB: '18', optionC: '24', optionD: '36',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '72=2Â³Ã—3Â², 120=2Â³Ã—3Ã—5. HCF = 2Â³Ã—3 = 24.',
      tags: 'HCF, Number System',
    },
    {
      subjectId: quantSubject.id, topicId: topicNumberSystem.id,
      questionText: 'What is the remainder when 2^100 is divided by 3?',
      optionA: '0', optionB: '1', optionC: '2', optionD: '3',
      correctAnswer: 'B', difficulty: 'Hard',
      explanation: '2Â¹â‰¡2, 2Â²â‰¡1 (mod 3). Even powers â†’ remainder 1. 2^100 â‰¡ 1 (mod 3).',
      tags: 'Remainders, Number System, SSC CGL',
    },
    // â”€â”€ Reasoning: Coding-Decoding â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicCoding.id,
      questionText: 'In a code, "TEACHER" is written as "VGCEJGT". How is "CHILDREN" written?',
      optionA: 'EJKNFTGP', optionB: 'EJKNFUTP', optionC: 'EKNJFTGP', optionD: 'EJLNFTGP',
      correctAnswer: 'A', difficulty: 'Easy',
      explanation: 'Each letter +2: Câ†’E, Hâ†’J, Iâ†’K, Lâ†’N, Dâ†’F, Râ†’T, Eâ†’G, Nâ†’P â†’ EJKNFTGP.',
      tags: 'Coding-Decoding, Alphabetical Pattern',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicCoding.id,
      questionText: 'If "APPLE" is coded as 50, how is "ORANGE" coded?',
      optionA: '60', optionB: '64', optionC: '68', optionD: '72',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'ORANGE = O(15)+R(18)+A(1)+N(14)+G(7)+E(5) = 60.',
      tags: 'Number Coding, Banking',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicCoding.id,
      questionText: 'In a code, LAKE = 3125, FILE = 6295. How is LIKE coded?',
      optionA: '3925', optionB: '3295', optionC: '3259', optionD: '2935',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'L=3, I=9, K=2, E=5. LIKE = 3295.',
      tags: 'Coding-Decoding, Banking Exam',
    },
    // â”€â”€ Reasoning: Syllogism â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicSyllogism.id,
      questionText: 'Statements: All pens are books. Some books are rulers.\nConclusions: I. Some rulers are pens. II. Some books are pens.',
      optionA: 'Only I follows', optionB: 'Only II follows', optionC: 'Either I or II', optionD: 'Both follow',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: '"All pens are books" â†’ "Some books are pens" is true. Conclusion I is not definite.',
      tags: 'Syllogisms, Logic, Banking',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicSyllogism.id,
      questionText: 'Statements: All dogs are cats. No cat is a bird.\nConclusion: No dog is a bird.',
      optionA: 'Definitely follows', optionB: 'Does not follow', optionC: 'Data insufficient', optionD: 'Partially follows',
      correctAnswer: 'A', difficulty: 'Easy',
      explanation: 'All dogs are cats + No cat is a bird â†’ No dog is a bird.',
      tags: 'Syllogism, Deductive Reasoning',
    },
    // â”€â”€ Reasoning: Blood Relations â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicBloodRelations.id,
      questionText: 'Pointing to a boy\'s photo, Suresh says "He is the son of the only son of my mother." How is Suresh related to the boy?',
      optionA: 'Brother', optionB: 'Uncle', optionC: 'Father', optionD: 'Grandfather',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '"Only son of my mother" = Suresh. So the boy is Suresh\'s son.',
      tags: 'Blood Relations, Reasoning',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicBloodRelations.id,
      questionText: 'A is B\'s sister. C is B\'s mother. D is C\'s father. How is A related to D?',
      optionA: 'Granddaughter', optionB: 'Daughter', optionC: 'Grand-niece', optionD: 'Daughter-in-law',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'D is C\'s father (B\'s maternal grandfather). A is B\'s sister â†’ A is D\'s granddaughter.',
      tags: 'Blood Relations, SBI PO',
    },
    // â”€â”€ Reasoning: Seating Arrangement â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicSeating.id,
      questionText: 'Six people sit in a row. A is 3rd from left, B is 4th from right. How many people sit between A and B?',
      optionA: '0', optionB: '1', optionC: '2', optionD: '3',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'A = position 3. B = 6 âˆ’ 4 + 1 = position 3. They are the same position, so 0 people between them.',
      tags: 'Seating Arrangement, IBPS PO',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicSeating.id,
      questionText: 'Five people P Q R S T sit in a circle. P is to immediate right of Q. R is between T and Q. S is to immediate left of T. Who is to immediate left of P?',
      optionA: 'R', optionB: 'S', optionC: 'T', optionD: 'Q',
      correctAnswer: 'D', difficulty: 'Hard',
      explanation: 'P sits to immediate right of Q â†’ Q is immediately left of P.',
      tags: 'Circular Arrangement, Banking',
    },
    // â”€â”€ Reasoning: Inequalities â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicInequalities.id,
      questionText: 'If A > B â‰¥ C and D < C, which is definitely true?',
      optionA: 'A > D only', optionB: 'B > D only', optionC: 'A = D', optionD: 'Both A > D and B > D',
      correctAnswer: 'D', difficulty: 'Medium',
      explanation: 'A > B â‰¥ C > D â†’ A > D and B > D are both true.',
      tags: 'Inequalities, Banking, IBPS Clerk',
    },
    {
      subjectId: reasoningSubject.id, topicId: topicInequalities.id,
      questionText: 'Statements: M â‰¥ N = O > P; Q < O.\nConclusion I: M > P. Conclusion II: Q < N.',
      optionA: 'Only I follows', optionB: 'Only II follows', optionC: 'Both follow', optionD: 'Neither follows',
      correctAnswer: 'C', difficulty: 'Hard',
      explanation: 'M â‰¥ N = O > P â†’ M > P (I true). Q < O = N â†’ Q < N (II true). Both follow.',
      tags: 'Coded Inequalities, SBI PO',
    },
    // â”€â”€ Reasoning: Direction Sense â”€â”€
    {
      subjectId: reasoningSubject.id, topicId: topicDirection.id,
      questionText: 'A man walks 6 km north, turns right and walks 4 km, turns right and walks 6 km. Distance from start?',
      optionA: '2 km', optionB: '4 km', optionC: '6 km', optionD: '10 km',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'N 6km, E 4km, S 6km â†’ ends 4km east of start. Distance = 4 km.',
      tags: 'Direction Sense, Reasoning',
    },
    // â”€â”€ English: Error Spotting â”€â”€
    {
      subjectId: englishSubject.id, topicId: topicErrorSpot.id,
      questionText: 'Identify the error:\n(A) The committee has / (B) decided to postpone / (C) the meeting / (D) until further notice.',
      optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'No error',
      correctAnswer: 'D', difficulty: 'Easy',
      explanation: 'The sentence is grammatically correct. No error.',
      tags: 'Error Spotting, Grammar, Banking',
    },
    {
      subjectId: englishSubject.id, topicId: topicErrorSpot.id,
      questionText: 'Find the error:\n(A) Neither of the solutions / (B) were acceptable / (C) to the management / (D) No error.',
      optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: '"Neither" takes a singular verb. "were" should be "was".',
      tags: 'Subject-Verb Agreement, Error Spotting',
    },
    {
      subjectId: englishSubject.id, topicId: topicErrorSpot.id,
      questionText: 'Find the error:\n(A) Hardly did he / (B) reached home / (C) when it started / (D) raining heavily.',
      optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D',
      correctAnswer: 'A', difficulty: 'Hard',
      explanation: '"Hardly" requires inversion with "had": "Hardly had he reached home..."',
      tags: 'Inversion, Tense, Error Spotting',
    },
    // â”€â”€ English: Fill in the Blanks â”€â”€
    {
      subjectId: englishSubject.id, topicId: topicFillBlanks.id,
      questionText: 'The judge _____ the lawyer\'s argument as it was well-reasoned and evidence-based.',
      optionA: 'dismissed', optionB: 'commended', optionC: 'reprimanded', optionD: 'ignored',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: '"Commended" means praised, fitting for a well-reasoned argument.',
      tags: 'Fill in the Blanks, Vocabulary, IBPS PO',
    },
    {
      subjectId: englishSubject.id, topicId: topicFillBlanks.id,
      questionText: 'Despite his best efforts, he could not _____ the misunderstanding between the two parties.',
      optionA: 'resolve', optionB: 'exacerbate', optionC: 'aggravate', optionD: 'intensify',
      correctAnswer: 'A', difficulty: 'Easy',
      explanation: '"Resolve" = settle, which fits for a misunderstanding.',
      tags: 'Fill in the Blanks, Contextual Meaning',
    },
    {
      subjectId: englishSubject.id, topicId: topicFillBlanks.id,
      questionText: 'The ancient ruins were so _____ that archaeologists spent years deciphering their meaning.',
      optionA: 'lucid', optionB: 'mundane', optionC: 'enigmatic', optionD: 'transparent',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: '"Enigmatic" = mysterious and hard to interpret.',
      tags: 'Vocabulary, Fill in the Blanks, SBI PO',
    },
    // â”€â”€ English: Vocabulary â”€â”€
    {
      subjectId: englishSubject.id, topicId: topicVocab.id,
      questionText: 'Choose the synonym of "ALACRITY":',
      optionA: 'Sluggishness', optionB: 'Eagerness', optionC: 'Sadness', optionD: 'Confusion',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: '"Alacrity" = brisk and cheerful readiness.',
      tags: 'Synonyms, Vocabulary, Banking',
    },
    {
      subjectId: englishSubject.id, topicId: topicVocab.id,
      questionText: 'Choose the antonym of "FRUGAL":',
      optionA: 'Thrifty', optionB: 'Economical', optionC: 'Extravagant', optionD: 'Prudent',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: '"Frugal" = careful with money; antonym = "extravagant".',
      tags: 'Antonyms, Vocabulary',
    },
    // â”€â”€ General Awareness: Polity â”€â”€
    {
      subjectId: gaSubject.id, topicId: topicPolity.id,
      questionText: 'Who is recognized as the "Father of the Indian Constitution"?',
      optionA: 'Mahatma Gandhi', optionB: 'Dr. B. R. Ambedkar', optionC: 'Jawaharlal Nehru', optionD: 'Dr. Rajendra Prasad',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'Dr. Ambedkar chaired the Drafting Committee of the Constituent Assembly.',
      tags: 'Polity, Static GK, RRB',
    },
    {
      subjectId: gaSubject.id, topicId: topicPolity.id,
      questionText: 'Which Article guarantees "Equality before Law"?',
      optionA: 'Article 14', optionB: 'Article 19', optionC: 'Article 21', optionD: 'Article 32',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'Article 14 ensures equality before the law for all persons in India.',
      tags: 'Fundamental Rights, Polity',
    },
    {
      subjectId: gaSubject.id, topicId: topicPolity.id,
      questionText: 'In which year was the Constitution of India adopted?',
      optionA: '1947', optionB: '1948', optionC: '1949', optionD: '1950',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'Adopted on 26 November 1949; came into force on 26 January 1950.',
      tags: 'Polity, Constitution, RRB NTPC',
    },
    {
      subjectId: gaSubject.id, topicId: topicPolity.id,
      questionText: '"Judicial Review" in India is borrowed from the constitution of which country?',
      optionA: 'UK', optionB: 'USA', optionC: 'Australia', optionD: 'Canada',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'Judicial Review was adopted from the US Constitution.',
      tags: 'Polity, Borrowed Features, RRB',
    },
    // â”€â”€ General Awareness: Science â”€â”€
    {
      subjectId: gaSubject.id, topicId: topicScience.id,
      questionText: 'What is the chemical formula for Baking Soda?',
      optionA: 'Naâ‚‚COâ‚ƒ', optionB: 'NaHCOâ‚ƒ', optionC: 'CaCOâ‚ƒ', optionD: 'NaOH',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'Baking Soda = Sodium Bicarbonate (NaHCOâ‚ƒ).',
      tags: 'Chemistry, General Science, Railways',
    },
    {
      subjectId: gaSubject.id, topicId: topicScience.id,
      questionText: 'Which organ primarily filters urea from the blood?',
      optionA: 'Heart', optionB: 'Liver', optionC: 'Kidneys', optionD: 'Lungs',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'The kidneys filter waste including urea to produce urine.',
      tags: 'Biology, Human Physiology, Science',
    },
    {
      subjectId: gaSubject.id, topicId: topicScience.id,
      questionText: 'What is the SI unit of electric current?',
      optionA: 'Volt', optionB: 'Watt', optionC: 'Ampere', optionD: 'Ohm',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'The SI unit of electric current is the Ampere (A).',
      tags: 'Physics, Electricity, RRB',
    },
    {
      subjectId: gaSubject.id, topicId: topicScience.id,
      questionText: 'Photosynthesis primarily takes place in which organelle?',
      optionA: 'Mitochondria', optionB: 'Nucleus', optionC: 'Chloroplast', optionD: 'Ribosomes',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis.',
      tags: 'Biology, Botany, Science',
    },
    // â”€â”€ General Awareness: History â”€â”€
    {
      subjectId: gaSubject.id, topicId: topicHistory.id,
      questionText: 'The Battle of Plassey (1757) was fought between the British and which Nawab?',
      optionA: 'Tipu Sultan', optionB: 'Siraj ud-Daulah', optionC: 'Mir Jafar', optionD: 'Hyder Ali',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'Fought between British (under Clive) and Siraj ud-Daulah of Bengal.',
      tags: 'History, British India, RRB NTPC',
    },
    {
      subjectId: gaSubject.id, topicId: topicHistory.id,
      questionText: 'Which ancient university, located in present-day Bihar, was the world\'s first residential university?',
      optionA: 'Taxila', optionB: 'Vikramashila', optionC: 'Nalanda', optionD: 'Vallabhi',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: 'Nalanda was an ancient Mahavihara in Bihar, a great seat of Buddhist learning.',
      tags: 'Ancient India, Culture, RRB',
    },
    {
      subjectId: gaSubject.id, topicId: topicHistory.id,
      questionText: 'The "Dandi March" (Salt March) of 1930 was led by:',
      optionA: 'Jawaharlal Nehru', optionB: 'Subhas Chandra Bose', optionC: 'Mahatma Gandhi', optionD: 'Bal Gangadhar Tilak',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'Gandhi led the 241-mile Dandi March to protest the British salt tax.',
      tags: 'Freedom Movement, History, RRB Group D',
    },
    // â”€â”€ General Awareness: Geography â”€â”€
    {
      subjectId: gaSubject.id, topicId: topicGeo.id,
      questionText: 'Which is the longest river in India?',
      optionA: 'Brahmaputra', optionB: 'Yamuna', optionC: 'Ganga', optionD: 'Godavari',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'The Ganga is the longest river in India (~2525 km).',
      tags: 'Geography, Rivers, RRB NTPC',
    },
    {
      subjectId: gaSubject.id, topicId: topicGeo.id,
      questionText: 'The Tropic of Cancer passes through how many Indian states?',
      optionA: '6', optionB: '7', optionC: '8', optionD: '9',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: 'Passes through 8 states: Gujarat, Rajasthan, MP, CG, Jharkhand, WB, Tripura, Mizoram.',
      tags: 'Geography, Tropic of Cancer, RRB',
    },
    // â”€â”€ General Studies: Economy â”€â”€
    {
      subjectId: gsSubject.id, topicId: topicEconomy.id,
      questionText: 'Which Five Year Plan introduced "Garibi Hatao" (Abolish Poverty) as its main objective?',
      optionA: '3rd Plan', optionB: '4th Plan', optionC: '5th Plan', optionD: '6th Plan',
      correctAnswer: 'C', difficulty: 'Medium',
      explanation: 'The 5th Five Year Plan (1974â€“78) had "Garibi Hatao" as its central objective.',
      tags: 'Economy, Five Year Plans, APPSC',
    },
    {
      subjectId: gsSubject.id, topicId: topicEconomy.id,
      questionText: 'Which institution is the "Lender of Last Resort" in India?',
      optionA: 'State Bank of India', optionB: 'SEBI', optionC: 'Reserve Bank of India', optionD: 'NABARD',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'The RBI acts as lender of last resort, providing emergency funds to banks in crisis.',
      tags: 'Economy, RBI, Banking, TSPSC',
    },
    {
      subjectId: gsSubject.id, topicId: topicEconomy.id,
      questionText: 'The Green Revolution in India was primarily associated with which crop?',
      optionA: 'Rice', optionB: 'Wheat', optionC: 'Maize', optionD: 'Pulses',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'The Green Revolution (1960sâ€“70s) focused on high-yielding wheat varieties in Punjab and Haryana.',
      tags: 'Economy, Agriculture, Green Revolution, APPSC',
    },
    {
      subjectId: gsSubject.id, topicId: topicEconomy.id,
      questionText: 'India\'s GDP is measured at what prices in current standard practice?',
      optionA: 'Only current market prices', optionB: 'Only constant prices', optionC: 'Both current and constant prices', optionD: 'International prices',
      correctAnswer: 'C', difficulty: 'Hard',
      explanation: 'India measures GDP at both Current Prices (nominal) and Constant Prices (real).',
      tags: 'GDP, Economy, APPSC Group 1',
    },
    // â”€â”€ General Studies: Governance â”€â”€
    {
      subjectId: gsSubject.id, topicId: topicGovernance.id,
      questionText: 'The 73rd Constitutional Amendment Act (1992) is related to:',
      optionA: 'Urban local bodies', optionB: 'Panchayati Raj Institutions', optionC: 'State PSCs', optionD: 'CIC',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'The 73rd Amendment gave constitutional status to Panchayati Raj Institutions.',
      tags: 'Polity, Panchayati Raj, APPSC Group 2',
    },
    {
      subjectId: gsSubject.id, topicId: topicGovernance.id,
      questionText: 'Which Article deals with the Right to Education (RTE)?',
      optionA: 'Article 21', optionB: 'Article 21A', optionC: 'Article 22', optionD: 'Article 45',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'Article 21A (86th Amendment, 2002) provides free compulsory education for children 6â€“14.',
      tags: 'Polity, RTE, Governance, TSPSC',
    },
    // â”€â”€ General Studies: Environment â”€â”€
    {
      subjectId: gsSubject.id, topicId: topicEnvironment.id,
      questionText: 'Which gas is primarily responsible for the "Greenhouse Effect"?',
      optionA: 'Oxygen', optionB: 'Nitrogen', optionC: 'Carbon dioxide', optionD: 'Hydrogen',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'Carbon dioxide (COâ‚‚) is the most significant long-lived greenhouse gas.',
      tags: 'Environment, Climate Change, APPSC',
    },
    {
      subjectId: gsSubject.id, topicId: topicEnvironment.id,
      questionText: 'The "Chipko Movement" of the 1970s was associated with:',
      optionA: 'Protection of rivers', optionB: 'Protection of forests/trees', optionC: 'Wildlife conservation', optionD: 'Anti-pollution',
      correctAnswer: 'B', difficulty: 'Easy',
      explanation: 'Chipko Movement (1973) in Uttarakhand: villagers hugged trees to prevent deforestation.',
      tags: 'Environment, Social Movements, APPSC Group 2',
    },
    {
      subjectId: gsSubject.id, topicId: topicEnvironment.id,
      questionText: 'Which international agreement aims to reduce greenhouse gas emissions?',
      optionA: 'Kyoto Protocol', optionB: 'Basel Convention', optionC: 'Stockholm Convention', optionD: 'Rotterdam Convention',
      correctAnswer: 'A', difficulty: 'Medium',
      explanation: 'Kyoto Protocol (1997) set binding emission-reduction targets for developed countries.',
      tags: 'Environment, International Agreements, TSPSC',
    },
    // â”€â”€ General Studies: Science & Technology â”€â”€
    {
      subjectId: gsSubject.id, topicId: topicSciTech.id,
      questionText: 'What does "ISRO" stand for?',
      optionA: 'Indian Space Research Organisation', optionB: 'Indian Scientific Research Organisation', optionC: 'International Space Research Operations', optionD: 'Indian Satellite and Rocket Organisation',
      correctAnswer: 'A', difficulty: 'Easy',
      explanation: 'ISRO = Indian Space Research Organisation, established 1969, HQ in Bengaluru.',
      tags: 'Science, Space, APPSC, TSPSC',
    },
    {
      subjectId: gsSubject.id, topicId: topicSciTech.id,
      questionText: 'India\'s Chandrayaan-3 mission successfully landed on which part of the Moon?',
      optionA: 'Lunar equator', optionB: 'North Pole', optionC: 'South Pole region', optionD: 'Far side of the Moon',
      correctAnswer: 'C', difficulty: 'Easy',
      explanation: 'Chandrayaan-3 landed near the Moon\'s South Pole on 23 August 2023 â€” a world first.',
      tags: 'Science, Space, Current Affairs, APPSC 2024',
    },
    {
      subjectId: gsSubject.id, topicId: topicSciTech.id,
      questionText: 'Modern Artificial Intelligence (AI) is primarily based on:',
      optionA: 'Quantum mechanics', optionB: 'Machine learning and data models', optionC: 'Traditional programming rules only', optionD: 'Biological neural processes only',
      correctAnswer: 'B', difficulty: 'Medium',
      explanation: 'Modern AI is primarily based on machine learning â€” algorithms that learn from large datasets.',
      tags: 'Technology, AI, Science, Current Affairs',
    },
  ];

  const createdQuestions: { id: string; subjectId: string; correctAnswer: string }[] = [];
  const subjMap = new Map<string, string>();
  for (const q of allQuestions) {
    let examId = subjMap.get(q.subjectId);
    if (!examId) {
      const s = await prisma.subject.findUnique({ where: { id: q.subjectId }, select: { examId: true } });
      examId = s?.examId || ssc.id;
      subjMap.set(q.subjectId, examId);
    }
    const question = await prisma.question.create({ data: { ...q, examId } });
    createdQuestions.push(question);
  }
  console.log(`Created ${createdQuestions.length} questions.`);

  // â”€â”€â”€ 6. BUNDLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const sscBundle = await prisma.bundle.create({
    data: {
      name: 'SSC CGL Quantitative Aptitude â€“ Practice Set 1',
      description: 'Comprehensive practice set covering Percentages, Profit & Loss, Time & Work, Ratio, Interest, Averages, and Number System with step-by-step solutions.',
      examId: ssc.id,
      subjectName: 'Quantitative Aptitude',
      difficulty: 'Mixed',
      price: 49,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    },
  });

  const bankingReasoningBundle = await prisma.bundle.create({
    data: {
      name: 'Banking Reasoning Ability Master Set',
      description: 'High-yield reasoning puzzles, syllogisms, coding-decoding, seating arrangements, and inequalities for SBI & IBPS PO/Clerk aspirants.',
      examId: banking.id,
      subjectName: 'Reasoning Ability',
      difficulty: 'Medium',
      price: 79,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    },
  });

  const bankingEnglishBundle = await prisma.bundle.create({
    data: {
      name: 'Banking English Language Essentials',
      description: 'Master Error Spotting, Fill in the Blanks, and Vocabulary for IBPS PO, SBI PO, and RBI exams.',
      examId: banking.id,
      subjectName: 'English Language',
      difficulty: 'Mixed',
      price: 59,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    },
  });

  const rrbBundle = await prisma.bundle.create({
    data: {
      name: 'RRB General Awareness Express Set',
      description: 'Indian Polity, General Science, History, and Geography questions for RRB NTPC & Group D.',
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
      description: 'Economy, Governance, Environment, and Science & Technology for State PSC aspirants.',
      examId: statePsc.id,
      subjectName: 'General Studies',
      difficulty: 'Mixed',
      price: 69,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    },
  });

  // â”€â”€â”€ 7. ASSOCIATE QUESTIONS WITH BUNDLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const quantQs     = createdQuestions.filter(q => q.subjectId === quantSubject.id);
  const reasoningQs = createdQuestions.filter(q => q.subjectId === reasoningSubject.id);
  const englishQs   = createdQuestions.filter(q => q.subjectId === englishSubject.id);
  const gaQs        = createdQuestions.filter(q => q.subjectId === gaSubject.id);
  const gsQs        = createdQuestions.filter(q => q.subjectId === gsSubject.id);

  for (const q of quantQs)     await prisma.bundleQuestion.create({ data: { bundleId: sscBundle.id,              questionId: q.id } });
  for (const q of reasoningQs) await prisma.bundleQuestion.create({ data: { bundleId: bankingReasoningBundle.id, questionId: q.id } });
  for (const q of englishQs)   await prisma.bundleQuestion.create({ data: { bundleId: bankingEnglishBundle.id,   questionId: q.id } });
  for (const q of gaQs)        await prisma.bundleQuestion.create({ data: { bundleId: rrbBundle.id,              questionId: q.id } });
  for (const q of gsQs)        await prisma.bundleQuestion.create({ data: { bundleId: appscBundle.id,            questionId: q.id } });

  // â”€â”€â”€ 8. PURCHASES & ATTEMPTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.purchase.create({
    data: {
      userId: studentRahul.id, bundleId: sscBundle.id, amount: 49,
      razorpayOrderId: 'order_mock_seed_101', razorpayPaymentId: 'pay_mock_seed_201', status: 'PAID',
    },
  });
  await prisma.purchase.create({
    data: {
      userId: studentPriya.id, bundleId: bankingReasoningBundle.id, amount: 79,
      razorpayOrderId: 'order_mock_seed_102', razorpayPaymentId: 'pay_mock_seed_202', status: 'PAID',
    },
  });
  await prisma.purchase.create({
    data: {
      userId: studentPriya.id, bundleId: bankingEnglishBundle.id, amount: 59,
      razorpayOrderId: 'order_mock_seed_103', razorpayPaymentId: 'pay_mock_seed_203', status: 'PAID',
    },
  });

  const attempt = await prisma.attempt.create({
    data: {
      userId: studentRahul.id, bundleId: sscBundle.id, mode: 'TEST',
      score: 16, totalQuestions: quantQs.length, correct: 16, incorrect: 4, unanswered: 0,
      accuracy: 80.0, timeTakenSec: 1440,
    },
  });
  for (let i = 0; i < quantQs.length; i++) {
    const q = quantQs[i];
    const isCorrect = i < 16;
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id, questionId: q.id,
        selectedAnswer: isCorrect ? q.correctAnswer : 'A',
        isCorrect,
      },
    });
  }

  console.log('\nâœ… Seeding completed successfully!');
  console.log('â”'.repeat(52));
  console.log('ðŸ‘‘  Admin:         admin@examhub.com            / admin123');
  console.log('ðŸ‘‘  Admin:         ganimacharla2004@gmail.com   / evokevoicegani@2026');
  console.log('ðŸŽ“  Student:       rahul@gmail.com              / student123');
  console.log('ðŸŽ“  Student:       priya@gmail.com              / student123');
  console.log('ðŸ§ª  Test Student:  teststudent@examforge.com    / student123');
  console.log('â”'.repeat(52));
  console.log(`ðŸ“š  Total Questions: ${createdQuestions.length}`);
  console.log(`ðŸ“¦  Total Bundles:   5`);
  console.log(`ðŸ“  Subjects:        Quant, Reasoning, English, GA, GS`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
