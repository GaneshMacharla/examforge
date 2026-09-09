import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getMockBundleDetail } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const currentUser = await getCurrentUser();

    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        exam: true,
        questions: {
          include: {
            question: {
              include: {
                topic: true,
                subject: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            purchases: true,
          },
        },
      },
    });

    if (!bundle) {
      const fallback = getMockBundleDetail(id, currentUser?.role === 'ADMIN');
      if (fallback) {
        return NextResponse.json({ bundle: fallback });
      }
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    let isPurchased = false;
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        isPurchased = true;
      } else {
        const purchase = await prisma.purchase.findFirst({
          where: {
            userId: currentUser.id,
            bundleId: bundle.id,
            status: 'PAID',
          },
        });
        isPurchased = !!purchase;
      }
    }

    // Extract topics covered
    const topicsMap = new Map<string, number>();
    bundle.questions.forEach((bq) => {
      const topicName = bq.question.topic?.name || 'General';
      topicsMap.set(topicName, (topicsMap.get(topicName) || 0) + 1);
    });

    const topicDistribution = Array.from(topicsMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Free sample previews: first 2 questions (without exposing correct answers if not purchased)
    const previewQuestions = bundle.questions.slice(0, 2).map((bq, idx) => ({
      index: idx + 1,
      questionText: bq.question.questionText,
      optionA: bq.question.optionA,
      optionB: bq.question.optionB,
      optionC: bq.question.optionC,
      optionD: bq.question.optionD,
      difficulty: bq.question.difficulty,
      topic: bq.question.topic.name,
      // If user owns it, show answers, otherwise hide
      correctAnswer: isPurchased ? bq.question.correctAnswer : undefined,
      explanation: isPurchased ? bq.question.explanation : 'Buy bundle to unlock detailed solution and all questions.',
    }));

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        exam: bundle.exam,
        subjectName: bundle.subjectName,
        difficulty: bundle.difficulty,
        price: bundle.price,
        thumbnail: bundle.thumbnail,
        status: bundle.status,
        questionCount: bundle._count.questions,
        salesCount: bundle._count.purchases,
        isPurchased,
        topicDistribution,
        previewQuestions,
      },
    });
  } catch (error: unknown) {
    console.warn('Fetch bundle detail database error, using mock fallback:', error);
    const fallback = getMockBundleDetail(id);
    if (fallback) {
      return NextResponse.json({ bundle: fallback });
    }
    return NextResponse.json({ error: 'Failed to fetch bundle detail' }, { status: 500 });
  }
}
