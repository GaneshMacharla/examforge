'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  subjects: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
    }[];
  }[];
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

export default function BulkUploadQuestionsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

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
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      const res = await fetch('/api/admin/curriculum');
      if (res.ok) {
        const data = await res.json();
        const examList: Exam[] = Array.isArray(data.exams)
          ? data.exams
          : Array.isArray(data)
          ? data
          : [];
        setExams(examList);
        if (examList.length > 0) {
          setSelectedExamId(examList[0].id);
          if (examList[0].subjects && examList[0].subjects.length > 0) {
            setSelectedSubjectId(examList[0].subjects[0].id);
            if (
              examList[0].subjects[0].topics &&
              examList[0].subjects[0].topics.length > 0
            ) {
              setSelectedTopicId(examList[0].subjects[0].topics[0].id);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load curriculum', err);
    }
  };

  const safeExams = Array.isArray(exams) ? exams : [];
  const selectedExam = safeExams.find((e) => e.id === selectedExamId);
  const availableSubjects =
    selectedExam && Array.isArray(selectedExam.subjects)
      ? selectedExam.subjects
      : [];
  const selectedSubject = availableSubjects.find((s) => s.id === selectedSubjectId);
  const availableTopics =
    selectedSubject && Array.isArray(selectedSubject.topics)
      ? selectedSubject.topics
      : [];

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    const exam = safeExams.find((e) => e.id === examId);
    if (exam && exam.subjects && exam.subjects.length > 0) {
      setSelectedSubjectId(exam.subjects[0].id);
      if (exam.subjects[0].topics && exam.subjects[0].topics.length > 0) {
        setSelectedTopicId(exam.subjects[0].topics[0].id);
      } else {
        setSelectedTopicId('');
      }
    } else {
      setSelectedSubjectId('');
      setSelectedTopicId('');
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = availableSubjects.find((s) => s.id === subjectId);
    if (subject && subject.topics && subject.topics.length > 0) {
      setSelectedTopicId(subject.topics[0].id);
    } else {
      setSelectedTopicId('');
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
      '"What is the value of 15% of 240?"',
      '"32"',
      '"36"',
      '"40"',
      '"42"',
      '"B"',
      '"15% of 240 = (15/100) * 240 = 36."',
      '"Easy"',
      '"Percentages, SSC CGL 2023"',
    ];

    const sampleRow2 = [
      '"If A and B can complete a work in 12 days and B alone can do it in 20 days, how many days will A alone take?"',
      '"25 days"',
      '"30 days"',
      '"35 days"',
      '"28 days"',
      '"B"',
      '"1/A = 1/12 - 1/20 = (5-3)/60 = 2/60 = 1/30. Hence, A alone takes 30 days."',
      '"Medium"',
      '"Time and Work, Banking"',
    ];

    const csvData = [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'questions_upload_template.csv');
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

    if (!selectedSubjectId || !selectedTopicId) {
      setErrorMsg('Please select a Subject and Topic target before importing.');
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
          subjectId: selectedSubjectId,
          topicId: selectedTopicId,
          validRowsToImport: validationResult.validRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportStatus({
        success: true,
        message: data.message || `Successfully imported ${data.importedCount} questions!`,
      });
      setValidationResult(null);
      setCsvContent('');
      setFileName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/questions"
              className="text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Question Bank
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Upload className="w-8 h-8 text-indigo-600" />
            Bulk Question Uploader
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload questions in bulk via CSV format with automated pre-validation and error detection.
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
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Error</p>
            <p className="text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {importStatus && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 mt-0.5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <h3 className="font-black text-base text-emerald-900">Import Successful!</h3>
            <p className="text-xs mt-1 text-emerald-700">{importStatus.message}</p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/admin/questions"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                View in Question Bank
              </Link>
              <Link
                href="/admin/bundles"
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition border border-slate-300"
              >
                Create Bundle With These Questions
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Target Destination Setup */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
            1
          </span>
          Select Destination Curriculum
        </h2>
        <p className="text-xs text-slate-500 mb-4 ml-8">
          Imported questions will be associated with this Exam, Subject, and Topic hierarchy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-8">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              {safeExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              disabled={availableSubjects.length === 0}
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              disabled={availableTopics.length === 0}
            >
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CSV File Upload Section */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
            2
          </span>
          Select or Paste CSV Data
        </h2>
        <p className="text-xs text-slate-500 mb-4 ml-8">
          Upload your .csv file with columns:{' '}
          <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[11px]">
            question, option a, option b, option c, option d, answer, explanation, difficulty, tags
          </code>.
        </p>

        <div className="ml-8 space-y-4">
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

          <details className="text-xs text-slate-500 group">
            <summary className="cursor-pointer hover:text-slate-800 transition select-none flex items-center gap-1 font-bold">
              Or paste raw CSV text directly ▾
            </summary>
            <div className="mt-3">
              <textarea
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setValidationResult(null);
                }}
                rows={6}
                placeholder={`question,option a,option b,option c,option d,answer,explanation,difficulty,tags\n"What is 2+2?","3","4","5","6","B","2+2 is 4","Easy","Arithmetic"`}
                className="w-full bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </details>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleValidate}
              disabled={!csvContent.trim() || isValidating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating CSV...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Validate & Preview Data
                </>
              )}
            </button>
            {fileName && (
              <button
                onClick={() => {
                  setCsvContent('');
                  setFileName('');
                  setValidationResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition"
              >
                Clear file
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Results & Preview */}
      {validationResult && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                  3
                </span>
                Validation Summary
              </h2>
              <p className="text-xs text-slate-500 ml-8 mt-0.5">
                Review verified rows and any detected format errors before committing into the Question Bank.
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={validationResult.validCount === 0 || isImporting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing {validationResult.validCount} Questions...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import {validationResult.validCount} Valid Questions
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
              <p className="text-xs text-emerald-700 font-bold uppercase">Valid Ready to Import</p>
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
                Valid Questions Preview (Showing first 5 of {validationResult.validCount})
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
