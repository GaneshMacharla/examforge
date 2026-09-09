'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { TableSkeleton } from '@/components/Skeleton';

interface Order {
  id: string;
  orderCode: string;
  studentName: string;
  studentEmail: string;
  studentMobile: string | null;
  bundleName: string;
  bundleId: string;
  amount: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  date: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.bundleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0);

  const successfulOrders = orders.filter((o) => o.status === 'PAID').length;
  const aov = successfulOrders > 0 ? Math.round(totalRevenue / successfulOrders) : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            Orders & Revenue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Razorpay payment transactions, order reconciliation, and revenue analytics.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Direct via Razorpay Gateway</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid Transactions</span>
            <Receipt className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{successfulOrders}</div>
          <div className="text-[11px] text-slate-500">100% fulfillment rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Order Value</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">₹{aov}</div>
          <div className="text-[11px] text-slate-500">Per paying student</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order code, student, bundle, pay ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Payment Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">PAID (Successful)</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden animate-fade-in">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Order Code</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Bundle Purchased</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Razorpay Reference</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {order.orderCode}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900">{order.studentName}</div>
                        <div className="text-xs text-slate-500">{order.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                      {order.bundleName}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{order.amount}
                    </td>
                    <td className="px-6 py-4">
                      {order.razorpayPaymentId ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                          <span className="truncate max-w-[120px]">{order.razorpayPaymentId}</span>
                          <button
                            onClick={() => handleCopy(order.razorpayPaymentId!, order.id)}
                            className="p-1 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                            title="Copy Razorpay Payment ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Simulated / None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(order.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PAID
                        </span>
                      ) : order.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
