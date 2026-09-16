import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (error: unknown) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // ── Input validation ──────────────────────────────────────────────────────
    const VALID_ANSWERS    = ['A', 'B', 'C', 'D'] as const;
    const VALID_DIFFICULTY = ['Easy', 'Medium', 'Hard'] as const;

    const questionText  = typeof body.questionText  === 'string' ? body.questionText.trim()  : '';
    const optionA       = typeof body.optionA       === 'string' ? body.optionA.trim()       : '';
    const optionB       = typeof body.optionB       === 'string' ? body.optionB.trim()       : '';
    const optionC       = typeof body.optionC       === 'string' ? body.optionC.trim()       : '';
    const optionD       = typeof body.optionD       === 'string' ? body.optionD.trim()       : '';
    const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer.trim().toUpperCase() : '';
    const explanation   = typeof body.explanation   === 'string' ? body.explanation.trim()   : '';
    const difficulty    = typeof body.difficulty    === 'string' ? body.difficulty.trim()    : '';
    const tags          = typeof body.tags          === 'string' ? body.tags.trim()          : null;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: 'Question text, all four options, correct answer, and explanation are required.' },
        { status: 400 }
      );
    }

    if (!VALID_ANSWERS.includes(correctAnswer as any)) {
      return NextResponse.json(
        { error: `correctAnswer must be one of: ${VALID_ANSWERS.join(', ')}.` },
        { status: 400 }
      );
    }

    if (difficulty && !VALID_DIFFICULTY.includes(difficulty as any)) {
      return NextResponse.json(
        { error: `difficulty must be one of: ${VALID_DIFFICULTY.join(', ')}.` },
        { status: 400 }
      );
    }

    // Max length guards
    if (questionText.length > 2000) return NextResponse.json({ error: 'Question text too long (max 2000 chars).' }, { status: 400 });
    if (explanation.length   > 3000) return NextResponse.json({ error: 'Explanation too long (max 3000 chars).' }, { status: 400 });
    if ([optionA, optionB, optionC, optionD].some(o => o.length > 500)) {
      return NextResponse.json({ error: 'Each option must be 500 characters or fewer.' }, { status: 400 });
    }

    // Verify the question exists (prevents silent no-op on bad IDs)
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation,
        difficulty: difficulty || existing.difficulty,
        tags: tags !== null ? tags : existing.tags,
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: unknown) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
