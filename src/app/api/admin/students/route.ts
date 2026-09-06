import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        _count: {
          select: {
            purchases: { where: { status: 'PAID' } },
            attempts: true,
            devices: true,
          },
        },
        purchases: {
          where: { status: 'PAID' },
          include: { bundle: { select: { name: true, price: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      targetExam: s.targetExam,
      createdAt: s.createdAt,
      totalPurchases: s._count.purchases,
      totalTests: s._count.attempts,
      devicesCount: s._count.devices,
      purchasedBundles: s.purchases.map((p) => p.bundle.name),
      totalSpent: s.purchases.reduce((sum, p) => sum + p.bundle.price, 0),
    }));

    return NextResponse.json({ students: formatted });
  } catch (error: unknown) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
