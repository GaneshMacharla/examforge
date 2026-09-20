import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `db-backup-${timestamp}.json`);

  console.log('Starting full database backup before data cleanup...');

  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  const exams = await prisma.exam.findMany({ include: { subjects: { include: { topics: true } } } });
  const questions = await prisma.question.findMany();
  const bundles = await prisma.bundle.findMany({ include: { questions: true } });
  const purchases = await prisma.purchase.findMany();
  const attempts = await prisma.attempt.findMany({ include: { answers: true } });

  const backupData = {
    timestamp: new Date().toISOString(),
    counts: {
      users: users.length,
      exams: exams.length,
      questions: questions.length,
      bundles: bundles.length,
      purchases: purchases.length,
      attempts: attempts.length,
    },
    users,
    exams,
    questions,
    bundles,
    purchases,
    attempts,
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`Backup completed successfully! Saved to: ${backupFile}`);
  console.log('Backup summary:', backupData.counts);
}

main()
  .catch((e) => {
    console.error('Backup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
