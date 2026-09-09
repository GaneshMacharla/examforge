'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Target,
  Award,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BarChart3,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Skeleton, StatCardSkeleton, TableSkeleton } from '@/components/Skeleton';

interface StudentDashboardData {
  user: { id: string; name: string; email: string; targetExam: string };
  devices?: Array<{ id: string; deviceName: string; lastActiveAt: string }>;
  stats: {
    totalPurchases: number;
    questionsAttempted: number;
    totalCorrect: number;
    accuracy: number;
    totalTestsTaken: number;
  };
  myBundles: Array<{
    id: string;
    name: string;
    examName: string;
    subjectName?: string;
    difficulty: string;
    thumbnail?: string;
    totalQuestions: number;
    progress: number;
    latestAttemptScore: string | null;
  }>;
  recentAttempts: Array<{
    id: string;
    bundleId: string;
    bundleName: string;
    mode: string;
    score: number;
    totalQuestions: number;
    accuracy: number;
    timeTakenSec: number;
    completedAt: string;
  }>;
  recommendedBundles: Array<{
    id: string;
    name: string;
    examName: string;
    subjectName?: string;
    difficulty: string;
    price: number;
    thumbnail?: string;
    questionCount: number;
  }>;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login?redirect=/student/dashboard');
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData && !resData.error) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
        {/* Welcome Banner Skeleton */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 space-y-3 shadow-xl">
          <Skeleton className="h-5 w-40 rounded-full animate-shimmer-dark" />
          <Skeleton className="h-8 w-64 rounded-lg animate-shimmer-dark" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md animate-shimmer-dark" />
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Recent Attempts Table Skeleton */}
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* 1. WELCOME BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Target className="w-3.5 h-3.5" />
            <span>Target Exam: {data.user.targetExam || 'Competitive Exams'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {data.user.name} 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            You are making steady progress! Review your practice stats or jump straight into your unlocked question sets below.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/80 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Device Protection: {data.devices?.length || 1} / 2 Devices Bound
            </span>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link
            href="/bundles"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse More Bundles</span>
          </Link>
        </div>
      </div>

      {/* 2. PERFORMANCE METRICS */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Your Performance Overview</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Questions Attempted</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{data.stats.questionsAttempted}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Across all sessions</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Correct Answers</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">{data.stats.totalCorrect}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">Verified solutions</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Overall Accuracy</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600">{data.stats.accuracy}%</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Target: &gt; 80%</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Unlocked Bundles</span>
            <div className="text-xl sm:text-2xl font-black text-purple-600">{data.myBundles.length}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Lifetime access</div>
          </div>
        </div>
      </div>

      {/* 3. MY BUNDLES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>My Purchased Bundles</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {data.myBundles.length} active {data.myBundles.length === 1 ? 'bundle' : 'bundles'}
          </span>
        </div>

        {data.myBundles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800">No Bundles Purchased Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t purchased any question sets yet. Explore our affordable bundles starting at just ₹39.
            </p>
            <Link
              href="/bundles"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs"
            >
              <span>Explore Bundles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.myBundles.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {b.thumbnail ? (
                      <img src={b.thumbnail} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-900 flex items-center justify-center text-white">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {b.examName}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{b.name}</h3>
                    <div className="text-xs text-slate-500">{b.totalQuestions} Questions</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Practice Completion</span>
                    <span className="text-indigo-600 font-bold">{b.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {b.latestAttemptScore ? `Last Score: ${b.latestAttemptScore}` : 'Not attempted yet'}
                  </span>
                  <Link
                    href={`/practice/${b.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Continue Practice</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. RECENT ATTEMPTS & RESULTS */}
      {data.recentAttempts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Recent Test Attempts</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {data.recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">{att.bundleName}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-1.5 py-0.2 rounded">
                        {att.mode} MODE
                      </span>
                      <span>
                        Completed: {new Date(att.completedAt).toLocaleDateString()}
                      </span>
                      <span>Time: {Math.floor(att.timeTakenSec / 60)}m {att.timeTakenSec % 60}s</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-slate-900">
                        {att.score} / {att.totalQuestions}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-emerald-600">{att.accuracy}% Accuracy</div>
                    </div>
                    <Link
                      href={`/practice/${att.bundleId}/results/${att.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 text-xs font-semibold transition-colors shrink-0"
                    >
                      View Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. RECOMMENDED BUNDLES */}
      {data.recommendedBundles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Recommended Practice Bundles</span>
            </h2>
            <Link href="/bundles" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Bundles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.recommendedBundles.map((rb) => (
              <div
                key={rb.id}
                className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between space-y-3 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {rb.examName}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{rb.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">{rb.questionCount} Questions</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">₹{rb.price}</span>
                  <Link
                    href={`/bundles/${rb.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
