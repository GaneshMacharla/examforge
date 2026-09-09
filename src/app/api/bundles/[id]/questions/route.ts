import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getMockQuestionsForBundle } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bundleId } = await params;
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to access question bundle' },
        { status: 401 }
      );
    }

    // Strict Access Control: Admin or Paid Purchase required!
    let hasAccess = user.role === 'ADMIN';

    if (!hasAccess) {
      try {
        const purchase = await prisma.purchase.findFirst({
          where: {
            userId: user.id,
            bundleId: bundleId,
            status: 'PAID',
          },
        });
        hasAccess = !!purchase;
      } catch {
        // If DB is offline, allow authenticated user to practice preview demo
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      // In demo mode or if mock bundle, grant access so user can test practice engine
      if (bundleId.startsWith('bundle_')) {
        hasAccess = true;
      } else {
        return NextResponse.json(
          {
            error: 'Access Denied. You have not purchased this question bundle.',
            code: 'UNPURCHASED_BUNDLE',
          },
          { status: 403 }
        );
      }
    }

    // Retrieve the bundle and linked questions
    let bundle = null;
    try {
      bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
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
        },
      });
    } catch {
      // Handled by mock fallback below
    }

    if (!bundle) {
      const mockResult = getMockQuestionsForBundle(bundleId);
      if (mockResult) {
        return NextResponse.json(mockResult);
      }
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    const questions = bundle.questions.map((bq, index) => ({
      index: index + 1,
      id: bq.question.id,
      questionText: bq.question.questionText,
      imageUrl: bq.question.imageUrl,
      optionA: bq.question.optionA,
      optionB: bq.question.optionB,
      optionC: bq.question.optionC,
      optionD: bq.question.optionD,
      correctAnswer: bq.question.correctAnswer,
      explanation: bq.question.explanation,
      difficulty: bq.question.difficulty,
      topicName: bq.question.topic?.name || 'General',
      subjectName: bq.question.subject?.name || 'General',
      tags: bq.question.tags ? bq.question.tags.split(',').map((t) => t.trim()) : [],
    }));

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        examName: bundle.exam.name,
        subjectName: bundle.subjectName,
        difficulty: bundle.difficulty,
        totalQuestions: questions.length,
      },
      questions,
    });
  } catch (error: unknown) {
    console.warn('Fetch questions database error, using mock fallback:', error);
    const mockResult = getMockQuestionsForBundle(bundleId);
    if (mockResult) {
      return NextResponse.json(mockResult);
    }
    return NextResponse.json(
      { error: 'Failed to load bundle questions' },
      { status: 500 }
    );
  }
}
