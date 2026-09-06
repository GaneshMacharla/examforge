import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [
      totalStudents,
      totalBundles,
      totalQuestions,
      paidPurchases,
      recentPurchases,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.bundle.count(),
      prisma.question.count(),
      prisma.purchase.findMany({
        where: { status: 'PAID' },
        select: { amount: true },
      }),
      prisma.purchase.findMany({
        where: { status: 'PAID' },
        include: {
          user: { select: { name: true, email: true } },
          bundle: { select: { name: true } },
        },
        orderBy: { purchasedAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRevenue = paidPurchases.reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalBundles,
        totalQuestions,
        totalPurchases: paidPurchases.length,
        totalRevenue,
      },
      recentPurchases: recentPurchases.map((p) => ({
        id: p.id,
        studentName: p.user.name,
        studentEmail: p.user.email,
        bundleName: p.bundle.name,
        amount: p.amount,
        status: p.status,
        date: p.purchasedAt,
      })),
    });
  } catch (error: unknown) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin overview' }, { status: 500 });
  }
}
