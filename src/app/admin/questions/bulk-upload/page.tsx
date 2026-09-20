'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Layers,
  Plus,
  Eye,
  Check,
} from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  price: number;
  difficulty: string;
  subjectName?: string;
  questionCount: number;
  exam: { id: string; name: string; code: string };
}

interface Exam {
  id: string;
  name: string;
}

interface ValidatedRow {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  tags?: string;
}

interface ValidationError {
  rowNumber: number;
  issue: string;
  raw: any;
}

function BulkUploadContent() {
  const searchParams = useSearchParams();
  const urlBundleId = searchParams.get('bundleId');

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [loadingBundles, setLoadingBundles] = useState(true);

  // Quick Inline Bundle Creation State
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [creatingBundle, setCreatingBundle] = useState(false);
  const [newBundleData, setNewBundleData] = useState({
    name: '',
    description: '',
    examId: '',
    subjectName: 'General Studies',
    difficulty: 'Mixed',
    price: 49,
  });

  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [validationResult, setValidationResult] = useState<{
    totalDetected: number;
    validCount: number;
    errorCount: number;
    errors: ValidationError[];
    validRows: ValidatedRow[];
  } | null>(null);

  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    importedCount: number;
    bundleId: string;
    bundleName: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingBundles(true);
    try {
      const [bundlesRes, examsRes] = await Promise.all([
        fetch('/api/admin/bundles'),
        fetch('/api/exams'),
      ]);

      const [bundlesData, examsData] = await Promise.all([
        bundlesRes.json(),
        examsRes.json(),
      ]);

      const loadedBundles: Bundle[] = bundlesData.bundles || [];
      const loadedExams: Exam[] = examsData.exams || [];

      setBundles(loadedBundles);
      setExams(loadedExams);

      if (loadedExams.length > 0) {
        setNewBundleData((prev) => ({ ...prev, examId: loadedExams[0].id }));
      }

      // If URL specified a bundleId, auto-select it
      if (urlBundleId && loadedBundles.some((b) => b.id === urlBundleId)) {
        setSelectedBundleId(urlBundleId);
      } else if (loadedBundles.length > 0) {
        setSelectedBundleId(loadedBundles[0].id);
      } else {
        // If no bundles exist yet, default open the quick create bundle form
        setShowCreateBundle(true);
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setLoadingBundles(false);
    }
  };

  const handleQuickCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBundleData.name.trim() || !newBundleData.examId) return;

    setCreatingBundle(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBundleData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create bundle');
      }

      // Reload bundles and select the newly created bundle
      const updatedBundlesRes = await fetch('/api/admin/bundles');
      const updatedBundlesData = await updatedBundlesRes.json();
      const updatedList = updatedBundlesData.bundles || [];
      setBundles(updatedList);
      setSelectedBundleId(data.bundle.id);
      setShowCreateBundle(false);
      setNewBundleData({
        name: '',
        description: '',
        examId: exams[0]?.id || '',
        subjectName: 'General Studies',
        difficulty: 'Mixed',
        price: 49,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create bundle');
    } finally {
      setCreatingBundle(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setValidationResult(null);
    setImportStatus(null);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'question',
      'option a',
      'option b',
      'option c',
      'option d',
      'answer',
      'explanation',
      'difficulty',
      'tags',
    ];

    const sampleRow1 = [
      '"What is the speed of sound in dry air at 20 degrees Celsius?"',
      '"Approx 300 m/s"',
      '"Approx 343 m/s"',
      '"Approx 420 m/s"',
      '"Approx 1500 m/s"',
      '"B"',
      '"At 20 degrees Celsius, speed of sound is approximately 343 m/s."',
      '"Easy"',
      '"General Science, Physics"',
    ];

    const sampleRow2 = [
      '"A and B can do a work in 12 days, B alone in 20 days. In how many days can A alone do it?"',
      '"25 days"',
      '"30 days"',
      '"35 days"',
      '"28 days"',
      '"B"',
      '"1/A = 1/12 - 1/20 = 2/60 = 1/30. Hence A alone takes 30 days."',
      '"Medium"',
      '"Quantitative Aptitude, Time and Work"',
    ];

    const csvData = [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'practice_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidate = async () => {
    if (!csvContent.trim()) {
      setErrorMsg('Please upload a CSV file or paste CSV content first.');
      return;
    }

    setIsValidating(true);
    setErrorMsg('');
    setImportStatus(null);

    try {
      const res = await fetch('/api/admin/questions/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          csvContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to validate CSV');
      }

      setValidationResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation request failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      setErrorMsg('No valid rows found to import.');
      return;
    }

    if (!selectedBundleId) {
      setErrorMsg('Please select a Target Bundle to import questions into.');
      return;
    }

    setIsImporting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/questions/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          bundleId: selectedBundleId,
          validRowsToImport: validationResult.validRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportStatus({
        success: true,
        importedCount: data.importedCount,
        bundleId: data.bundleId,
        bundleName: data.bundleName,
        message: data.message || `Successfully imported ${data.importedCount} questions straight into bundle!`,
      });
      setValidationResult(null);
      setCsvContent('');
      setFileName('');

      // Refresh bundles list to reflect new question count
      const updatedBundlesRes = await fetch('/api/admin/bundles');
      const updatedBundlesData = await updatedBundlesRes.json();
      if (updatedBundlesData.bundles) {
        setBundles(updatedBundlesData.bundles);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedBundle = bundles.find((b) => b.id === selectedBundleId);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/bundles"
              className="text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bundle Manager
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Upload className="w-8 h-8 text-indigo-600" />
            Bulk CSV Question Uploader
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload CSV question batches directly into your practice bundles without picking questions by hand.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold transition text-xs shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Sample CSV Template
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Error</p>
            <p className="text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER WITH DIRECT BUNDLE PRACTICE LINK */}
      {importStatus && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg text-emerald-950">Questions Linked Directly to Bundle!</h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                {importStatus.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href={`/practice/${importStatus.bundleId}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview / Test Practice</span>
            </Link>
            <Link
              href="/admin/bundles"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition border border-slate-300"
            >
              View in Bundle Manager
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT TARGET BUNDLE */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                1
              </span>
              Select Target Practice Bundle
            </h2>
            <p className="text-xs text-slate-500 ml-0 sm:ml-8 mt-0.5">
              All questions from the CSV will be automatically attached directly into this bundle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateBundle(!showCreateBundle)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-0 sm:ml-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreateBundle ? 'Hide Bundle Form' : '+ Create New Bundle'}</span>
          </button>
        </div>

        {/* Quick Inline Bundle Creation Box */}
        {showCreateBundle && (
          <form
            onSubmit={handleQuickCreateBundle}
            className="ml-0 sm:ml-8 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                Quick Create Bundle
              </span>
              <span className="text-[11px] text-indigo-600">
                Create now and auto-select for upload
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RRB NTPC General Science Set 1"
                  value={newBundleData.name}
                  onChange={(e) => setNewBundleData({ ...newBundleData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Exam</label>
                <select
                  value={newBundleData.examId}
                  onChange={(e) => setNewBundleData({ ...newBundleData, examId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. General Science"
                  value={newBundleData.subjectName}
                  onChange={(e) => setNewBundleData({ ...newBundleData, subjectName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newBundleData.price}
                  onChange={(e) => setNewBundleData({ ...newBundleData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={creatingBundle}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {creatingBundle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Create & Select Bundle</span>
              </button>
            </div>
          </form>
        )}

        {/* Bundle Selector Dropdown */}
        <div className="ml-0 sm:ml-8 space-y-3">
          {loadingBundles ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : bundles.length === 0 ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs">
              No bundles created yet. Use the <strong>+ Create New Bundle</strong> button above to create one before uploading!
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Bundle
                </label>
                <select
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                >
                  {bundles.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — [{b.exam?.name || 'Exam'}] (₹{b.price} • {b.questionCount} Questions currently)
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Bundle Summary Badge */}
              {selectedBundle && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedBundle.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Exam: <span className="font-semibold text-slate-700">{selectedBundle.exam?.name}</span> •
                        Subject: <span className="font-semibold text-slate-700">{selectedBundle.subjectName || 'General'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">₹{selectedBundle.price}</span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 text-[11px]">
                      {selectedBundle.questionCount} Questions in bundle
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: CSV UPLOAD / PASTE */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
            2
          </span>
          Select or Paste CSV Data
        </h2>
        <p className="text-xs text-slate-500 ml-0 sm:ml-8">
          Upload your .csv file with columns:{' '}
          <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[11px] break-all">
            question, option a, option b, option c, option d, answer, explanation, difficulty, tags
          </code>.
        </p>

        <div className="ml-0 sm:ml-8 space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center transition bg-slate-50/60 relative">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {fileName ? (
                    <span className="text-indigo-600 font-black">{fileName}</span>
                  ) : (
                    'Click to upload or drag and drop a CSV file'
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports standard CSV format up to 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Or Paste Raw CSV Data Directly</label>
              {csvContent && (
                <button
                  onClick={() => {
                    setCsvContent('');
                    setFileName('');
                    setValidationResult(null);
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setValidationResult(null);
                setImportStatus(null);
              }}
              placeholder='question,option a,option b,option c,option d,answer,explanation,difficulty,tags&#10;"What is the SI unit of power?","Joule","Watt","Newton","Pascal","B","Watt is the SI unit of power.","Easy","Physics, Units"'
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleValidate}
              disabled={!csvContent.trim() || isValidating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating CSV Rows...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Validate & Preview Rows
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STEP 3: VALIDATION SUMMARY & COMMIT DIRECTLY INTO BUNDLE */}
      {validationResult && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                  3
                </span>
                Validation Summary
              </h2>
              <p className="text-xs text-slate-500 ml-8 mt-0.5">
                Target Bundle: <strong className="text-indigo-600">{selectedBundle?.name}</strong>. Ready to import and link automatically.
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={validationResult.validCount === 0 || isImporting || !selectedBundleId}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing to Bundle...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import {validationResult.validCount} Questions Straight into Bundle
                </>
              )}
            </button>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase">Total Rows Detected</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{validationResult.totalDetected}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-bold uppercase">Valid Ready for Bundle</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {validationResult.validCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-bold uppercase">Rows with Errors (Skipped)</p>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {validationResult.errorCount}
              </p>
            </div>
          </div>

          {/* Errors Table if any */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Row Errors ({validationResult.errors.length})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-amber-50/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100/70 text-amber-900 uppercase tracking-wider font-bold border-b border-amber-200">
                    <tr>
                      <th className="px-4 py-2.5">Row #</th>
                      <th className="px-4 py-2.5">Issue Found</th>
                      <th className="px-4 py-2.5">Raw Data Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/60 text-slate-700">
                    {validationResult.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-amber-100/30">
                        <td className="px-4 py-2.5 font-mono text-amber-800 font-bold">
                          Row {err.rowNumber}
                        </td>
                        <td className="px-4 py-2.5 text-amber-900 font-medium">{err.issue}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 truncate max-w-xs">
                          {JSON.stringify(err.raw)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valid Rows Preview Table */}
          {validationResult.validRows.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Valid Questions Preview (First 5 of {validationResult.validCount})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Question Text</th>
                      <th className="px-4 py-3">Correct Option</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {validationResult.validRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-slate-400 font-semibold">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-md">
                          <p className="line-clamp-2">{row.questionText}</p>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-normal">
                            Sol: {row.explanation}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            {row.correctAnswer}:{' '}
                            {row[`option${row.correctAnswer}` as keyof ValidatedRow]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {row.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">{row.tags || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BulkUploadQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 max-w-6xl animate-pulse">
          <div className="h-8 bg-slate-200 rounded-xl w-60" />
          <div className="h-40 bg-slate-100 rounded-2xl" />
        </div>
      }
    >
      <BulkUploadContent />
    </Suspense>
  );
}
