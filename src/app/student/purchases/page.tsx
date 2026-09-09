'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { PurchasedBundleSkeleton } from '@/components/Skeleton';

interface Purchase {
  id: string;
  bundleId: string;
  bundleName: string;
  examName: string;
  amount: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  purchasedAt: string;
  questionCount: number;
}

export default function StudentPurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/purchases')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login?redirect=/student/purchases');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.purchases) {
          setPurchases(data.purchases);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Account Billing
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Purchased Bundles</h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Review your lifetime unlocked practice sets and payment transaction receipts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <PurchasedBundleSkeleton key={i} />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800">No Purchases Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t purchased any practice question bundles yet.
          </p>
          <Link
            href="/bundles"
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs"
          >
            <span>Browse Bundles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {purchases.map((p) => (
            <div
              key={p.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {p.examName}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    PAID
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{p.bundleName}</h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span>Questions: {p.questionCount}</span>
                  <span>Purchased: {new Date(p.purchasedAt).toLocaleDateString()}</span>
                  {p.razorpayPaymentId && (
                    <span className="font-mono text-[11px] text-slate-400">
                      Payment ID: {p.razorpayPaymentId}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-xl font-black text-slate-900">₹{p.amount}</div>
                <Link
                  href={`/practice/${p.bundleId}`}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all min-h-[38px]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Practice</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
