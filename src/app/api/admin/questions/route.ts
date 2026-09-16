import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const where: any = {};
    if (subjectId && subjectId !== 'ALL') where.subjectId = subjectId;
    if (topicId && topicId !== 'ALL') where.topicId = topicId;
    if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty;
    if (search && search.trim()) {
      where.OR = [
        { questionText: { contains: search.trim() } },
        { explanation: { contains: search.trim() } },
        { tags: { contains: search.trim() } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: {
          include: { exam: true },
        },
        topic: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Fetch questions error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      subjectId,
      topicId,
      imageUrl,
    } = body;

    // ── Trim and coerce all text fields ──────────────────────────────────────
    const questionText  = typeof body.questionText  === 'string' ? body.questionText.trim()  : '';
    const optionA       = typeof body.optionA       === 'string' ? body.optionA.trim()       : '';
    const optionB       = typeof body.optionB       === 'string' ? body.optionB.trim()       : '';
    const optionC       = typeof body.optionC       === 'string' ? body.optionC.trim()       : '';
    const optionD       = typeof body.optionD       === 'string' ? body.optionD.trim()       : '';
    const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer.trim().toUpperCase() : '';
    const explanation   = typeof body.explanation   === 'string' ? body.explanation.trim()   : '';
    const difficulty    = typeof body.difficulty    === 'string' ? body.difficulty.trim()    : 'Medium';
    const tags          = typeof body.tags          === 'string' ? body.tags.trim()          : null;

    const VALID_ANSWERS    = ['A', 'B', 'C', 'D'] as const;
    const VALID_DIFFICULTY = ['Easy', 'Medium', 'Hard'] as const;

    // ── Required field check ──────────────────────────────────────────────────
    if (!subjectId || !topicId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: 'All question fields including options, answer, and explanation are required.' },
        { status: 400 }
      );
    }

    // ── Allowlist validation ──────────────────────────────────────────────────
    if (!VALID_ANSWERS.includes(correctAnswer as any)) {
      return NextResponse.json(
        { error: `correctAnswer must be one of: ${VALID_ANSWERS.join(', ')}.` },
        { status: 400 }
      );
    }

    if (!VALID_DIFFICULTY.includes(difficulty as any)) {
      return NextResponse.json(
        { error: `difficulty must be one of: ${VALID_DIFFICULTY.join(', ')}.` },
        { status: 400 }
      );
    }

    // ── Max length guards ─────────────────────────────────────────────────────
    if (questionText.length > 2000) return NextResponse.json({ error: 'Question text too long (max 2000 chars).' }, { status: 400 });
    if (explanation.length   > 3000) return NextResponse.json({ error: 'Explanation too long (max 3000 chars).' }, { status: 400 });
    if ([optionA, optionB, optionC, optionD].some(o => o.length > 500)) {
      return NextResponse.json({ error: 'Each option must be 500 characters or fewer.' }, { status: 400 });
    }

    // ── Verify subject and topic exist in DB (FK safety) ─────────────────────
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: 'Selected subject does not exist.' }, { status: 400 });
    }

    const topic = await prisma.topic.findFirst({ where: { id: topicId, subjectId } });
    if (!topic) {
      return NextResponse.json({ error: 'Selected topic does not exist or does not belong to the chosen subject.' }, { status: 400 });
    }

    // ── Create ────────────────────────────────────────────────────────────────
    const question = await prisma.question.create({
      data: {
        subjectId,
        topicId,
        questionText,
        imageUrl: imageUrl?.trim() || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation,
        difficulty,
        tags,
      },
      include: {
        subject: { include: { exam: true } },
        topic: true,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error: unknown) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

