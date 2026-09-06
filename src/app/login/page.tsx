'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
  Smartphone,
  AlertTriangle,
  X,
} from 'lucide-react';
import { getClientDeviceInfo } from '@/lib/device';

interface DeviceLimitPayload {
  error: string;
  message: string;
  registeredDevices: Array<{
    id: string;
    name: string;
    lastActiveAt: string;
  }>;
  canReset: boolean;
  cooldownUntil: string | null;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/student/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Device limit modal state
  const [deviceLimitData, setDeviceLimitData] = useState<DeviceLimitPayload | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDeviceLimitData(null);

    try {
      const deviceInfo = getClientDeviceInfo();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          deviceFingerprint: deviceInfo.deviceFingerprint,
          deviceName: deviceInfo.deviceName,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === 'DEVICE_LIMIT_EXCEEDED') {
        setDeviceLimitData(data);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setIdentifier('rahul@gmail.com');
      setPassword('student123');
    } else {
      setIdentifier('admin@examhub.com');
      setPassword('admin123');
    }
    setDeviceLimitData(null);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">
          Log in to access your purchased question bundles and practice tests.
        </p>
      </div>

      {/* Demo Credentials Quick-Fill Pills */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
          Quick Demo Login
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('student')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs font-semibold text-slate-700 text-left transition-colors shadow-xs cursor-pointer"
          >
            <div className="text-indigo-600 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Rahul (Student)
            </div>
            <div className="text-[10px] text-slate-400">rahul@gmail.com</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-violet-400 hover:bg-violet-50/40 text-xs font-semibold text-slate-700 text-left transition-colors shadow-xs cursor-pointer"
          >
            <div className="text-violet-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </div>
            <div className="text-[10px] text-slate-400">admin@examhub.com</div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email or Mobile Number
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. rahul@gmail.com or 9876543210"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-bold text-indigo-600 hover:underline">
          Register here
        </Link>
      </div>

      {/* Device Limit Modal */}
      {deviceLimitData && (
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
                onClick={() => setDeviceLimitData(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To protect practice test questions and prevent credential sharing, student accounts are restricted to a maximum of <strong>2 authorized devices</strong> (e.g. your phone and laptop).
            </p>

            {/* Currently registered devices */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Authorized Devices on this Account:
              </span>
              <div className="space-y-2">
                {deviceLimitData.registeredDevices.map((dev, idx) => (
                  <div
                    key={dev.id || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{dev.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Active {new Date(dev.lastActiveAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                      Bound
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Action Notice */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>3rd-Party Login Blocked</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90 font-normal">
                  To prevent illegal credential sharing, you cannot register a 3rd device. If you personally changed your smartphone or computer, please contact the administrator (<strong>admin@examhub.com</strong>) to verify your identity and reset your devices.
                </p>
              </div>

              <button
                onClick={() => setDeviceLimitData(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Understood — Back to Login
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
