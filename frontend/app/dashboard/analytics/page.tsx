"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Images, Search, Download, CalendarDays, TrendingUp, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";

type Stats = {
  totalPhotos: number;
  totalSearches: number;
  totalDownloads: number;
  totalEvents: number;
};

type WeeklyEntry  = { day: string; searches: number; downloads: number };
type MonthlyEntry = { month: string; events: number; photos: number };
type IndexingStats = { indexed: number; pending: number; total: number; drivePhotos: number; directPhotos: number };

type AnalyticsData = {
  stats:          Stats;
  weeklySearches: WeeklyEntry[];
  monthlyGrowth:  MonthlyEntry[];
  indexingStats:  IndexingStats;
};

const PIE_COLORS = ["#FF2D78", "#F59E0B", "#A855F7", "#0D9488"];

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/analytics")
      .then((r) => r.json() as Promise<AnalyticsData>)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stats        = data?.stats;
  const weeklyData   = data?.weeklySearches ?? [];
  const monthlyData  = data?.monthlyGrowth  ?? [];
  const indexing     = data?.indexingStats;

  // Pie data: indexed breakdown
  const pieData = indexing
    ? [
        { name: "Indexed",       value: indexing.indexed     },
        { name: "Pending",       value: indexing.pending     },
        { name: "Drive Photos",  value: indexing.drivePhotos },
        { name: "Direct Upload", value: indexing.directPhotos - indexing.drivePhotos > 0
            ? indexing.directPhotos - indexing.drivePhotos : 0 },
      ].filter((d) => d.value > 0)
    : [{ name: "No photos yet", value: 1 }];

  const statCards = [
    { icon: <Images size={18} />,       label: "Total Photos",    value: stats?.totalPhotos    ?? 0, accent: "#FF2D78", bg: "rgba(255,45,120,0.08)",  border: "rgba(255,45,120,0.15)" },
    { icon: <Search size={18} />,       label: "Total Searches",  value: stats?.totalSearches  ?? 0, accent: "#A855F7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.15)" },
    { icon: <Download size={18} />,     label: "Total Downloads", value: stats?.totalDownloads ?? 0, accent: "#0D9488", bg: "rgba(13,148,136,0.08)",  border: "rgba(13,148,136,0.15)" },
    { icon: <CalendarDays size={18} />, label: "Total Events",    value: stats?.totalEvents    ?? 0, accent: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.15)" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-deep">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your event performance and engagement</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          style={{ background: "rgba(255,45,120,0.07)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.15)" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl p-5 bg-white"
            style={{ border: `1px solid ${s.border}`, boxShadow: `0 2px 16px ${s.bg}` }}
          >
            <div className="mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
            </div>
            <div className="font-black text-2xl text-deep stat-number">
              {loading ? <span className="inline-block w-12 h-6 bg-slate-100 rounded animate-pulse" /> : s.value.toLocaleString()}
            </div>
            <div className="text-slate-400 text-xs font-medium mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Weekly activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-3xl p-6 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-base text-deep">Weekly Activity</h2>
              <p className="text-slate-400 text-xs mt-0.5">Searches vs estimated downloads this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Searches</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#A855F7" }} />Downloads</span>
            </div>
          </div>
          {loading ? (
            <div className="h-[200px] bg-slate-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="as" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF2D78" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FF2D78" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(255,45,120,0.15)", borderRadius: "14px", color: "#1e293b", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="searches"  stroke="#FF2D78" fill="url(#as)" strokeWidth={2} dot={false} name="Searches" />
                <Area type="monotone" dataKey="downloads" stroke="#A855F7" fill="url(#ad)" strokeWidth={2} dot={false} name="Downloads" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Photo indexing breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="rounded-3xl p-6 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
        >
          <div className="mb-5">
            <h2 className="font-bold text-base text-deep">Photo Status</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {indexing?.total ?? 0} photos total
            </p>
          </div>
          {loading ? (
            <div className="h-[180px] bg-slate-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(255,45,120,0.15)", borderRadius: "12px", color: "#1e293b", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-deep">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="rounded-3xl p-6 bg-white"
        style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base text-deep">Monthly Growth</h2>
            <p className="text-slate-400 text-xs mt-0.5">Events created and photos uploaded per month</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#FF2D78" }} />Events</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#0D9488" }} />Photos</span>
          </div>
        </div>
        {loading ? (
          <div className="h-[200px] bg-slate-50 rounded-2xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(255,45,120,0.15)", borderRadius: "14px", color: "#1e293b", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
              <Bar yAxisId="left"  dataKey="events" fill="#FF2D78" radius={[6,6,0,0]} name="Events" />
              <Bar yAxisId="right" dataKey="photos" fill="#0D9488" radius={[6,6,0,0]} name="Photos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Insight cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Avg photos / event",
            value: stats && stats.totalEvents > 0
              ? Math.round(stats.totalPhotos / stats.totalEvents).toLocaleString()
              : "—",
            accent: "#FF2D78", bg: "rgba(255,45,120,0.06)", border: "rgba(255,45,120,0.12)",
            icon: <TrendingUp size={16} />,
          },
          {
            label: "Search-to-download",
            value: stats && stats.totalSearches > 0
              ? `${Math.round((stats.totalDownloads / stats.totalSearches) * 100)}%`
              : "—",
            accent: "#A855F7", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.12)",
            icon: <Download size={16} />,
          },
          {
            label: "Photos indexed",
            value: indexing && indexing.total > 0
              ? `${Math.round((indexing.indexed / indexing.total) * 100)}%`
              : "—",
            accent: "#0D9488", bg: "rgba(13,148,136,0.06)", border: "rgba(13,148,136,0.12)",
            icon: <Search size={16} />,
          },
        ].map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
            className="rounded-2xl p-5 bg-white"
            style={{ border: `1px solid ${c.border}`, boxShadow: `0 2px 12px ${c.bg}` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <span style={{ color: c.accent }}>{c.icon}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{c.label}</span>
            </div>
            <div className="font-black text-3xl text-deep stat-number">
              {loading ? <span className="inline-block w-16 h-8 bg-slate-100 rounded animate-pulse" /> : c.value}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
