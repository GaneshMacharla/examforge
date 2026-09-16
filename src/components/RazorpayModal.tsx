'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Loader2, X, Lock, ArrowRight } from 'lucide-react';
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

      // Check if real Razorpay keys are configured
      if (orderData.isMock) {
        throw new Error(
          'Razorpay API Keys are not configured. Please add your real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file from dashboard.razorpay.com to process payments.'
        );
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK is not loaded. Please refresh the page.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ExamForge Practice Hub',
        description: bundle.name,
        order_id: orderData.orderId,
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
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

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              onSuccess(bundle.id);
            } else {
              setError(verifyData.error || 'Payment verification failed on server.');
            }
          } catch (vErr: any) {
            setError(vErr.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        theme: { color: '#4F46E5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setError(resp.error?.description || 'Payment failed or cancelled.');
        setLoading(false);
      });
      rzp.open();
      return;
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300 shrink-0">
              ₹
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-200 font-semibold flex items-center gap-1.5">
                <span>Razorpay Gateway</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                  Secure Checkout
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg leading-tight text-white truncate">{bundle.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Bar */}
        <div className="bg-slate-50 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200 flex justify-between items-center text-sm shrink-0">
          <span className="text-slate-600 font-medium text-xs sm:text-sm">Total Payable Amount</span>
          <span className="text-lg sm:text-xl font-black text-slate-900">₹{bundle.price}</span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Order Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Practice Bundle</span>
              <span className="font-bold text-slate-900 truncate max-w-[210px] text-right">{bundle.name}</span>
            </div>
            {bundle.questionCount && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Questions Included</span>
                <span className="font-semibold text-slate-800">{bundle.questionCount} Questions</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Payment Gateway</span>
              <span className="font-bold text-indigo-600">Razorpay</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant Unlock
            </span>
          </div>

          <button
            onClick={handleSimulatedPayment}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting to Razorpay...
              </>
            ) : (
              <>
                <span>Pay ₹{bundle.price} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
