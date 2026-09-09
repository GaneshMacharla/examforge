'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Lock,
  BookOpen,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Skeleton, QuestionCardSkeleton } from '@/components/Skeleton';

interface Question {
  index: number;
  id: string;
  questionText: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topicName: string;
  subjectName: string;
  tags?: string[];
}

interface BundleMeta {
  id: string;
  name: string;
  examName: string;
  subjectName?: string;
  difficulty: string;
  totalQuestions: number;
}

export default function PracticeEnginePage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params.bundleId as string;

  const [bundle, setBundle] = useState<BundleMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Engine state
  const [mode, setMode] = useState<'PRACTICE' | 'TEST'>('PRACTICE');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedInPractice, setRevealedInPractice] = useState<Record<string, boolean>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Timed Test state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [bundleId]);

  const fetchQuestions = async () => {
    setLoading(true);
    setAccessDenied(false);

    try {
      const res = await fetch(`/api/bundles/${bundleId}/questions`);
      if (res.status === 403 || res.status === 401) {
        setAccessDenied(true);
        return;
      }
      const data = await res.json();
      if (data.bundle && data.questions) {
        setBundle(data.bundle);
        setQuestions(data.questions);
        // Default test time: 1.5 mins per question
        setTimerSeconds(Math.max(300, data.questions.length * 90));
      } else {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error(err);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  // Timer loop for TEST mode
  useEffect(() => {
    if (mode === 'TEST' && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, timerSeconds]);

  const handleSelectOption = (optionKey: string) => {
    const q = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [q.id]: optionKey,
    }));

    if (mode === 'PRACTICE') {
      // In practice mode, immediately show explanation and answer
      setRevealedInPractice((prev) => ({
        ...prev,
        [q.id]: true,
      }));
    }
  };

  const toggleMarkForReview = () => {
    const q = questions[currentIndex];
    setMarkedForReview((prev) => ({
      ...prev,
      [q.id]: !prev[q.id],
    }));
  };

  const clearCurrentSelection = () => {
    const q = questions[currentIndex];
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
    if (mode === 'PRACTICE') {
      setRevealedInPractice((prev) => {
        const copy = { ...prev };
        delete copy[q.id];
        return copy;
      });
    }
  };

  const handleAutoSubmit = () => {
    submitTest();
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id] || null,
      }));

      const totalTimeAllocated = questions.length * 90;
      const timeSpent = Math.max(10, totalTimeAllocated - timerSeconds);

      const res = await fetch('/api/practice/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId,
          mode,
          answers: answersPayload,
          timeTakenSec: timeSpent,
        }),
      });

      const data = await res.json();
      if (data.attemptId) {
        router.push(`/practice/${bundleId}/results/${data.attemptId}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit test. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
        {/* Practice Engine Top Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* 2-Column Question Workspace Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <QuestionCardSkeleton />
          </div>
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Strict Access Control Guard
  if (accessDenied) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            This question bundle is locked because it hasn&apos;t been purchased on your account yet. Purchase this bundle to unlock all practice questions with full step-by-step solutions!
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href={`/bundles/${bundleId}`}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>View & Unlock Bundle</span>
          </Link>
          <Link
            href="/bundles"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all"
          >
            Explore Other Bundles
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Questions In This Bundle</h2>
        <p className="text-xs text-slate-500">The administrator is preparing questions for this set.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentSelected = selectedAnswers[currentQ.id];
  const isRevealed = mode === 'PRACTICE' && revealedInPractice[currentQ.id];
  const isCurrentMarked = markedForReview[currentQ.id];

  // Stats for palette
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP HEADER & MODE CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
              {bundle?.examName}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">{currentQ.topicName}</span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 line-clamp-1">{bundle?.name}</h1>
        </div>

        {/* Mode Selector Toggle & Actions */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setMode('PRACTICE')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mode === 'PRACTICE'
                  ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Practice</span>
            </button>

            <button
              onClick={() => setMode('TEST')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mode === 'TEST'
                  ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timed Test</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Display in TEST mode */}
            {mode === 'TEST' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs sm:text-sm font-bold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            )}

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN PRACTICE WORKSPACE (QUESTION + PALETTE) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols: Question Area */}
        <div className="lg:col-span-3 space-y-6 min-w-0">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 sm:space-y-6">
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-slate-900 text-white font-black text-xs sm:text-sm shrink-0">
                  Q {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  of {questions.length}
                </span>

                {/* Mobile Quick Palette Toggle */}
                <button
                  type="button"
                  onClick={() => setMobilePaletteOpen(true)}
                  className="lg:hidden ml-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open question palette"
                >
                  <Eye className="w-3 h-3" />
                  <span>Palette ({answeredCount}/{questions.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMarkForReview}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isCurrentMarked
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isCurrentMarked ? 'Marked for Review' : 'Mark Review'}</span>
                  <span className="sm:hidden">{isCurrentMarked ? 'Marked' : 'Review'}</span>
                </button>

                {currentSelected && (
                  <button
                    onClick={clearCurrentSelection}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1"
                    title="Clear response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {currentQ.questionText}
            </div>

            {/* Image if available */}
            {currentQ.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md">
                <img src={currentQ.imageUrl} alt="Question Diagram" className="w-full h-auto" />
              </div>
            )}

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {[
                { key: 'A', text: currentQ.optionA },
                { key: 'B', text: currentQ.optionB },
                { key: 'C', text: currentQ.optionC },
                { key: 'D', text: currentQ.optionD },
              ].map((opt) => {
                const isSelected = currentSelected === opt.key;
                const isCorrect = opt.key === currentQ.correctAnswer;

                let optionClasses =
                  'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800';

                // Highlighting logic:
                if (mode === 'PRACTICE' && isRevealed) {
                  if (isCorrect) {
                    optionClasses =
                      'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !isCorrect) {
                    optionClasses =
                      'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20';
                  }
                } else if (isSelected) {
                  optionClasses =
                    'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${optionClasses}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm font-medium flex-1 pt-1 leading-relaxed">
                      {opt.text}
                    </span>
                    {mode === 'PRACTICE' && isRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                    )}
                    {mode === 'PRACTICE' && isRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Solution / Explanation Box in PRACTICE mode */}
            {mode === 'PRACTICE' && isRevealed && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100 shadow-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Step-by-Step Solution
                  </span>
                  <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Correct Option: {currentQ.correctAnswer}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line pt-1">
                  {currentQ.explanation}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-h-[42px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-slate-400 font-medium px-2 shrink-0">
                {currentIndex + 1} / {questions.length}
              </span>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 cursor-pointer min-h-[42px]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200 cursor-pointer min-h-[42px]"
                >
                  <span>Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Question Palette Navigation Grid */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs text-indigo-600 font-semibold">
                {answeredCount} / {questions.length}
              </span>
            </h3>

            {/* Summary badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>{answeredCount} Answered</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>{unansweredCount} Left</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{markedCount} Marked for Review</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1 pt-2 border-t border-slate-100">
              {questions.map((q, idx) => {
                const isSelected = !!selectedAnswers[q.id];
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIndex === idx;

                let paletteStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isSelected) {
                  paletteStyle = 'bg-indigo-600 text-white font-bold shadow-xs';
                }
                if (isMarked) {
                  paletteStyle = 'bg-amber-400 text-amber-950 font-bold';
                }
                if (isCurrent) {
                  paletteStyle += ' ring-2 ring-indigo-500 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${paletteStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Submit & Review Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Submit Test Session?</h3>
              <p className="text-xs text-slate-500">
                Are you ready to submit? Here is your answer summary:
              </p>
            </div>

            {/* Answered summary */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <div className="text-lg font-black text-indigo-600">{answeredCount}</div>
                <div className="text-[10px] text-slate-500 font-medium">Answered</div>
              </div>
              <div>
                <div className="text-lg font-black text-rose-600">{unansweredCount}</div>
                <div className="text-[10px] text-slate-500 font-medium">Unanswered</div>
              </div>
              <div>
                <div className="text-lg font-black text-amber-600">{markedCount}</div>
                <div className="text-[10px] text-slate-500 font-medium">Marked</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Back to Test
              </button>
              <button
                onClick={submitTest}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Scoring...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Question Palette Modal Drawer */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 lg:hidden">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Question Palette</h3>
                <p className="text-xs text-indigo-600 font-semibold">{answeredCount} of {questions.length} Answered</p>
              </div>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close palette"
              >
                ✕
              </button>
            </div>

            {/* Summary badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <span>{answeredCount} Answered</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span>{unansweredCount} Left</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-100 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>{markedCount} Marked for Review</span>
              </div>
            </div>

            {/* Question buttons grid */}
            <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1 py-2 flex-1 max-h-60 border-t border-slate-100">
              {questions.map((q, idx) => {
                const isSelected = !!selectedAnswers[q.id];
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIndex === idx;

                let paletteStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isSelected) paletteStyle = 'bg-indigo-600 text-white font-bold shadow-xs';
                if (isMarked) paletteStyle = 'bg-amber-400 text-amber-950 font-bold';
                if (isCurrent) paletteStyle += ' ring-2 ring-indigo-500 ring-offset-2';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${paletteStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMobilePaletteOpen(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Submit & Review Results</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
