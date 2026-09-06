'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Plus,
  Trash2,
  Search,
  Upload,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  tags?: string;
  subject: { id: string; name: string; exam: { name: string } };
  topic: { id: string; name: string };
}

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // New Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newQ, setNewQ] = useState({
    subjectId: '',
    topicId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'Medium',
    tags: '',
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculum = async () => {
    try {
      const res = await fetch('/api/admin/curriculum');
      const data = await res.json();
      if (data.exams) {
        setCurriculum(data.exams);
        // default select first subject and topic
        const firstExam = data.exams[0];
        const firstSubject = firstExam?.subjects[0];
        const firstTopic = firstSubject?.topics[0];
        if (firstSubject && firstTopic) {
          setNewQ((prev) => ({
            ...prev,
            subjectId: firstSubject.id,
            topicId: firstTopic.id,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCurriculum();
  }, [selectedDifficulty]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchQuestions();
        setNewQ({
          ...newQ,
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          explanation: '',
          tags: '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Question Bank</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central repository of exam questions with multi-option answers and step-by-step solutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/questions/bulk-upload"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk CSV Upload</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Question</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search questions, explanations, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button
            onClick={fetchQuestions}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-800">No Questions Found</div>
            <p className="text-xs text-slate-500">
              Try modifying your search or upload questions using our bulk CSV importer.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {q.subject?.exam?.name}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-semibold">{q.subject?.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-medium">{q.topic?.name}</span>
                  <span
                    className={`ml-2 px-2 py-0.2 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {q.questionText}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optText = (q as any)[`option${letter}`];
                  const isCorrect = q.correctAnswer === letter;
                  return (
                    <div
                      key={letter}
                      className={`p-2 rounded-xl border ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-1">{letter}.</span> {optText}
                    </div>
                  );
                })}
              </div>

              {/* Solution */}
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                <span className="font-bold text-slate-700">Solution: </span>
                {q.explanation}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE SINGLE QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Add New Question to Bank</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Exam & Subject</label>
                  <select
                    value={newQ.subjectId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      // Find first topic of that subject
                      let foundTopic = '';
                      for (const exam of curriculum) {
                        const subj = exam.subjects?.find((s: any) => s.id === sId);
                        if (subj && subj.topics?.[0]) {
                          foundTopic = subj.topics[0].id;
                          break;
                        }
                      }
                      setNewQ({ ...newQ, subjectId: sId, topicId: foundTopic });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {curriculum.map((exam) =>
                      exam.subjects?.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {exam.name} - {sub.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Topic</label>
                  <select
                    value={newQ.topicId}
                    onChange={(e) => setNewQ({ ...newQ, topicId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {curriculum.map((exam) =>
                      exam.subjects
                        ?.filter((s: any) => s.id === newQ.subjectId)
                        .map((s: any) =>
                          s.topics?.map((t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))
                        )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question Text</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What is 25% of 240?"
                  value={newQ.questionText}
                  onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={newQ.optionA}
                    onChange={(e) => setNewQ({ ...newQ, optionA: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={newQ.optionB}
                    onChange={(e) => setNewQ({ ...newQ, optionB: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={newQ.optionC}
                    onChange={(e) => setNewQ({ ...newQ, optionC: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={newQ.optionD}
                    onChange={(e) => setNewQ({ ...newQ, optionD: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Correct Answer</label>
                  <select
                    value={newQ.correctAnswer}
                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={newQ.difficulty}
                    onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Step-by-Step Explanation</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide formula, working, and logic..."
                  value={newQ.explanation}
                  onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
