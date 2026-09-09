'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { BundleCardSkeleton } from '@/components/Skeleton';

interface Bundle {
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
  isPurchased?: boolean;
}

export default function HomePage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/bundles')
      .then((res) => res.json())
      .then((data) => {
        if (data.bundles) setBundles(data.bundles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const examTabs = [
    { code: 'ALL', label: 'All Exams' },
    { code: 'SSC', label: 'SSC CGL & CHSL' },
    { code: 'BANKING', label: 'Banking & Insurance' },
    { code: 'RRB', label: 'RRB Railways' },
    { code: 'STATE_PSC', label: 'State PSCs' },
  ];

  const filteredBundles =
    selectedExam === 'ALL'
      ? bundles
      : bundles.filter((b) => b.exam?.code === selectedExam);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>India's Most Affordable Exam Practice Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Practice Smarter.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-transparent">
                Score Higher. 🎯
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Affordable question bundles designed for competitive exam preparation. Stop paying for expensive annual passes when you only need high-yield practice sets starting at just <span className="font-bold text-slate-900">₹39</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/bundles"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group hover:gap-3"
              >
                <span>Explore Question Bundles</span>
                <ArrowRight className="w-4 h-4 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 shadow-xs transition-colors text-center"
              >
                Login to Student Portal
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center max-w-2xl mx-auto border-t border-slate-200/60 mt-8">
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">10,000+</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Curated Questions</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-extrabold text-indigo-600">₹49</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Average Bundle Price</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">100%</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Detailed Explanations</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">Instant</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Access Unlock</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXAM CATEGORIES & FEATURED BUNDLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Exam Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Question Bundles
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Select an exam category to filter question sets
            </p>
          </div>

          {/* Exam Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none max-w-full">
            {examTabs.map((tab) => (
              <button
                key={tab.code}
                onClick={() => setSelectedExam(tab.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedExam === tab.code
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bundles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BundleCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 animate-fade-in">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No bundles available in this exam category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredBundles.map((b) => (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Thumbnail / Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {b.thumbnail ? (
                    <img
                      src={b.thumbnail}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-800 flex items-center justify-center text-white">
                      <BookOpen className="w-12 h-12 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold shadow-xs">
                      {b.exam?.name || 'General'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        b.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.difficulty === 'Hard'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                      {b.subjectName || 'Full Syllabus'}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {b.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span>{b.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Full Solutions</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">One-time price</span>
                      <span className="text-2xl font-black text-slate-900">₹{b.price}</span>
                    </div>

                    {b.isPurchased ? (
                      <Link
                        href={`/practice/${b.id}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Start Practice
                      </Link>
                    ) : (
                      <Link
                        href={`/bundles/${b.id}`}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200"
                      >
                        <span>View Bundle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-extrabold mt-1">How ExamForge Works</h2>
            <p className="text-slate-400 text-sm mt-2">
              Get practice-ready in less than two minutes without monthly subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Browse Bundles</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Choose exam-specific sets like SSC Quantitative Aptitude or Banking Reasoning tailored to your target exam.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Pay Per Bundle</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Pay low upfront prices (₹39 to ₹79) via Razorpay (UPI, Google Pay, Cards, NetBanking).
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Dual Practice Modes</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Switch between Instant Practice mode (immediate answer & solution) or Timed Exam Test mode.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Track Performance</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Analyze your accuracy, question breakdown, time taken, and pinpoint weak topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-8 sm:p-12 text-center shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Ready to Accelerate Your Exam Preparation?
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base">
            Join hundreds of aspirants practicing authentic questions with step-by-step solutions today.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/bundles"
              className="px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 shadow-md transition-colors"
            >
              Browse All Bundles
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-white font-bold text-sm border border-indigo-400/40 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
