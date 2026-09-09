'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  User,
  Smartphone,
  AlertTriangle,
  X,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { getClientDeviceInfo } from '@/lib/device';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/student/dashboard';
  const urlError = searchParams.get('error');

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [deviceLimitModalOpen, setDeviceLimitModalOpen] = useState(false);

  // Email & Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError === 'DEVICE_LIMIT_EXCEEDED') {
      setDeviceLimitModalOpen(true);
    }
  }, [urlError]);

  const handleOAuthLogin = (provider: 'google' | 'sandbox', demoRole?: 'STUDENT' | 'ADMIN') => {
    setLoadingProvider(demoRole ? `${provider}_${demoRole}` : provider);
    const deviceInfo = getClientDeviceInfo();

    const params = new URLSearchParams({
      redirect,
      deviceFingerprint: deviceInfo.deviceFingerprint,
      deviceName: deviceInfo.deviceName,
    });

    if (demoRole) {
      params.set('demoRole', demoRole);
    }

    // Direct browser navigation to OAuth initiate endpoint
    window.location.href = `/api/auth/oauth/${provider}?${params.toString()}`;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const deviceInfo = getClientDeviceInfo();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password,
          deviceFingerprint: deviceInfo.deviceFingerprint,
          deviceName: deviceInfo.deviceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'DEVICE_LIMIT_EXCEEDED') {
          setDeviceLimitModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      if (data.user?.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = redirect.startsWith('/login') ? '/student/dashboard' : redirect;
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to ExamForge</h1>
        <p className="text-xs text-slate-500">
          Sign in to access your practice tests or admin dashboard.
        </p>
      </div>

      {(urlError && urlError !== 'DEVICE_LIMIT_EXCEEDED') || loginError ? (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{loginError || urlError}</span>
        </div>
      ) : null}

      {/* Main OAuth Buttons */}
      <div className="space-y-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={Boolean(loadingProvider) || isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 group"
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
            {loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
          </span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full"></div>
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          or sign in with password
        </span>
      </div>

      {/* Password Form */}
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Email or Mobile
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@examforge.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(loadingProvider)}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        First time here?{' '}
        <Link href="/register" className="font-bold text-indigo-600 hover:underline">
          Create student account
        </Link>
      </div>

      {/* Device Limit Modal */}
      {deviceLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Device Limit Reached (2/2)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Account Sharing Protection</p>
                </div>
              </div>
              <button
                onClick={() => setDeviceLimitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To protect practice test questions and prevent credential sharing, student accounts are restricted to a maximum of <strong>2 authorized devices</strong> (e.g. your phone and laptop).
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>New Device Blocked</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90 font-normal">
                  Your account is already active on 2 other devices. To use this device, please log in from one of your previously registered devices to manage your sessions, or contact <strong>admin@examhub.com</strong>.
                </p>
              </div>

              <button
                onClick={() => setDeviceLimitModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Understood — Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
