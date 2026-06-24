"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Images, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

type AdminStats = {
  totalUsers: number; totalPhotographers: number;
  totalAdmins: number; totalBanned: number;
  totalEvents: number; activeEvents: number;
  totalPhotos: number; totalSearches: number; totalDownloads: number;
  planBreakdown: { free: number; pro: number; studio: number };
  monthlyRegistrations: { month: string; users: number }[];
  monthlyPhotos: { month: string; photos: number }[];
  storageUsedGB: number;
};

const tooltipStyle = {
  background: "#fff", border: "1px solid rgba(239,68,68,0.15)",
  borderRadius: "12px", color: "#1A0A12",
  boxShadow: "0 4px 20px rgba(239,68,68,0.08)", fontSize: 12,
};

const PIE_COLORS = ["#94A3B8", "#EF4444", "#A855F7"];

export default function AdminAnalyticsPage() {
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/stats")
      .then(r => setStats(r.data as AdminStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const s = stats;

  const pieData = [
    { name: "Free",   value: s?.planBreakdown.free   ?? 0 },
    { name: "Pro",    value: s?.planBreakdown.pro    ?? 0 },
    { name: "Studio", value: s?.planBreakdown.studio ?? 0 },
  ];

  const kpis = [
    { icon: <Users size={18} />,    label: "Total Users",    value: s?.totalUsers    ?? 0, color: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { icon: <Images size={18} />,   label: "Total Photos",   value: s?.totalPhotos   ?? 0, color: "linear-gradient(135deg,#FF2D78,#FF6B9D)" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-deep tracking-tight">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Platform-wide metrics and trends</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-deep transition-colors"
          style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: k.color }}>{k.icon}</div>
              <TrendingUp size={14} className="text-slate-300" />
            </div>
            <div>
              <div className="text-2xl font-black text-deep stat-number">
                {loading ? "—" : k.value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{k.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan pie chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h2 className="font-bold text-deep text-base mb-5">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ color: "#64748B", fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Engagement summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.51 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h2 className="font-bold text-deep text-base mb-5">Engagement Summary</h2>
          <div className="space-y-4">
            {[
              { label: "Photos per Event",    value: s ? ((s.totalPhotos / Math.max(s.totalEvents, 1)).toFixed(1)) : "—", color: "#FF2D78" },
              { label: "Active Event Rate",   value: s ? `${Math.round((s.activeEvents / Math.max(s.totalEvents, 1)) * 100)}%` : "—", color: "#10B981" },
              { label: "Ban Rate",            value: s ? `${Math.round((s.totalBanned / Math.max(s.totalUsers, 1)) * 100)}%` : "—", color: "#EF4444" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(239,68,68,0.06)" }}>
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className="text-sm font-black stat-number" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
