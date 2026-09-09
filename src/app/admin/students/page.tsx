'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Smartphone,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { TableSkeleton } from '@/components/Skeleton';

interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  targetExam: string | null;
  createdAt: string;
  totalPurchases: number;
  totalTests: number;
  devicesCount: number;
  purchasedBundles: string[];
  totalSpent: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('ALL');
  const [activeStudentModal, setActiveStudentModal] = useState<Student | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetDevices = async (studentId: string) => {
    setResettingId(studentId);
    setResetFeedback(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/reset-devices`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setResetFeedback('Devices successfully reset!');
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, devicesCount: 0 } : s))
        );
        if (activeStudentModal && activeStudentModal.id === studentId) {
          setActiveStudentModal((prev) => (prev ? { ...prev, devicesCount: 0 } : null));
        }
      } else {
        setResetFeedback(data.error || 'Failed to reset devices');
      }
    } catch (err: any) {
      setResetFeedback(err.message || 'Error resetting devices');
    } finally {
      setResettingId(null);
    }
  };

  const exams = Array.from(
    new Set(students.map((s) => s.targetExam).filter(Boolean) as string[])
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.mobile && s.mobile.includes(searchQuery));
    const matchesExam =
      selectedExamFilter === 'ALL' || s.targetExam === selectedExamFilter;
    return matchesSearch && matchesExam;
  });

  const totalRegistered = students.length;
  const activePaid = students.filter((s) => s.totalPurchases > 0).length;
  const totalTests = students.reduce((sum, s) => sum + s.totalTests, 0);
  const totalLTV = students.reduce((sum, s) => sum + s.totalSpent, 0);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor registered aspirants, test attempts, unlock history, and learning engagement.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Aspirants</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRegistered}</div>
          <div className="text-[11px] text-slate-500">Lifetime registrations</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Paying Students</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{activePaid}</div>
          <div className="text-[11px] text-slate-500">
            {totalRegistered > 0 ? Math.round((activePaid / totalRegistered) * 100) : 0}% conversion rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tests Attempted</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTests}</div>
          <div className="text-[11px] text-slate-500">Practice & mock tests</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">₹{totalLTV.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500">From bundle purchases</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Target Exam:</label>
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="ALL">All Target Exams</option>
            {exams.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden animate-fade-in">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No students found matching your search or filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Target Exam</th>
                  <th className="px-6 py-4">Bundles Unlocked</th>
                  <th className="px-6 py-4">Devices Bound</th>
                  <th className="px-6 py-4">Tests Taken</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                          {student.mobile && (
                            <div className="text-[11px] text-slate-400">{student.mobile}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.targetExam ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          {student.targetExam}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.totalPurchases > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          {student.totalPurchases} bundle{student.totalPurchases > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          (student.devicesCount || 0) >= 2
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : (student.devicesCount || 0) === 1
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        {student.devicesCount || 0} / 2 Devices
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                      {student.totalTests} tests
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{student.totalSpent}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(student.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveStudentModal(student)}
                        className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
                      >
                        View Bundles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Student Bundles Modal */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {activeStudentModal.name}&apos;s Learning Activity
                </h3>
                <p className="text-xs text-slate-500">{activeStudentModal.email}</p>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Purchased Bundles ({activeStudentModal.purchasedBundles.length})
                </h4>
                {activeStudentModal.purchasedBundles.length === 0 ? (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    This student hasn&apos;t purchased any bundles yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeStudentModal.purchasedBundles.map((bName, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-bold text-slate-800">{bName}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Active Access
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">Total Tests Taken</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{activeStudentModal.totalTests}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">Total Lifetime Value</span>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">₹{activeStudentModal.totalSpent}</p>
                </div>
              </div>

              {/* Hardware Device Security */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Device Binding: {activeStudentModal.devicesCount || 0} / 2 Registered
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Prevents credential sharing across unauthorized devices
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdminResetDevices(activeStudentModal.id)}
                    disabled={resettingId === activeStudentModal.id || (activeStudentModal.devicesCount || 0) === 0}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-2xs"
                  >
                    {resettingId === activeStudentModal.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Student Devices
                      </>
                    )}
                  </button>
                </div>
                {resetFeedback && (
                  <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
                    {resetFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setActiveStudentModal(null);
                  setResetFeedback(null);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
