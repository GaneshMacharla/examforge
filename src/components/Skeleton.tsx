import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

// Exact Skeleton for Dashboard Stat Metric Cards
export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-3 w-36 rounded-md" />
      </div>
    </div>
  );
}

// Exact Skeleton for Question Store Bundle Cards
export function BundleCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
      <div>
        {/* Thumbnail skeleton */}
        <Skeleton className="w-full h-44 rounded-none" />
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-3/4 rounded-md" />
          </div>
          <div className="space-y-1.5 pt-2">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-5/6 rounded-md" />
          </div>
        </div>
      </div>
      <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12 rounded-sm" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

// Exact Skeleton for Table Rows (Recent Purchases, Students, Orders)
export function TableSkeleton({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-4 px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[200px]">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-40 rounded-md hidden md:block" />
            <Skeleton className="h-6 w-16 rounded-md hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-md hidden lg:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Full Dashboard Overview Skeleton Loading Page
export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table Section */}
      <TableSkeleton rows={4} />
    </div>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-xs animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>
      <div className="space-y-2 py-1">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PurchasedBundleSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 max-w-md rounded-md" />
        <div className="flex items-center gap-4 pt-1">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded-md hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center sm:flex-col sm:items-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}


