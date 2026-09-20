import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  const latestFile = path.join(process.cwd(), 'backups', 'latest-export.json');
  if (!fs.existsSync(latestFile)) {
    console.error(`Export file not found at: ${latestFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
  console.log('--- IMPORTING DATA INTO TARGET DATABASE ---');
  console.log('Source export summary:', data.counts);

  // 1. Users
  console.log(`Importing ${data.users.length} users...`);
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        mobile: u.mobile || null,
        passwordHash: u.passwordHash || null,
        avatarUrl: u.avatarUrl || null,
        oauthProvider: u.oauthProvider || null,
        oauthId: u.oauthId || null,
        role: u.role || 'STUDENT',
        targetExam: u.targetExam || null,
        deviceResetCooldownAt: u.deviceResetCooldownAt ? new Date(u.deviceResetCooldownAt) : null,
        createdAt: new Date(u.createdAt),
      },
    });
  }

  // 2. UserDevices
  console.log(`Importing ${data.userDevices.length} user devices...`);
  for (const d of data.userDevices) {
    await prisma.userDevice.upsert({
      where: {
        userId_deviceFingerprint: {
          userId: d.userId,
          deviceFingerprint: d.deviceFingerprint,
        },
      },
      update: {},
      create: {
        id: d.id,
        userId: d.userId,
        deviceFingerprint: d.deviceFingerprint,
        deviceName: d.deviceName,
        ipAddress: d.ipAddress,
        lastActiveAt: new Date(d.lastActiveAt),
        createdAt: new Date(d.createdAt),
      },
    });
  }

  // 3. Exams
  console.log(`Importing ${data.exams.length} exams...`);
  for (const e of data.exams) {
    await prisma.exam.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        name: e.name,
        code: e.code,
        description: e.description,
        icon: e.icon,
      },
    });
  }

  // 4. Subjects
  console.log(`Importing ${data.subjects.length} subjects...`);
  for (const s of data.subjects) {
    await prisma.subject.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        description: s.description,
        examId: s.examId,
      },
    });
  }

  // 5. Topics
  console.log(`Importing ${data.topics.length} topics...`);
  for (const t of data.topics) {
    await prisma.topic.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        subjectId: t.subjectId,
      },
    });
  }

  // 6. Questions
  console.log(`Importing ${data.questions.length} questions...`);
  for (const q of data.questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        examId: q.examId,
        subjectId: q.subjectId,
        topicId: q.topicId,
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        tags: q.tags,
        createdAt: new Date(q.createdAt),
      },
    });
  }

  // 7. Bundles
  console.log(`Importing ${data.bundles.length} bundles...`);
  for (const b of data.bundles) {
    await prisma.bundle.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        name: b.name,
        description: b.description,
        examId: b.examId,
        subjectName: b.subjectName,
        difficulty: b.difficulty,
        price: b.price,
        thumbnail: b.thumbnail,
        status: b.status,
        createdAt: new Date(b.createdAt),
      },
    });
  }

  // 8. BundleQuestions
  console.log(`Importing ${data.bundleQuestions.length} bundle-question links...`);
  for (const bq of data.bundleQuestions) {
    await prisma.bundleQuestion.upsert({
      where: {
        bundleId_questionId: {
          bundleId: bq.bundleId,
          questionId: bq.questionId,
        },
      },
      update: {},
      create: {
        bundleId: bq.bundleId,
        questionId: bq.questionId,
      },
    });
  }

  // 9. Purchases
  if (data.purchases && data.purchases.length > 0) {
    console.log(`Importing ${data.purchases.length} purchases...`);
    for (const p of data.purchases) {
      await prisma.purchase.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          userId: p.userId,
          bundleId: p.bundleId,
          amount: p.amount,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          status: p.status,
          purchasedAt: new Date(p.purchasedAt),
        },
      });
    }
  }

  // 10. Attempts & AttemptAnswers
  if (data.attempts && data.attempts.length > 0) {
    console.log(`Importing ${data.attempts.length} attempts...`);
    for (const a of data.attempts) {
      await prisma.attempt.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          userId: a.userId,
          bundleId: a.bundleId,
          mode: a.mode,
          score: a.score,
          totalQuestions: a.totalQuestions,
          correct: a.correct,
          incorrect: a.incorrect,
          unanswered: a.unanswered,
          accuracy: a.accuracy,
          timeTakenSec: a.timeTakenSec,
          completedAt: new Date(a.completedAt),
        },
      });
    }
  }

  if (data.attemptAnswers && data.attemptAnswers.length > 0) {
    console.log(`Importing ${data.attemptAnswers.length} attempt answers...`);
    for (const aa of data.attemptAnswers) {
      await prisma.attemptAnswer.upsert({
        where: { id: aa.id },
        update: {},
        create: {
          id: aa.id,
          attemptId: aa.attemptId,
          questionId: aa.questionId,
          selectedAnswer: aa.selectedAnswer,
          isCorrect: aa.isCorrect,
          answeredAt: new Date(aa.answeredAt),
        },
      });
    }
  }

  console.log('✓ ALL DATA IMPORTED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
