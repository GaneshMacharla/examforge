import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bundles = await prisma.bundle.findMany({
      include: {
        exam: true,
        _count: {
          select: {
            questions: true,
            purchases: { where: { status: 'PAID' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bundles.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      exam: b.exam,
      subjectName: b.subjectName,
      difficulty: b.difficulty,
      price: b.price,
      status: b.status,
      thumbnail: b.thumbnail,
      questionCount: b._count.questions,
      salesCount: b._count.purchases,
      totalRevenue: b._count.purchases * b.price,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ bundles: formatted });
  } catch (error: unknown) {
    console.error('Fetch admin bundles error:', error);
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
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
      name,
      description,
      examId,
      subjectName,
      difficulty,
      price,
      thumbnail,
      status,
      questionIds,
    } = body;

    if (!name || !description || !examId || price === undefined) {
      return NextResponse.json(
        { error: 'Name, description, exam, and price are required' },
        { status: 400 }
      );
    }

    const bundle = await prisma.bundle.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        examId,
        subjectName: subjectName?.trim() || null,
        difficulty: difficulty || 'Mixed',
        price: parseInt(price, 10),
        thumbnail: thumbnail?.trim() || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
        status: status || 'PUBLISHED',
      },
    });

    // Link questions if provided
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      for (const qId of questionIds) {
        await prisma.bundleQuestion.create({
          data: {
            bundleId: bundle.id,
            questionId: qId,
          },
        });
      }
    }

    return NextResponse.json({ success: true, bundle });
  } catch (error: unknown) {
    console.error('Create bundle error:', error);
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
  }
}
