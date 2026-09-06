import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bundleId, mode, answers, timeTakenSec } = await request.json();

    if (!bundleId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }

    // Verify access to the bundle
    const hasPurchase =
      user.role === 'ADMIN' ||
      (await prisma.purchase.findFirst({
        where: { userId: user.id, bundleId, status: 'PAID' },
      }));

    if (!hasPurchase) {
      return NextResponse.json(
        { error: 'Cannot submit test for unpurchased bundle' },
        { status: 403 }
      );
    }

    // Fetch the correct answers from DB
    const questionIds = answers.map((a: any) => a.questionId);
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    const correctMap = new Map(dbQuestions.map((q) => [q.id, q.correctAnswer]));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const evaluatedAnswers: Array<{
      questionId: string;
      selectedAnswer: string | null;
      isCorrect: boolean;
    }> = [];

    for (const ans of answers) {
      const dbCorrectAnswer = correctMap.get(ans.questionId);
      const isAnswered = ans.selectedAnswer && ans.selectedAnswer.trim() !== '';

      if (!isAnswered) {
        unansweredCount++;
        evaluatedAnswers.push({
          questionId: ans.questionId,
          selectedAnswer: null,
          isCorrect: false,
        });
      } else if (ans.selectedAnswer === dbCorrectAnswer) {
        correctCount++;
        evaluatedAnswers.push({
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer,
          isCorrect: true,
        });
      } else {
        incorrectCount++;
        evaluatedAnswers.push({
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer,
          isCorrect: false,
        });
      }
    }

    const totalQuestions = answers.length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100 * 10) / 10
        : 0;

    // Create Attempt record in database
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        bundleId,
        mode: mode || 'TEST',
        score: correctCount,
        totalQuestions,
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        accuracy,
        timeTakenSec: timeTakenSec || 0,
        answers: {
          create: evaluatedAnswers.map((ea) => ({
            questionId: ea.questionId,
            selectedAnswer: ea.selectedAnswer,
            isCorrect: ea.isCorrect,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: correctCount,
      totalQuestions,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      accuracy,
      timeTakenSec: timeTakenSec || 0,
    });
  } catch (error: unknown) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: 'Failed to record test attempt' }, { status: 500 });
  }
}
