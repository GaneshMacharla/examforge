'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Target,
  Landmark,
  Train,
  Building2,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Layers,
  HelpCircle,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

// Available icons map
const ICON_OPTIONS = [
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'Target', icon: Target, label: 'Exam/Goal' },
  { name: 'Landmark', icon: Landmark, label: 'Banking/Govt' },
  { name: 'Train', icon: Train, label: 'Railways' },
  { name: 'Building2', icon: Building2, label: 'State/Public' },
  { name: 'Award', icon: Award, label: 'Excellence' },
  { name: 'BookOpen', icon: BookOpen, label: 'Literature/Study' },
  { name: 'Brain', icon: Brain, label: 'Reasoning/Logic' },
  { name: 'Briefcase', icon: Briefcase, label: 'Professional' },
  { name: 'Sparkles', icon: Sparkles, label: 'Special' },
];

function getIconComponent(name?: string | null) {
  const found = ICON_OPTIONS.find((opt) => opt.name === name);
  return found ? found.icon : GraduationCap;
}

interface SubjectItem {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    questions: number;
  };
}

interface ExamItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  subjects?: SubjectItem[];
  _count?: {
    bundles: number;
    questions: number;
    subjects: number;
  };
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    icon: 'GraduationCap',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Inline Subject Creation inside exam card
  const [addingSubjectExamId, setAddingSubjectExamId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [submittingSubject, setSubmittingSubject] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exams');
      const data = await res.json();
      if (data.exams) {
        setExams(data.exams);
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenCreate = () => {
    setEditingExamId(null);
    setErrorMsg('');
    setFormData({
      name: '',
      code: '',
      description: '',
      icon: 'GraduationCap',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setEditingExamId(exam.id);
    setErrorMsg('');
    setFormData({
      name: exam.name,
      code: exam.code,
      description: exam.description || '',
      icon: exam.icon || 'GraduationCap',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const url = editingExamId
        ? `/api/admin/exams/${editingExamId}`
        : '/api/admin/exams';
      const method = editingExamId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save exam');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (exam: ExamItem) => {
    const bundlesCount = exam._count?.bundles || 0;
    const questionsCount = exam._count?.questions || 0;

    if (bundlesCount > 0 || questionsCount > 0) {
      alert(
        `Cannot delete "${exam.name}" because it still has ${bundlesCount} bundle(s) and ${questionsCount} question(s). Please delete or reassign them first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete the exam "${exam.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete exam');
      } else {
        setExams((prev) => prev.filter((e) => e.id !== exam.id));
      }
    } catch (err) {
      console.error('Delete exam error:', err);
    }
  };

  const handleAddSubject = async (examId: string) => {
    if (!newSubjectName.trim()) return;
    setSubmittingSubject(true);
    try {
      const res = await fetch('/api/admin/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subject',
          examId,
          name: newSubjectName.trim(),
          description: newSubjectDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNewSubjectName('');
        setNewSubjectDesc('');
        setAddingSubjectExamId(null);
        fetchExams();
      }
    } catch (err) {
      console.error('Failed to create subject:', err);
    } finally {
      setSubmittingSubject(false);
    }
  };

  const filteredExams = exams.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  });

  const totalExamsCount = exams.length;
  const totalSubjectsCount = exams.reduce((acc, e) => acc + (e._count?.subjects || e.subjects?.length || 0), 0);
  const totalQuestionsCount = exams.reduce((acc, e) => acc + (e._count?.questions || 0), 0);
  const totalBundlesCount = exams.reduce((acc, e) => acc + (e._count?.bundles || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Exam Categories</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, configure, and organize exam verticals (e.g., SSC, Banking, Railways, UPSC, GATE) and their subjects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bundles"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Manage Bundles</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Exams</span>
          <div className="text-2xl font-black text-slate-900">{totalExamsCount}</div>
          <span className="text-[10px] text-indigo-600 font-bold">Active categories</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Curriculum Subjects</span>
          <div className="text-2xl font-black text-slate-900">{totalSubjectsCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Across all exams</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Questions Banked</span>
          <div className="text-2xl font-black text-slate-900">{totalQuestionsCount}</div>
          <span className="text-[10px] text-amber-600 font-bold">Reusable questions</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Practice Bundles</span>
          <div className="text-2xl font-black text-slate-900">{totalBundlesCount}</div>
          <span className="text-[10px] text-purple-600 font-bold">In store catalog</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search exams by name, code (e.g. SSC, UPSC, GATE), or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 text-sm">
            {search ? 'No Exams Matched Your Search' : 'No Exams Created Yet'}
          </p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {search
              ? 'Try adjusting your search keywords or clear the filter.'
              : 'Create your first exam category (e.g. UPSC, SSC, Banking) to start adding subjects and practice question bundles!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
          >
            + Create Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const IconComp = getIconComponent(exam.icon);
            const isExpanded = expandedExamId === exam.id;
            const subjects = exam.subjects || [];
            const isAddingSubject = addingSubjectExamId === exam.id;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Icon, Name, Code, Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{exam.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 tracking-wider">
                            {exam.code}
                          </span>
                        </div>
                        {exam.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Exam"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{exam._count?.subjects || subjects.length} Subjects</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{exam._count?.questions || 0} Questions</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>{exam._count?.bundles || 0} Bundles</span>
                    </span>
                  </div>

                  {/* Expand / View Subjects */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Subjects' : `View Subjects (${subjects.length})`}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setAddingSubjectExamId(isAddingSubject ? null : exam.id);
                          setExpandedExamId(exam.id);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-indigo-600" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    {/* Inline Add Subject Form */}
                    {isAddingSubject && (
                      <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 animate-fade-in">
                        <div className="text-[11px] font-bold text-indigo-900">
                          Add Subject to {exam.name}
                        </div>
                        <input
                          type="text"
                          placeholder="Subject Name (e.g. Quantitative Aptitude, General Studies)..."
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Brief Description (optional)..."
                          value={newSubjectDesc}
                          onChange={(e) => setNewSubjectDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAddingSubjectExamId(null)}
                            className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!newSubjectName.trim() || submittingSubject}
                            onClick={() => handleAddSubject(exam.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition disabled:opacity-50 cursor-pointer"
                          >
                            {submittingSubject ? 'Saving...' : 'Save Subject'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Subjects Drawer */}
                    {isExpanded && (
                      <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-fade-in">
                        {subjects.length === 0 ? (
                          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                            No subjects added yet. Click &quot;Add Subject&quot; above to create one.
                          </div>
                        ) : (
                          subjects.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs transition"
                            >
                              <div className="font-semibold text-slate-800">{sub.name}</div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                                {sub._count?.questions || 0} Questions
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Category Identifier:</span>
                  <code className="font-mono text-[11px] font-bold text-slate-700">{exam.code}</code>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT EXAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingExamId ? 'Edit Exam Category' : 'Create New Exam'}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure exam name, code, and display icon.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC Civil Services, GATE Computer Science, NEET UG"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Code / Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC, GATE, NEET, CAT"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Short unique uppercase identifier used for store filters and URL parameters.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the target audience, examinations covered, or syllabus scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Icon
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.icon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: opt.name })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingExamId ? 'Save Changes' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
