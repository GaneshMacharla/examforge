import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user's purchases
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id, status: 'PAID' },
      include: {
        bundle: {
          include: {
            exam: true,
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const purchasedBundleIds = purchases.map((p) => p.bundleId);

    // 2. Fetch attempts
    const attempts = await prisma.attempt.findMany({
      where: { userId: user.id },
      include: {
        bundle: {
          select: { name: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // 3. Aggregate stats
    let totalQuestionsAttempted = 0;
    let totalCorrect = 0;
    attempts.forEach((a) => {
      totalQuestionsAttempted += (a.correct + a.incorrect);
      totalCorrect += a.correct;
    });

    const overallAccuracy =
      totalQuestionsAttempted > 0
        ? Math.round((totalCorrect / totalQuestionsAttempted) * 100 * 10) / 10
        : 0;

    // 4. Calculate progress for each purchased bundle
    const myBundles = purchases.map((p) => {
      const bundleAttempts = attempts.filter((a) => a.bundleId === p.bundleId);
      const totalQ = p.bundle._count.questions;
      const latestAttempt = bundleAttempts[0];
      const questionsAttemptedInLatest = latestAttempt
        ? latestAttempt.correct + latestAttempt.incorrect
        : 0;
      const progressPercent =
        totalQ > 0 ? Math.min(100, Math.round((questionsAttemptedInLatest / totalQ) * 100)) : 0;

      return {
        id: p.bundle.id,
        name: p.bundle.name,
        examName: p.bundle.exam.name,
        subjectName: p.bundle.subjectName,
        difficulty: p.bundle.difficulty,
        thumbnail: p.bundle.thumbnail,
        totalQuestions: totalQ,
        progress: progressPercent,
        purchasedAt: p.purchasedAt,
        latestAttemptScore: latestAttempt ? `${latestAttempt.score}/${latestAttempt.totalQuestions}` : null,
      };
    });

    // 5. Recommended bundles (unpurchased)
    const recommendedBundles = await prisma.bundle.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: purchasedBundleIds },
      },
      include: {
        exam: true,
        _count: { select: { questions: true } },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    // 6. Registered devices
    const devices = await prisma.userDevice.findMany({
      where: { userId: user.id },
      orderBy: { lastActiveAt: 'desc' },
      select: { id: true, deviceName: true, lastActiveAt: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetExam: user.targetExam,
      },
      devices,
      stats: {
        totalPurchases: purchases.length,
        questionsAttempted: totalQuestionsAttempted,
        totalCorrect,
        accuracy: overallAccuracy,
        totalTestsTaken: attempts.length,
      },
      myBundles,
      recentAttempts: attempts.slice(0, 5).map((a) => ({
        id: a.id,
        bundleId: a.bundleId,
        bundleName: a.bundle.name,
        mode: a.mode,
        score: a.score,
        totalQuestions: a.totalQuestions,
        accuracy: a.accuracy,
        timeTakenSec: a.timeTakenSec,
        completedAt: a.completedAt,
      })),
      recommendedBundles: recommendedBundles.map((rb) => ({
        id: rb.id,
        name: rb.name,
        examName: rb.exam.name,
        subjectName: rb.subjectName,
        difficulty: rb.difficulty,
        price: rb.price,
        thumbnail: rb.thumbnail,
        questionCount: rb._count.questions,
      })),
    });
  } catch (error: unknown) {
    console.error('Fetch student dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load student dashboard' },
      { status: 500 }
    );
  }
}
