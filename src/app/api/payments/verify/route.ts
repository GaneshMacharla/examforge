import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bundleId,
    } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bundleId) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // Cryptographic signature check
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      console.warn(`Payment signature verification failed for user ${user.id}, order ${razorpayOrderId}`);
      return NextResponse.json(
        { error: 'Invalid payment signature. Access denied.' },
        { status: 400 }
      );
    }

    // Find the purchase record or create a paid one
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        bundleId: bundleId,
        razorpayOrderId: razorpayOrderId,
      },
    });

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'PAID',
          razorpayPaymentId,
        },
      });
    } else {
      // Fallback in case created order record wasn't found
      const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
      if (!bundle) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
      }
      await prisma.purchase.create({
        data: {
          userId: user.id,
          bundleId: bundle.id,
          amount: bundle.price,
          razorpayOrderId,
          razorpayPaymentId,
          status: 'PAID',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Bundle unlocked.',
      bundleId,
    });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
