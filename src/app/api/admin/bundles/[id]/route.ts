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
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        exam: true,
        questions: {
          include: {
            question: {
              include: { topic: true, subject: true },
            },
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    return NextResponse.json({
      bundle: {
        ...bundle,
        questionIds: bundle.questions.map((bq) => bq.questionId),
      },
    });
  } catch (error: unknown) {
    console.error('Fetch bundle error:', error);
    return NextResponse.json({ error: 'Failed to fetch bundle' }, { status: 500 });
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
    const {
      name,
      description,
      examId,
      subjectName,
      difficulty,
      price,
      status,
      thumbnail,
      questionIds,
    } = body;

    const updated = await prisma.bundle.update({
      where: { id },
      data: {
        name,
        description,
        examId,
        subjectName,
        difficulty,
        price: parseInt(price, 10),
        status,
        thumbnail,
      },
    });

    if (questionIds && Array.isArray(questionIds)) {
      // Re-link questions
      await prisma.bundleQuestion.deleteMany({ where: { bundleId: id } });
      for (const qId of questionIds) {
        await prisma.bundleQuestion.create({
          data: {
            bundleId: id,
            questionId: qId,
          },
        });
      }
    }

    return NextResponse.json({ success: true, bundle: updated });
  } catch (error: unknown) {
    console.error('Update bundle error:', error);
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 });
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
    await prisma.bundle.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Bundle deleted' });
  } catch (error: unknown) {
    console.error('Delete bundle error:', error);
    return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 });
  }
}
