import { POST, GET } from '../src/app/api/questions/ai-ingest/route';
import { prisma } from '../src/lib/prisma';

async function runTests() {
  console.log('--- TEST 1: Unauthorized call (should fail with 401) ---');
  const reqUnauthorized = new Request('http://localhost:3000/api/questions/ai-ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionText: 'test' }),
  });
  const res1 = await POST(reqUnauthorized);
  console.log('Status:', res1.status);
  const data1 = await res1.json();
  console.log('Response:', data1);
  if (res1.status !== 401) throw new Error('Expected 401 Unauthorized');

  console.log('\n--- TEST 2: GET Discovery / Health Check ---');
  const reqDiscovery = new Request('http://localhost:3000/api/questions/ai-ingest', {
    method: 'GET',
    headers: {
      'x-api-key': process.env.AI_INGEST_SECRET || '',
    },
  });
  const res2 = await GET(reqDiscovery);
  console.log('Status:', res2.status);
  const data2 = await res2.json();
  console.log('Response status:', data2.status);
  console.log('Available exams count:', data2.availableCurriculum?.length);

  console.log('\n--- TEST 3: Ingesting Batch Questions from AI Agent ---');
  const sampleAgentPayload = {
    examCode: 'RRB',
    subjectName: 'General Science',
    topicName: 'Physics',
    questions: [
      {
        questionText: 'Which of the following is the SI unit of electric current?',
        optionA: 'Volt',
        optionB: 'Ampere',
        optionC: 'Ohm',
        optionD: 'Watt',
        correctAnswer: 'B',
        explanation: 'The SI unit of electric current is the ampere (symbol: A).',
        difficulty: 'Easy',
        tags: ['physics', 'units', 'rrb-alp'],
      },
      {
        questionText: 'What is the speed of light in a vacuum?',
        optionA: '3 x 10^8 m/s',
        optionB: '3 x 10^6 m/s',
        optionC: '3 x 10^5 km/s',
        optionD: 'Both A and C',
        correctAnswer: 'D',
        explanation: '3 x 10^8 m/s is equivalent to 3 x 10^5 km/s.',
        difficulty: 'Medium',
        tags: 'physics, light, optics',
      },
    ],
  };

  const reqIngest = new Request('http://localhost:3000/api/questions/ai-ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_INGEST_SECRET}`,
    },
    body: JSON.stringify(sampleAgentPayload),
  });

  const res3 = await POST(reqIngest);
  console.log('Status:', res3.status);
  const data3 = await res3.json();
  console.log('Response:', JSON.stringify(data3, null, 2));

  if (res3.status !== 201 || data3.storedCount !== 2) {
    throw new Error('Expected 201 and 2 stored questions');
  }

  console.log('\n--- VERIFY DATABASE RECORDS ---');
  const questionIds = data3.savedQuestions.map((q: any) => q.id);
  const dbQuestions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: {
      subject: { include: { exam: true } },
      topic: true,
    },
  });

  for (const q of dbQuestions) {
    console.log(`Saved Question ID: ${q.id}`);
    console.log(`Exam: ${q.subject.exam.name} (${q.subject.exam.code})`);
    console.log(`Subject: ${q.subject.name}`);
    console.log(`Topic: ${q.topic.name}`);
    console.log(`Question: ${q.questionText}`);
    console.log(`Options: A) ${q.optionA} | B) ${q.optionB} | C) ${q.optionC} | D) ${q.optionD}`);
    console.log(`Answer: ${q.correctAnswer} - ${q.explanation}`);
    console.log('--------------------------------------------------');
  }

  console.log('\nALL TESTS PASSED SUCCESSFULLY!');
}

runTests()
  .catch(err => {
    console.error('TEST ERROR:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
