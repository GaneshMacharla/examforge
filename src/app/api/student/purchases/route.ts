import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        bundle: {
          include: {
            exam: true,
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const formatted = purchases.map((p) => ({
      id: p.id,
      bundleId: p.bundle.id,
      bundleName: p.bundle.name,
      examName: p.bundle.exam.name,
      amount: p.amount,
      status: p.status,
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      purchasedAt: p.purchasedAt,
      questionCount: p.bundle._count.questions,
    }));

    return NextResponse.json({ purchases: formatted });
  } catch (error: unknown) {
    console.error('Fetch student purchases error:', error);
    return NextResponse.json(
      { error: 'Failed to load purchases' },
      { status: 500 }
    );
  }
}
