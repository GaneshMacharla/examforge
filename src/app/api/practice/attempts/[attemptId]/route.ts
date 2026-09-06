import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        bundle: {
          include: { exam: true },
        },
        answers: {
          include: {
            question: {
              include: { topic: true, subject: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Must be user's own attempt or admin
    if (attempt.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const questionReviews = attempt.answers.map((ans, idx) => ({
      index: idx + 1,
      questionId: ans.question.id,
      questionText: ans.question.questionText,
      optionA: ans.question.optionA,
      optionB: ans.question.optionB,
      optionC: ans.question.optionC,
      optionD: ans.question.optionD,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.question.correctAnswer,
      isCorrect: ans.isCorrect,
      isUnanswered: !ans.selectedAnswer,
      explanation: ans.question.explanation,
      topic: ans.question.topic?.name || 'General',
      difficulty: ans.question.difficulty,
    }));

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        bundleId: attempt.bundleId,
        bundleName: attempt.bundle.name,
        examName: attempt.bundle.exam.name,
        mode: attempt.mode,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        unanswered: attempt.unanswered,
        accuracy: attempt.accuracy,
        timeTakenSec: attempt.timeTakenSec,
        completedAt: attempt.completedAt,
        questionReviews,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch attempt error:', error);
    return NextResponse.json({ error: 'Failed to fetch attempt details' }, { status: 500 });
  }
}
