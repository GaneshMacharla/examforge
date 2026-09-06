import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createRazorpayOrder, RAZORPAY_KEY_ID, isMockRazorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase a bundle' },
        { status: 401 }
      );
    }

    const { bundleId } = await request.json();
    if (!bundleId) {
      return NextResponse.json({ error: 'Bundle ID is required' }, { status: 400 });
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        bundleId: bundle.id,
        status: 'PAID',
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this bundle', alreadyOwned: true },
        { status: 400 }
      );
    }

    // Create Razorpay Order
    const receipt = `rcpt_${user.id.slice(-4)}_${Date.now()}`;
    const order = await createRazorpayOrder(bundle.price, receipt);

    // Save pending purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        bundleId: bundle.id,
        amount: bundle.price,
        razorpayOrderId: order.id,
        status: 'CREATED',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: bundle.price * 100, // in paise
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      bundle: {
        id: bundle.id,
        name: bundle.name,
        price: bundle.price,
      },
      purchaseId: purchase.id,
      isMock: isMockRazorpay(),
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate order. Please try again.' },
      { status: 500 }
    );
  }
}
