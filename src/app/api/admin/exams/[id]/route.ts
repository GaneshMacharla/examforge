import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
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
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: unknown) {
    console.error('Fetch exam error:', error);
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
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
    const { name, code, description, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Exam name is required' }, { status: 400 });
    }

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Exam code is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    // Check uniqueness conflicts with OTHER exams
    const existingCode = await prisma.exam.findFirst({
      where: {
        code: formattedCode,
        NOT: { id },
      },
    });
    if (existingCode) {
      return NextResponse.json(
        { error: `Another exam with code "${formattedCode}" already exists` },
        { status: 400 }
      );
    }

    const existingName = await prisma.exam.findFirst({
      where: {
        name: trimmedName,
        NOT: { id },
      },
    });
    if (existingName) {
      return NextResponse.json(
        { error: `Another exam with name "${trimmedName}" already exists` },
        { status: 400 }
      );
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        name: trimmedName,
        code: formattedCode,
        description: description?.trim() || null,
        icon: icon?.trim() || 'GraduationCap',
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error: unknown) {
    console.error('Update exam error:', error);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

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

    // Check if exam has bundles or questions
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bundles: true,
            questions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam._count.bundles > 0 || exam._count.questions > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete exam "${exam.name}" because it still has ${exam._count.bundles} bundle(s) and ${exam._count.questions} question(s) associated with it. Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete exam error:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
