'use client';

import React, { useState } from 'react';
import { CheckCircle2, CreditCard, ShieldCheck, Smartphone, Building, Loader2, X } from 'lucide-react';
import crypto from 'crypto';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: {
    id: string;
    name: string;
    price: number;
    questionCount?: number;
  };
  onSuccess: (bundleId: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayModal({
  isOpen,
  onClose,
  bundle,
  onSuccess,
}: RazorpayModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');

  if (!isOpen) return null;

  const handleSimulatedPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId: bundle.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not initiate order');
      }

      // If user has real Razorpay script & real key, they can run live
      if (!orderData.isMock && typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ExamForge Practice Hub',
          description: bundle.name,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bundleId: bundle.id,
              }),
            });

            if (verifyRes.ok) {
              onSuccess(bundle.id);
            } else {
              setError('Payment verification failed');
            }
          },
          theme: { color: '#4F46E5' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }

      // Simulated Sandbox payment:
      // Generate authentic mock payment ID and mock signature
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const secret = 'rzp_test_secret_0987654321';
      const mockSignature = `mock_sig_${orderData.orderId}_${mockPaymentId}`;

      // Call verification endpoint
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          bundleId: bundle.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Success!
      onSuccess(bundle.id);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300">
              ₹
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold flex items-center gap-1">
                <span>Razorpay Gateway</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  Sandbox Active
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight text-white">{bundle.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center text-sm">
          <span className="text-slate-600 font-medium">Total Payable Amount</span>
          <span className="text-xl font-black text-slate-900">₹{bundle.price}</span>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-indigo-600" />
                UPI / GPay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-indigo-600" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building className="w-5 h-5 mb-1 text-indigo-600" />
                Net Banking
              </button>
            </div>
          </div>

          {/* Form details based on tab */}
          {paymentMethod === 'upi' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Virtual Payment Address (VPA)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="name@okaxis"
              />
              <p className="text-[11px] text-slate-400">Supported: Google Pay, PhonePe, Paytm, BHIM</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">CVV</label>
                  <input
                    type="password"
                    defaultValue="888"
                    maxLength={4}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Select Bank</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
              </select>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              256-Bit SSL Encryption
            </span>
            <span className="text-indigo-600 font-semibold">Instant Question Unlock</span>
          </div>

          <button
            onClick={handleSimulatedPayment}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Signature & Unlocking...
              </>
            ) : (
              <>
                <span>Pay ₹{bundle.price} & Unlock Questions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
