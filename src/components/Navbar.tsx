'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  targetExam?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleQuickLogin = async (type: 'student' | 'admin') => {
    const credentials =
      type === 'admin'
        ? { identifier: 'admin@examhub.com', password: 'admin123' }
        : { identifier: 'rahul@gmail.com', password: 'student123' };

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student/dashboard');
      }
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  ExamForge
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block -mt-1">
                  Practice Questions
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/bundles"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/bundles'
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Explore Bundles
              </Link>
              {user?.role === 'STUDENT' && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/student/dashboard'
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/student/purchases"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/student/purchases'
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Purchases
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/admin')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600">
              <span className="font-semibold text-slate-500 pl-1">Demo:</span>
              <button
                onClick={() => handleQuickLogin('student')}
                className="px-2 py-0.5 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 font-medium transition-colors shadow-xs"
                title="Log in as Rahul (Student)"
              >
                Rahul (Student)
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-2 py-0.5 rounded-full bg-white hover:bg-violet-50 hover:text-violet-600 border border-slate-200 text-slate-700 font-medium transition-colors shadow-xs"
                title="Log in as Super Admin"
              >
                Admin
              </button>
            </div>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3 pl-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-1 justify-end">
                        {user.name}
                        {user.role === 'ADMIN' && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Log out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/bundles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore Bundles
          </Link>
          {user?.role === 'STUDENT' && (
            <>
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Dashboard
              </Link>
              <Link
                href="/student/purchases"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Purchases
              </Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 font-semibold bg-indigo-50"
            >
              Admin Portal
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Switch Demo User
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  handleQuickLogin('student');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 rounded-md font-medium text-center"
              >
                Rahul (Student)
              </button>
              <button
                onClick={() => {
                  handleQuickLogin('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-slate-100 hover:bg-violet-50 text-slate-700 rounded-md font-medium text-center"
              >
                Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 rounded-md font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-sm font-medium border border-slate-200 rounded-lg text-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
