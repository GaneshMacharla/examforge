'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  Upload,
  BookOpen,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Hash,
  GraduationCap,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

interface SubjectItem {
  id: string;
  name: string;
  description?: string;
  _count?: {
    questions: number;
  };
}

interface ExamWithSubjects {
  id: string;
  name: string;
  code: string;
  subjects: SubjectItem[];
}

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

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [exams, setExams] = useState<ExamWithSubjects[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    examId: '',
    difficulty: 'Mixed',
    price: 49,
    status: 'PUBLISHED',
    thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  });

  // Per-subject question count allocation state: { [subjectId]: count }
  const [subjectAllocations, setSubjectAllocations] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Quick Inline Subject Creation inside modal
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  // Quick Inline Exam Creation inside modal
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [addingExam, setAddingExam] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bundlesRes, currRes] = await Promise.all([
        fetch('/api/admin/bundles'),
        fetch('/api/admin/curriculum'),
      ]);

      const [bundlesData, currData] = await Promise.all([
        bundlesRes.json(),
        currRes.json(),
      ]);

      if (bundlesData.bundles) setBundles(bundlesData.bundles);
      if (currData.exams) {
        setExams(currData.exams);
        if (!formData.examId && currData.exams.length > 0) {
          setFormData((prev) => ({ ...prev, examId: currData.exams[0].id }));
        }
      }
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
    setSubjectAllocations({});
    setShowAddSubject(false);
    setShowAddExam(false);
    setFormData({
      name: '',
      description: '',
      examId: exams[0]?.id || '',
      difficulty: 'Mixed',
      price: 49,
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (bundle: BundleItem) => {
    setEditingBundleId(bundle.id);
    setSubjectAllocations({});
    setShowAddSubject(false);
    setShowAddExam(false);
    setFormData({
      name: bundle.name,
      description: bundle.description,
      examId: bundle.exam.id,
      difficulty: bundle.difficulty,
      price: bundle.price,
      status: bundle.status || 'PUBLISHED',
      thumbnail: bundle.thumbnail || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle? All associated questions and data for this bundle will be removed.')) return;
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBundles((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExamChange = (newExamId: string) => {
    setFormData((prev) => ({
      ...prev,
      examId: newExamId,
    }));
    // Reset subject allocations when exam changes
    setSubjectAllocations({});
  };

  const handleSetAllocation = (subjectId: string, count: number) => {
    setSubjectAllocations((prev) => ({
      ...prev,
      [subjectId]: Math.max(0, count),
    }));
  };

  const handleQuickAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !formData.examId) return;

    setAddingSubject(true);
    try {
      const res = await fetch('/api/admin/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subject',
          examId: formData.examId,
          name: newSubjectName.trim(),
        }),
      });

      if (res.ok) {
        setNewSubjectName('');
        setShowAddSubject(false);
        // Refresh curriculum to show new subject immediately
        const currRes = await fetch('/api/admin/curriculum');
        const currData = await currRes.json();
        if (currData.exams) setExams(currData.exams);
      }
    } catch (err) {
      console.error('Failed to add subject', err);
    } finally {
      setAddingSubject(false);
    }
  };

  const handleQuickAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamCode.trim()) return;

    setAddingExam(true);
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExamName.trim(),
          code: newExamCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.exam) {
        setNewExamName('');
        setNewExamCode('');
        setShowAddExam(false);
        // Refresh curriculum and select the new exam
        const currRes = await fetch('/api/admin/curriculum');
        const currData = await currRes.json();
        if (currData.exams) {
          setExams(currData.exams);
          setFormData((prev) => ({ ...prev, examId: data.exam.id }));
        }
      } else {
        alert(data.error || 'Failed to create exam');
      }
    } catch (err) {
      console.error('Failed to add exam', err);
    } finally {
      setAddingExam(false);
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

      const allocationsArray = Object.entries(subjectAllocations)
        .filter(([_, count]) => count > 0)
        .map(([subjectId, count]) => ({ subjectId, count }));

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subjectAllocations: allocationsArray,
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

  // Find currently selected exam and its available subjects
  const currentExam = exams.find((e) => e.id === formData.examId) || exams[0];
  const availableSubjects: SubjectItem[] = currentExam?.subjects || [];

  // Calculate total questions selected from all subjects
  const totalQuestionsSelected = Object.values(subjectAllocations).reduce((acc, val) => acc + (val || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Bundle Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, price, and customize practice bundles by choosing questions directly from available subjects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/exams"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Exams</span>
          </Link>
          <Link
            href="/admin/questions/bulk-upload"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload Questions (CSV)</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Bundle</span>
          </button>
        </div>
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
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">No Bundles in Database</p>
                      <p className="text-slate-400 text-xs">
                        Create your first practice bundle now, or upload questions directly via CSV bulk upload!
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={handleOpenCreate}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                        >
                          + Create Bundle
                        </button>
                      </div>
                    </div>
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
                    <td className="py-3.5 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        b.questionCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {b.questionCount} Questions
                      </span>
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/questions/bulk-upload?bundleId=${b.id}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                          title="Upload questions directly into this bundle"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload CSV</span>
                        </Link>
                        {b.questionCount > 0 && (
                          <Link
                            href={`/practice/${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Test/Preview Practice as Admin"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL (SUBJECT-WISE QUESTION ALLOCATION) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingBundleId ? 'Edit Question Bundle' : 'Create Question Bundle'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an exam to view its subjects and specify how many questions to pull from each.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Bundle Title */}
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
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 2. Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain what topics students will practice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Row: Exam, Price, Difficulty */}
              {/* 3. Exam Category with Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Exam Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddExam(!showAddExam)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddExam ? 'Cancel' : '+ New Exam'}</span>
                  </button>
                </div>

                {showAddExam && (
                  <div className="mb-2.5 p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Exam Name (e.g. UPSC, GATE)..."
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. UPSC)..."
                      value={newExamCode}
                      onChange={(e) => setNewExamCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                      className="w-full sm:w-24 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddExam}
                      disabled={!newExamName.trim() || !newExamCode.trim() || addingExam}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {addingExam ? 'Saving...' : 'Save Exam'}
                    </button>
                  </div>
                )}

                <select
                  value={formData.examId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Row: Price & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              {/* 5. AVAILABLE SUBJECTS & QUESTION ALLOCATION SECTION */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Select Questions by Subject
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Available subjects for <strong className="text-indigo-600">{currentExam?.name || 'Selected Exam'}</strong>. Specify questions from each:
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSubject(!showAddSubject)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddSubject ? 'Cancel' : '+ Add Subject'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Subject Form */}
                {showAddSubject && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder={`New subject name for ${currentExam?.name}...`}
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddSubject}
                      disabled={!newSubjectName.trim() || addingSubject}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {addingSubject ? 'Adding...' : 'Save Subject'}
                    </button>
                  </div>
                )}

                {/* Subjects List */}
                {availableSubjects.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 text-amber-900 text-xs flex items-center justify-between">
                    <span>No subjects created for this exam yet. Click <strong>+ Add Subject</strong> above to add one!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {availableSubjects.map((subj) => {
                      const availableCount = subj._count?.questions || 0;
                      const currentAllocation = subjectAllocations[subj.id] || 0;

                      return (
                        <div
                          key={subj.id}
                          className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-200 transition space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 shrink-0">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900">{subj.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    availableCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {availableCount} in Question Bank
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stepper / Input */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <label className="text-[11px] font-bold text-slate-600">
                                Take from subject:
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={availableCount}
                                  disabled={availableCount === 0}
                                  value={currentAllocation}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const clamped = Math.max(0, Math.min(val, availableCount));
                                    handleSetAllocation(subj.id, clamped);
                                  }}
                                  className="w-20 px-2.5 py-1.5 text-xs font-black text-center border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                                />
                                <span className="text-[11px] text-slate-500 font-medium">Qns</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Set Pills */}
                          <div className="flex flex-wrap items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px] gap-2">
                            <span className="text-slate-400">Quick set:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetAllocation(subj.id, 0)}
                                className="px-2 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-300 text-slate-700 font-semibold transition cursor-pointer"
                              >
                                0
                              </button>
                              {[5, 10, 25]
                                .filter((n) => n < availableCount)
                                .map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleSetAllocation(subj.id, n)}
                                    className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition cursor-pointer"
                                  >
                                    {n}
                                  </button>
                                ))}
                              {availableCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAllocation(subj.id, availableCount)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition cursor-pointer"
                                >
                                  All ({availableCount})
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total Questions Counter Banner */}
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-indigo-600 text-white">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-slate-900">
                      Total Questions Selected for this Bundle:
                    </span>
                  </div>
                  <span className="font-black text-sm text-indigo-700 bg-white px-3 py-1 rounded-xl border border-indigo-200 shadow-xs">
                    {totalQuestionsSelected} Questions
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition cursor-pointer"
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
