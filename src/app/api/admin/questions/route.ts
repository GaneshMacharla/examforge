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
      questionText,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      difficulty,
      tags,
    } = body;

    if (!subjectId || !topicId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: 'All question fields including options, answer, and explanation are required.' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        subjectId,
        topicId,
        questionText: questionText.trim(),
        imageUrl: imageUrl?.trim() || null,
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: correctAnswer.toUpperCase().trim(),
        explanation: explanation.trim(),
        difficulty: difficulty || 'Medium',
        tags: tags?.trim() || null,
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
