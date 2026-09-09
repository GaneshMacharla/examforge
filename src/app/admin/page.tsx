'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  ShoppingBag,
  IndianRupee,
  ArrowUpRight,
  HelpCircle,
  Plus,
  Upload,
} from 'lucide-react';

import { AdminOverviewSkeleton } from '@/components/Skeleton';

interface OverviewData {
  metrics: {
    totalStudents: number;
    totalBundles: number;
    totalQuestions: number;
    totalPurchases: number;
    totalRevenue: number;
  };
  recentPurchases: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    bundleName: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminOverviewSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform performance, content metrics, and recent student orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bundles"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bundle</span>
          </Link>
          <Link
            href="/admin/questions/bulk-upload"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk CSV</span>
          </Link>
        </div>
      </div>

      {/* 1. KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.metrics.totalStudents}</div>
          <div className="text-[11px] text-slate-500">Registered candidates</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Live Bundles</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.metrics.totalBundles}</div>
          <div className="text-[11px] text-slate-500">Available in catalog</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Question Bank</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.metrics.totalQuestions}</div>
          <div className="text-[11px] text-slate-500">Reusable questions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">₹{data.metrics.totalRevenue}</div>
          <div className="text-[11px] text-emerald-700 font-medium">
            {data.metrics.totalPurchases} orders completed
          </div>
        </div>
      </div>

      {/* 2. RECENT PURCHASES TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Purchases</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Bundle</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No purchases yet.
                    </td>
                  </tr>
                ) : (
                  data.recentPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{p.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{p.studentEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.bundleName}</td>
                      <td className="py-3 px-4 font-black text-slate-900">₹{p.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
