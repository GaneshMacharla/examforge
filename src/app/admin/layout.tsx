'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  Upload,
  Users,
  ShoppingBag,
  ShieldAlert,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push('/login?redirect=/admin');
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => router.push('/login?redirect=/admin'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-sm font-semibold">Verifying Admin Permissions...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/bundles', label: 'Bundle Manager', icon: Layers },
    { href: '/admin/questions', label: 'Question Bank', icon: HelpCircle, exact: true },
    { href: '/admin/questions/bulk-upload', label: 'Bulk Upload CSV', icon: Upload },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/orders', label: 'Sales & Orders', icon: ShoppingBag },
  ];

  const currentNav = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  ) || navItems[0];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-16 z-30 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Admin</span>
            <span className="text-xs font-extrabold text-indigo-400 truncate">{currentNav.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/bundles"
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg border border-slate-700"
          >
            Store
          </Link>
          <button
            onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            aria-label="Toggle admin navigation"
          >
            <span>{mobileAdminMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
        </div>
      </div>

      {/* Mobile Admin Navigation Drawer */}
      {mobileAdminMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150 z-30">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileAdminMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-slate-900 text-white p-5 space-y-6 shrink-0 border-r border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Control</span>
          </div>
          <p className="text-[11px] text-slate-400">Exam Platform Management</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/bundles"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
