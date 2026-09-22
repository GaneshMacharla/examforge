import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const exams = await prisma.exam.findMany({
      include: {
        subjects: {
          include: {
            _count: { select: { questions: true } },
          },
        },
        _count: {
          select: {
            bundles: true,
            questions: true,
            subjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ exams });
  } catch (error: unknown) {
    console.error('Fetch admin exams error:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Exam name is required' }, { status: 400 });
    }

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Exam code is required (e.g. UPSC, GATE, NEET)' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    // Check uniqueness
    const existingCode = await prisma.exam.findUnique({
      where: { code: formattedCode },
    });
    if (existingCode) {
      return NextResponse.json(
        { error: `An exam with code "${formattedCode}" already exists (${existingCode.name})` },
        { status: 400 }
      );
    }

    const existingName = await prisma.exam.findUnique({
      where: { name: trimmedName },
    });
    if (existingName) {
      return NextResponse.json(
        { error: `An exam with name "${trimmedName}" already exists` },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        name: trimmedName,
        code: formattedCode,
        description: description?.trim() || null,
        icon: icon?.trim() || 'GraduationCap',
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: unknown) {
    console.error('Create exam error:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
