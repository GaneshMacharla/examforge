import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orders = await prisma.purchase.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        bundle: { select: { id: true, name: true, price: true } },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderCode: `ORD-${o.id.slice(-6).toUpperCase()}`,
      studentName: o.user.name,
      studentEmail: o.user.email,
      studentMobile: o.user.mobile,
      bundleName: o.bundle.name,
      bundleId: o.bundle.id,
      amount: o.amount,
      status: o.status,
      razorpayOrderId: o.razorpayOrderId,
      razorpayPaymentId: o.razorpayPaymentId,
      date: o.purchasedAt,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error: unknown) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
