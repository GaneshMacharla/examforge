import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.count();
  const userDevices = await prisma.userDevice.count();
  const exams = await prisma.exam.findMany({
    include: {
      _count: {
        select: { subjects: true, bundles: true }
      }
    }
  });
  const subjects = await prisma.subject.count();
  const topics = await prisma.topic.count();
  const questions = await prisma.question.count();
  const bundles = await prisma.bundle.findMany({
    include: {
      _count: {
        select: { questions: true, purchases: true, attempts: true }
      }
    }
  });
  const purchases = await prisma.purchase.count();
  const attempts = await prisma.attempt.count();
  const attemptAnswers = await prisma.attemptAnswer.count();

  console.log('--- DATABASE INVENTORY ---');
  console.log(`Users: ${users} (UserDevices: ${userDevices})`);
  console.log(`Exams (${exams.length}):`, exams.map(e => ({ name: e.name, code: e.code, subjects: e._count.subjects, bundles: e._count.bundles })));
  console.log(`Subjects: ${subjects}, Topics: ${topics}, Questions: ${questions}`);
  console.log(`Bundles (${bundles.length}):`, bundles.map(b => ({ id: b.id, name: b.name, price: b.price, questions: b._count.questions, purchases: b._count.purchases, attempts: b._count.attempts })));
  console.log(`Purchases: ${purchases}, Attempts: ${attempts}, AttemptAnswers: ${attemptAnswers}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
