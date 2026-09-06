import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const exams = await prisma.exam.findMany({
      include: {
        subjects: {
          include: {
            topics: {
              include: {
                _count: { select: { questions: true } },
              },
            },
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ exams });
  } catch (error: unknown) {
    console.error('Fetch curriculum error:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { type, name, code, description, examId, subjectId } = await request.json();

    if (type === 'exam') {
      if (!name || !code) return NextResponse.json({ error: 'Exam name and code required' }, { status: 400 });
      const exam = await prisma.exam.create({
        data: { name: name.trim(), code: code.trim().toUpperCase(), description },
      });
      return NextResponse.json({ success: true, exam });
    }

    if (type === 'subject') {
      if (!name || !examId) return NextResponse.json({ error: 'Subject name and exam required' }, { status: 400 });
      const subject = await prisma.subject.create({
        data: { name: name.trim(), examId, description },
      });
      return NextResponse.json({ success: true, subject });
    }

    if (type === 'topic') {
      if (!name || !subjectId) return NextResponse.json({ error: 'Topic name and subject required' }, { status: 400 });
      const topic = await prisma.topic.create({
        data: { name: name.trim(), subjectId },
      });
      return NextResponse.json({ success: true, topic });
    }

    return NextResponse.json({ error: 'Invalid curriculum type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Create curriculum item error:', error);
    return NextResponse.json({ error: 'Failed to create curriculum item' }, { status: 500 });
  }
}
