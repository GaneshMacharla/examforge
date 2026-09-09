'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldAlert,
  Smartphone,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Target,
  ArrowRight,
} from 'lucide-react';
import { getClientDeviceInfo } from '@/lib/device';

export default function RegisterPage() {
  const [targetExam, setTargetExam] = useState('SSC CGL');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthRegister = (provider: 'google' | 'sandbox') => {
    setError(null);

    if (!agreedToPolicy) {
      setError(
        'Please review and check the box agreeing to the Single-User & 2-Device Binding Policy to proceed.'
      );
      return;
    }

    setLoadingProvider(provider);
    const deviceInfo = getClientDeviceInfo();

    const params = new URLSearchParams({
      redirect: '/student/dashboard',
      deviceFingerprint: deviceInfo.deviceFingerprint,
      deviceName: deviceInfo.deviceName,
      targetExam,
    });

    window.location.href = `/api/auth/oauth/${provider}?${params.toString()}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of competitive exam aspirants preparing daily. 100% OAuth 2.0 secured.
          </p>
        </div>

        {/* ⚠️ PROMINENT POLICY NOTICE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm text-amber-900 uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important: Single-User & 2-Device Policy</span>
          </div>

          <div className="space-y-2 text-xs text-amber-900/90 leading-relaxed font-normal">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Max 2 Devices Allowed:</strong> Each student account is hardware-bound to a maximum of <strong>2 personal devices</strong> (e.g. 1 smartphone + 1 laptop).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>No Credential Sharing:</strong> Sharing your login or access with others is strictly prohibited and triggers an automatic device lockout.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Encrypted OAuth:</strong> Direct authentication via Google/GitHub eliminates password breaches and keeps your account safe.
              </span>
            </div>
          </div>
        </div>

        {/* Target Exam Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            Primary Target Examination
          </label>
          <select
            value={targetExam}
            onChange={(e) => setTargetExam(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-800 cursor-pointer"
          >
            <option value="SSC CGL">SSC CGL / CHSL (Staff Selection Commission)</option>
            <option value="BANKING">Banking (IBPS PO, SBI PO & Clerk)</option>
            <option value="RRB NTPC">Railway Recruitment Board (RRB NTPC & Group D)</option>
            <option value="UPSC">UPSC Civil Services Prelims (General Studies)</option>
            <option value="APPSC">State PSC Exams (APPSC & TSPSC)</option>
          </select>
        </div>

        {/* Policy Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 cursor-pointer hover:bg-indigo-50/70 transition-colors">
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              I agree to the <strong className="text-indigo-900">Single-User License</strong> and acknowledge that my student account will be bound to my first 2 active devices.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth Registration Button */}
        <div className="pt-2">
          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={() => handleOAuthRegister('google')}
            disabled={Boolean(loadingProvider)}
            className="w-full py-4 px-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loadingProvider === 'google' ? 'Connecting to Google...' : 'Sign Up with Google'}
            </span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In with OAuth
          </Link>
        </div>
      </div>
    </div>
  );
}
