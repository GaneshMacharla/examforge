'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lock,
  ChevronRight,
} from 'lucide-react';
import RazorpayModal from '@/components/RazorpayModal';

interface BundleDetail {
  id: string;
  name: string;
  description: string;
  subjectName?: string;
  difficulty: string;
  price: number;
  thumbnail?: string;
  exam: { id: string; name: string; code: string };
  questionCount: number;
  salesCount: number;
  isPurchased: boolean;
  topicDistribution: Array<{ name: string; count: number }>;
  previewQuestions: Array<{
    index: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    difficulty: string;
    topic: string;
    correctAnswer?: string;
    explanation?: string;
  }>;
}

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params.id as string;

  const [bundle, setBundle] = useState<BundleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchBundle = async () => {
    try {
      const res = await fetch(`/api/bundles/${bundleId}`);
      const data = await res.json();
      if (data.bundle) {
        setBundle(data.bundle);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (bundleId) {
      fetchBundle();
      fetchUser();
    }
  }, [bundleId]);

  const handleBuyClick = () => {
    if (!currentUser) {
      router.push(`/login?redirect=/bundles/${bundleId}`);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (unlockedBundleId: string) => {
    setIsCheckoutOpen(false);
    if (bundle) {
      setBundle({ ...bundle, isPurchased: true });
    }
    router.push(`/practice/${unlockedBundleId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Bundle Not Found</h2>
        <Link href="/bundles" className="text-sm font-semibold text-indigo-600 hover:underline">
          Return to All Bundles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/bundles" className="hover:text-indigo-600">
          Bundles
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{bundle.exam.name}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600 truncate max-w-xs">{bundle.name}</span>
      </div>

      {/* Main Bundle Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                {bundle.exam.name}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                {bundle.subjectName || 'General'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  bundle.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : bundle.difficulty === 'Hard'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {bundle.difficulty} Difficulty
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {bundle.name}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">{bundle.description}</p>
          </div>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Questions</div>
              <div className="text-2xl font-black text-indigo-600">{bundle.questionCount} Questions</div>
              <div className="text-[11px] text-slate-500">With verified answers</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Modes Included</div>
              <div className="text-lg font-bold text-slate-900">Practice + Test</div>
              <div className="text-[11px] text-slate-500">Immediate explanation & Timer</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Access Validity</div>
              <div className="text-lg font-bold text-emerald-600">Lifetime Access</div>
              <div className="text-[11px] text-slate-500">No monthly renewal fees</div>
            </div>
          </div>

          {/* Topic Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Syllabus & Topic Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              This bundle is balanced with questions distributed across core topics:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bundle.topicDistribution.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                >
                  <span className="font-medium text-slate-800">{t.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {t.count} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Purchase Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-20 space-y-6">
            {/* Thumbnail */}
            <div className="h-44 rounded-xl bg-slate-100 overflow-hidden relative">
              {bundle.thumbnail ? (
                <img
                  src={bundle.thumbnail}
                  alt={bundle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-800 flex items-center justify-center text-white">
                  <BookOpen className="w-12 h-12 opacity-50" />
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bundle Price
                </span>
                <div className="text-3xl font-black text-slate-900">₹{bundle.price}</div>
              </div>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                One-time Payment
              </span>
            </div>

            {/* Action Button */}
            {bundle.isPurchased ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You already own this question bundle!</span>
                </div>
                <Link
                  href={`/practice/${bundle.id}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Start Practicing Now</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleBuyClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buy Now — ₹{bundle.price}</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Razorpay Checkout • Instant Access</span>
                </div>
              </div>
            )}

            {/* Inclusions checklist */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Instant unlock of all {bundle.questionCount} practice questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Full step-by-step solutions and explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Timed mock test engine with scoring & analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Retake as many times as you like</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Preview Questions Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Free Sample
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Preview Questions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review actual sample questions from this bundle before purchasing.
          </p>
        </div>

        <div className="space-y-6">
          {bundle.previewQuestions.map((q) => (
            <div key={q.index} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">Question {q.index}</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {q.topic}
                </span>
              </div>

              <div className="text-base font-semibold text-slate-900">{q.questionText}</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800">
                  <span className="font-bold text-indigo-600 mr-2">A.</span> {q.optionA}
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800">
                  <span className="font-bold text-indigo-600 mr-2">B.</span> {q.optionB}
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800">
                  <span className="font-bold text-indigo-600 mr-2">C.</span> {q.optionC}
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800">
                  <span className="font-bold text-indigo-600 mr-2">D.</span> {q.optionD}
                </div>
              </div>

              {bundle.isPurchased ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-800">
                    Correct Answer: Option {q.correctAnswer}
                  </div>
                  <div className="text-slate-700">{q.explanation}</div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Correct answer & complete solution unlocked upon purchase</span>
                  </div>
                  <button
                    onClick={handleBuyClick}
                    className="font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Unlock for ₹{bundle.price} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {isCheckoutOpen && (
        <RazorpayModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          bundle={{
            id: bundle.id,
            name: bundle.name,
            price: bundle.price,
            questionCount: bundle.questionCount,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
