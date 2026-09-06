'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, BookOpen, CheckCircle2, ArrowRight, Zap, HelpCircle } from 'lucide-react';

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

export default function BundlesCatalogPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedExam !== 'ALL') params.set('exam', selectedExam);
      if (selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/bundles?${params.toString()}`);
      const data = await res.json();
      if (data.bundles) setBundles(data.bundles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [selectedExam, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBundles();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Question Store
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Explore Practice Question Bundles
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          High-yield practice sets curated for SSC, Banking, Railways, and State exams. Unlock full question sets with verified solutions at pocket-friendly prices.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by topic, exam, or bundle title (e.g. Percentage, Banking, SSC)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Exam:</span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Exams</option>
              <option value="SSC">SSC (CGL, CHSL)</option>
              <option value="BANKING">Banking & Insurance</option>
              <option value="RRB">RRB Railways</option>
              <option value="STATE_PSC">State PSCs</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400">
            Found <span className="font-bold text-slate-700">{bundles.length}</span> bundles
          </div>
        </div>
      </div>

      {/* Bundles Listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Bundles Matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the filters to view all available practice question sets.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedExam('ALL');
              setSelectedDifficulty('ALL');
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((b) => (
            <div
              key={b.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all overflow-hidden"
            >
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
                <div className="absolute top-3 left-3">
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

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>{b.questionCount} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Full Explanations</span>
                  </div>
                </div>

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
    </div>
  );
}
