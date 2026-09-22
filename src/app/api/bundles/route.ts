import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getFilteredMockBundles } from '@/lib/mockData';
import { ensureDefaultBundles } from '@/lib/seedBundles';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examCode = searchParams.get('exam');
  const difficulty = searchParams.get('difficulty');
  const search = searchParams.get('search');

  try {
    const currentUser = await getCurrentUser();
    await ensureDefaultBundles();

    // Query builder
    const where: any = {
      status: 'PUBLISHED',
    };

    if (examCode && examCode !== 'ALL') {
      where.exam = { code: examCode };
    }

    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { subjectName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const bundles = await prisma.bundle.findMany({
      where,
      include: {
        exam: {
          select: { id: true, name: true, code: true, icon: true },
        },
        _count: {
          select: {
            questions: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let purchasedBundleIds = new Set<string>();
    if (currentUser) {
      try {
        const userPurchases = await prisma.purchase.findMany({
          where: {
            userId: currentUser.id,
            status: 'PAID',
          },
          select: { bundleId: true },
        });
        purchasedBundleIds = new Set(userPurchases.map((p) => p.bundleId));
      } catch {
        // ignore purchase lookup error if DB has issues
      }
    }

    const formattedBundles = bundles.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      subjectName: b.subjectName,
      difficulty: b.difficulty,
      price: b.price,
      thumbnail: b.thumbnail,
      status: b.status,
      exam: b.exam,
      questionCount: b._count.questions,
      salesCount: b._count.purchases,
      isPurchased: purchasedBundleIds.has(b.id),
    }));

    return NextResponse.json({ bundles: formattedBundles });
  } catch (error: unknown) {
    console.warn('Database unreachable. Serving fallback question bundles:', error);
    const fallbackBundles = getFilteredMockBundles({ exam: examCode, difficulty, search });
    return NextResponse.json({ bundles: fallbackBundles });
  }
}
