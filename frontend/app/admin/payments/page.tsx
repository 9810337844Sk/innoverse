"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, CreditCard, CheckCircle, XCircle, Clock,
  Calendar, User, Package, Eye, RefreshCw, Filter,
  TrendingUp, Download, Search, Award,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

type Payment = {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  currency: string;
  status: "success" | "pending" | "failed";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  accessGranted: boolean;
  accessDuration: number; // in days
  expiresAt?: string;
};

type PaymentStats = {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  monthlyRevenue: { month: string; amount: number }[];
};

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  free:   { color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  pro:    { color: "#FF2D78", bg: "rgba(255,45,120,0.1)" },
  studio: { color: "#A855F7", bg: "rgba(168,85,247,0.1)" },
};

const STATUS_COLORS = {
  success: { color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: <CheckCircle size={12} /> },
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: <Clock size={12} /> },
  failed:  { color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={12} /> },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/payments"),
      api.get("/admin/payments/stats"),
    ])
      .then(([paymentsRes, statsRes]) => {
        setPayments((paymentsRes.data as { payments: Payment[] }).payments);
        setStats((statsRes.data as PaymentStats));
      })
      .catch(() => toast.error("Failed to load payment data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleAccess = async (payment: Payment) => {
    setActionId(payment._id);
    try {
      const newAccessStatus = !payment.accessGranted;
      await api.patch(`/admin/payments/${payment._id}/access`, {
        accessGranted: newAccessStatus,
        accessDuration: 30, // 30 days default
      });
      setPayments(prev => prev.map(p =>
        p._id === payment._id
          ? { ...p, accessGranted: newAccessStatus, expiresAt: newAccessStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined }
          : p
      ));
      toast.success(newAccessStatus ? "Access granted" : "Access revoked");
    } catch {
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = payments.filter(p => {
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase()) ||
                        p.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                        p.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:     payments.length,
    success: payments.filter(p => p.status === "success").length,
    pending: payments.filter(p => p.status === "pending").length,
    failed:  payments.filter(p => p.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-deep tracking-tight">Payment Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            NPR {stats?.totalRevenue.toLocaleString() ?? 0} revenue · {counts.success} successful
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-deep transition-colors"
          style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <DollarSign size={18} />, label: "Total Revenue", value: `NPR ${stats?.totalRevenue.toLocaleString() ?? 0}`, color: "linear-gradient(135deg,#10B981,#14B8A6)" },
          { icon: <CheckCircle size={18} />, label: "Successful", value: stats?.successfulPayments ?? 0, color: "linear-gradient(135deg,#10B981,#34D399)" },
          { icon: <Clock size={18} />, label: "Pending", value: stats?.pendingPayments ?? 0, color: "linear-gradient(135deg,#F59E0B,#FBBF24)" },
          { icon: <XCircle size={18} />, label: "Failed", value: stats?.failedPayments ?? 0, color: "linear-gradient(135deg,#EF4444,#F87171)" },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5"
            style={{ border: "1px solid rgba(16,185,129,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: stat.color }}>
                {stat.icon}
              </div>
              <TrendingUp size={14} className="text-slate-300" />
            </div>
            <div className="text-2xl font-black text-deep">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "all",     label: "All",        count: counts.all },
          { key: "success", label: "Successful", count: counts.success },
          { key: "pending", label: "Pending",    count: counts.pending },
          { key: "failed",  label: "Failed",     count: counts.failed },
        ].map(tab => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            style={statusFilter === tab.key
              ? { background: "linear-gradient(135deg,#10B981,#14B8A6)", color: "white", boxShadow: "0 2px 12px rgba(16,185,129,0.25)" }
              : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }
            }>
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
              style={statusFilter === tab.key
                ? { background: "rgba(255,255,255,0.25)", color: "white" }
                : { background: "#E2E8F0", color: "#64748B" }
              }>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          placeholder="Search by name, email, or transaction ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white text-deep placeholder:text-slate-400 focus:outline-none transition-all"
          style={{ border: "1.5px solid rgba(16,185,129,0.15)" }}
          onFocus={e => { e.target.style.borderColor = "#10B981"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(16,185,129,0.15)"; }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(16,185,129,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(16,185,129,0.08)", background: "#FAFBFC" }}>
                {["User", "Plan", "Amount", "Status", "Transaction ID", "Date", "Access", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(16,185,129,0.05)" }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg skeleton" style={{ width: j === 0 ? 140 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">No payments match your search</td></tr>
              ) : filtered.map((payment, i) => {
                const pc = PLAN_COLORS[payment.plan] ?? PLAN_COLORS.free;
                const sc = STATUS_COLORS[payment.status];
                const busy = actionId === payment._id;
                return (
                  <motion.tr key={payment._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="transition-colors" style={{ borderBottom: "1px solid rgba(16,185,129,0.05)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFBFC")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: "linear-gradient(135deg,#10B981,#14B8A6)" }}>
                          {payment.userName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-deep truncate">{payment.userName}</div>
                          <div className="text-xs text-slate-400 truncate">{payment.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ color: pc.color, background: pc.bg }}>
                        <Package size={10} /> {payment.plan}
                      </span>
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-deep">NPR {payment.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{payment.currency}</div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ color: sc.color, background: sc.bg }}>
                        {sc.icon} {payment.status}
                      </span>
                    </td>
                    {/* Transaction ID */}
                    <td className="px-5 py-4">
                      <div className="text-xs font-mono text-slate-500">{payment.transactionId}</div>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    {/* Access */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={payment.accessGranted
                          ? { color: "#10B981", background: "rgba(16,185,129,0.1)" }
                          : { color: "#94A3B8", background: "rgba(148,163,184,0.1)" }}>
                        {payment.accessGranted ? <><Award size={10} /> Granted</> : <><XCircle size={10} /> Denied</>}
                      </span>
                      {payment.expiresAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          Expires: {new Date(payment.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedPayment(payment)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.15)" }}>
                          <Eye size={11} /> View
                        </button>
                        <button onClick={() => toggleAccess(payment)}
                          disabled={busy || payment.status !== "success"}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={payment.accessGranted
                            ? { background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }
                            : { background: "rgba(16,185,129,0.08)", color: "#10B981", border: "1px solid rgba(16,185,129,0.15)" }}>
                          {busy ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Award size={11} />}
                          {payment.accessGranted ? "Revoke" : "Grant"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 text-xs text-slate-400" style={{ borderTop: "1px solid rgba(16,185,129,0.06)" }}>
            Showing {filtered.length} of {payments.length} payments
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setSelectedPayment(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-lg text-deep">Payment Details</h3>
                <button onClick={() => setSelectedPayment(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                  <XCircle size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold"
                    style={{ background: "linear-gradient(135deg,#10B981,#14B8A6)" }}>
                    {selectedPayment.userName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-deep">{selectedPayment.userName}</div>
                    <div className="text-sm text-slate-500">{selectedPayment.userEmail}</div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Plan", value: selectedPayment.plan, icon: <Package size={14} /> },
                    { label: "Amount", value: `NPR ${selectedPayment.amount.toLocaleString()}`, icon: <DollarSign size={14} /> },
                    { label: "Status", value: selectedPayment.status, icon: STATUS_COLORS[selectedPayment.status].icon },
                    { label: "Method", value: selectedPayment.paymentMethod, icon: <CreditCard size={14} /> },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl" style={{ background: "#FAFBFC", border: "1px solid rgba(16,185,129,0.08)" }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <div className="text-sm font-bold text-deep capitalize">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Transaction ID */}
                <div className="p-3 rounded-xl" style={{ background: "#FAFBFC", border: "1px solid rgba(16,185,129,0.08)" }}>
                  <div className="text-xs text-slate-400 mb-1">Transaction ID</div>
                  <div className="text-xs font-mono text-deep">{selectedPayment.transactionId}</div>
                </div>

                {/* Access Status */}
                <div className="p-4 rounded-xl"
                  style={selectedPayment.accessGranted
                    ? { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }
                    : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPayment.accessGranted ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                    <span className="font-bold text-sm" style={{ color: selectedPayment.accessGranted ? "#10B981" : "#EF4444" }}>
                      Access {selectedPayment.accessGranted ? "Granted" : "Denied"}
                    </span>
                  </div>
                  {selectedPayment.accessGranted && selectedPayment.expiresAt && (
                    <div className="text-xs text-slate-600">
                      Valid until {new Date(selectedPayment.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>
                    Created on {new Date(selectedPayment.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
