import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `full-export-neon-${timestamp}.json`);

  console.log('--- EXPORTING ALL EXAMFORGE DATA FROM NEON DB ---');

  const users = await prisma.user.findMany();
  const userDevices = await prisma.userDevice.findMany();
  const exams = await prisma.exam.findMany();
  const subjects = await prisma.subject.findMany();
  const topics = await prisma.topic.findMany();
  const questions = await prisma.question.findMany();
  const bundles = await prisma.bundle.findMany();
  const bundleQuestions = await prisma.bundleQuestion.findMany();
  const purchases = await prisma.purchase.findMany();
  const attempts = await prisma.attempt.findMany();
  const attemptAnswers = await prisma.attemptAnswer.findMany();

  const exportData = {
    exportedAt: new Date().toISOString(),
    sourceDatabase: 'Neon PostgreSQL (neondb)',
    counts: {
      users: users.length,
      userDevices: userDevices.length,
      exams: exams.length,
      subjects: subjects.length,
      topics: topics.length,
      questions: questions.length,
      bundles: bundles.length,
      bundleQuestions: bundleQuestions.length,
      purchases: purchases.length,
      attempts: attempts.length,
      attemptAnswers: attemptAnswers.length,
    },
    users,
    userDevices,
    exams,
    subjects,
    topics,
    questions,
    bundles,
    bundleQuestions,
    purchases,
    attempts,
    attemptAnswers,
  };

  fs.writeFileSync(backupFile, JSON.stringify(exportData, null, 2), 'utf-8');

  // Also write to a canonical latest file for easy import
  const latestFile = path.join(backupDir, 'latest-export.json');
  fs.writeFileSync(latestFile, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log(`✓ Full export saved to: ${backupFile}`);
  console.log(`✓ Canonical copy saved to: ${latestFile}`);
  console.log('Export summary:', exportData.counts);
}

main()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
