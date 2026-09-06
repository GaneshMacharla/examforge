import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subjects: {
          include: {
            topics: true,
          },
        },
        _count: {
          select: {
            bundles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ exams });
  } catch (error: unknown) {
    console.error('Fetch exams error:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
