'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Filter,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { TestResultsSkeleton } from '@/components/Skeleton';

interface AttemptData {
  id: string;
  bundleId: string;
  bundleName: string;
  examName: string;
  mode: string;
  score: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
  timeTakenSec: number;
  completedAt: string;
  questionReviews: Array<{
    index: number;
    questionId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    isUnanswered: boolean;
    explanation: string;
    topic: string;
    difficulty: string;
  }>;
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const bundleId = params.bundleId as string;

  const [data, setData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'UNANSWERED'>('ALL');

  useEffect(() => {
    fetch(`/api/practice/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.attempt) {
          setData(resData.attempt);
          // Trigger confetti if scored > 60%
          if (resData.attempt.accuracy >= 50) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return <TestResultsSkeleton />;
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 animate-fade-in">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Results Not Found</h2>
        <Link href="/student/dashboard" className="text-xs font-semibold text-indigo-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const filteredQuestions = data.questionReviews.filter((q) => {
    if (filter === 'CORRECT') return q.isCorrect;
    if (filter === 'INCORRECT') return !q.isCorrect && !q.isUnanswered;
    if (filter === 'UNANSWERED') return q.isUnanswered;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* 1. HERO RESULT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Completed 🎉</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {data.bundleName}
          </h1>
          <p className="text-xs text-slate-500">
            {data.examName} • Completed on {new Date(data.completedAt).toLocaleString()}
          </p>
        </div>

        {/* Score Ring / Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-2">
          <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-800 uppercase">Score</span>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-700">
              {data.score} <span className="text-xs sm:text-sm text-indigo-400 font-bold">/ {data.totalQuestions}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase">Accuracy</span>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700">
              {data.accuracy}%
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase">Correct</span>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600">
              {data.correct}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-800 uppercase">Incorrect</span>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600">
              {data.incorrect}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 uppercase">Time</span>
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800">
              {Math.floor(data.timeTakenSec / 60)}m {data.timeTakenSec % 60}s
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <Link
            href={`/practice/${bundleId}`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Practice Set</span>
          </Link>
          <Link
            href="/student/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* 2. QUESTION-BY-QUESTION REVIEW */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Question Review & Solutions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every answer with complete step-by-step explanations
            </p>
          </div>

          {/* Filter Pills with Horizontal Swipe on Mobile */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({data.questionReviews.length})
            </button>
            <button
              onClick={() => setFilter('CORRECT')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                filter === 'CORRECT' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Correct ({data.correct})
            </button>
            <button
              onClick={() => setFilter('INCORRECT')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                filter === 'INCORRECT' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Incorrect ({data.incorrect})
            </button>
            <button
              onClick={() => setFilter('UNANSWERED')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                filter === 'UNANSWERED' ? 'bg-white text-amber-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Unanswered ({data.unanswered})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((q) => (
            <div
              key={q.questionId}
              className={`p-6 rounded-3xl bg-white border shadow-xs space-y-4 ${
                q.isCorrect
                  ? 'border-emerald-200'
                  : q.isUnanswered
                  ? 'border-slate-200'
                  : 'border-rose-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Question {q.index}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{q.topic}</span>
                </div>

                <div>
                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                    </span>
                  ) : q.isUnanswered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <HelpCircle className="w-3.5 h-3.5" /> Unattempted (0)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {q.questionText}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: q.optionA },
                  { key: 'B', text: q.optionB },
                  { key: 'C', text: q.optionC },
                  { key: 'D', text: q.optionD },
                ].map((opt) => {
                  const isUserSelection = q.selectedAnswer === opt.key;
                  const isTheCorrectAnswer = q.correctAnswer === opt.key;

                  let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isTheCorrectAnswer) {
                    optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isUserSelection && !q.isCorrect) {
                    optClass = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                  }

                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isTheCorrectAnswer && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                        {isUserSelection && (
                          <span className="text-[10px] bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step-by-Step Explanation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border border-indigo-100 text-xs space-y-1.5">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Step-by-step Solution</span>
                </div>
                <div className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {q.explanation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
