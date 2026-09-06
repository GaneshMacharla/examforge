import crypto from 'crypto';

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_1234567890';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_0987654321';

export function isMockRazorpay(): boolean {
  return (
    !process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_mock')
  );
}

export async function createRazorpayOrder(amountInInr: number, receiptId: string) {
  const amountInPaise = amountInInr * 100;

  if (isMockRazorpay()) {
    // Generate simulated order
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      isMock: true,
    };
  }

  // Real Razorpay API call
  const authHeader = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Razorpay Order Creation Failed: ${errText}`);
  }

  const orderData = await response.json();
  return {
    ...orderData,
    isMock: false,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // If in mock mode and signature matches simulated format
  if (isMockRazorpay()) {
    const expectedMockSig = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return signature === expectedMockSig || signature.startsWith('mock_sig_');
  }

  // Real HMAC SHA-256 verification
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}
