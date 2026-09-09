'use client';

import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
  Eye,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

interface BundleItem {
  id: string;
  name: string;
  description: string;
  subjectName?: string;
  difficulty: string;
  price: number;
  status: string;
  thumbnail?: string;
  exam: { id: string; name: string; code: string };
  questionCount: number;
  salesCount: number;
  totalRevenue: number;
}

interface QuestionItem {
  id: string;
  questionText: string;
  difficulty: string;
  subject: { name: string };
  topic: { name: string };
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [bankQuestions, setBankQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    examId: '',
    subjectName: '',
    difficulty: 'Mixed',
    price: 49,
    status: 'PUBLISHED',
    thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    selectedQuestionIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bundlesRes, examsRes, qRes] = await Promise.all([
        fetch('/api/admin/bundles'),
        fetch('/api/exams'),
        fetch('/api/admin/questions'),
      ]);

      const [bundlesData, examsData, qData] = await Promise.all([
        bundlesRes.json(),
        examsRes.json(),
        qRes.json(),
      ]);

      if (bundlesData.bundles) setBundles(bundlesData.bundles);
      if (examsData.exams) {
        setExams(examsData.exams);
        if (!formData.examId && examsData.exams.length > 0) {
          setFormData((prev) => ({ ...prev, examId: examsData.exams[0].id }));
        }
      }
      if (qData.questions) setBankQuestions(qData.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenCreate = () => {
    setEditingBundleId(null);
    setFormData({
      name: '',
      description: '',
      examId: exams[0]?.id || '',
      subjectName: '',
      difficulty: 'Mixed',
      price: 49,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
      selectedQuestionIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (bundle: BundleItem) => {
    setEditingBundleId(bundle.id);
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`);
      const data = await res.json();
      setFormData({
        name: bundle.name,
        description: bundle.description,
        examId: bundle.exam.id,
        subjectName: bundle.subjectName || '',
        difficulty: bundle.difficulty,
        price: bundle.price,
        status: bundle.status,
        thumbnail: bundle.thumbnail || '',
        selectedQuestionIds: data.bundle?.questionIds || [],
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBundles((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingBundleId
        ? `/api/admin/bundles/${editingBundleId}`
        : '/api/admin/bundles';
      const method = editingBundleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questionIds: formData.selectedQuestionIds,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestionSelection = (qId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedQuestionIds.includes(qId);
      return {
        ...prev,
        selectedQuestionIds: exists
          ? prev.selectedQuestionIds.filter((id) => id !== qId)
          : [...prev.selectedQuestionIds, qId],
      };
    });
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Bundle Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, price, and assign questions to paid practice bundles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bundle</span>
        </button>
      </div>

      {/* Table of Bundles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Bundle Details</th>
                <th className="py-3.5 px-4">Exam</th>
                <th className="py-3.5 px-4">Questions</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Sales & Revenue</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-fade-in">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-44 rounded-md" />
                          <Skeleton className="h-3 w-28 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : bundles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No bundles created yet. Click "Create New Bundle" above!
                  </td>
                </tr>
              ) : (
                bundles.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors animate-fade-in">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{b.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{b.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {b.exam?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {b.questionCount} Questions
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{b.price}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.salesCount} Sales</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        ₹{b.totalRevenue}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Bundle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBundle(b.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Bundle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingBundleId ? 'Edit Question Bundle' : 'Create Question Bundle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bundle Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC CGL Quantitative Aptitude – Practice Set 2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what topics students will practice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Exam
                  </label>
                  <select
                    value={formData.examId}
                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PUBLISHED">Published (Available in Store)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Question Linker / Bank Selector */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Questions from Bank ({formData.selectedQuestionIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.selectedQuestionIds.length === bankQuestions.length) {
                        setFormData({ ...formData, selectedQuestionIds: [] });
                      } else {
                        setFormData({
                          ...formData,
                          selectedQuestionIds: bankQuestions.map((q) => q.id),
                        });
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {formData.selectedQuestionIds.length === bankQuestions.length
                      ? 'Deselect All'
                      : 'Select All Questions'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {bankQuestions.map((q) => {
                    const isChecked = formData.selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{q.questionText}</div>
                          <div className="text-[10px] text-slate-500">
                            {q.subject?.name} • {q.topic?.name} • {q.difficulty}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBundleId ? 'Save Changes' : 'Create Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
