import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bundleId } = await params;
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
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          bundleId: bundleId,
          status: 'PAID',
        },
      });
      hasAccess = !!purchase;
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Access Denied. You have not purchased this question bundle.',
          code: 'UNPURCHASED_BUNDLE',
        },
        { status: 403 }
      );
    }

    // Retrieve the bundle and linked questions
    const bundle = await prisma.bundle.findUnique({
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

    if (!bundle) {
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
    console.error('Fetch questions error:', error);
    return NextResponse.json(
      { error: 'Failed to load bundle questions' },
      { status: 500 }
    );
  }
}
