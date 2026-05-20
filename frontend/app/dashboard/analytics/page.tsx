"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Images, Search, Download, CalendarDays, TrendingUp, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";

type Stats = { totalPhotos: number; totalSearches: number; totalDownloads: number; totalEvents: number };

const PIE_COLORS = ["#FF2D78", "#A855F7", "#0D9488", "#F59E0B"];

const weeklyData = [
  { day: "Mon", searches: 8,  downloads: 5  },
  { day: "Tue", searches: 15, downloads: 11 },
  { day: "Wed", searches: 12, downloads: 8  },
  { day: "Thu", searches: 22, downloads: 17 },
  { day: "Fri", searches: 30, downloads: 22 },
  { day: "Sat", searches: 42, downloads: 35 },
  { day: "Sun", searches: 25, downloads: 18 },
];

const pieData = [
  { name: "Portraits", value: 40 },
  { name: "Groups",    value: 30 },
  { name: "Candid",    value: 20 },
  { name: "Other",     value: 10 },
];

const monthlyData = [
  { month: "Jan", events: 2, photos: 340 },
  { month: "Feb", events: 3, photos: 520 },
  { month: "Mar", events: 5, photos: 890 },
  { month: "Apr", events: 4, photos: 670 },
  { month: "May", events: 6, photos: 1100 },
  { month: "Jun", events: 3, photos: 480 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/photographer/stats").then(r => setStats((r.data as Stats))).catch(() => {});
  }, []);

  const statCards = [
    { icon: <Images size={18} />,      label: "Total Photos",    value: stats?.totalPhotos    ?? 0, accent: "#FF2D78", bg: "rgba(255,45,120,0.08)",  border: "rgba(255,45,120,0.15)",  trend: "+12%" },
    { icon: <Search size={18} />,      label: "Total Searches",  value: stats?.totalSearches  ?? 0, accent: "#A855F7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.15)",  trend: "+28%" },
    { icon: <Download size={18} />,    label: "Total Downloads", value: stats?.totalDownloads ?? 0, accent: "#0D9488", bg: "rgba(13,148,136,0.08)",  border: "rgba(13,148,136,0.15)",  trend: "+18%" },
    { icon: <CalendarDays size={18} />,label: "Total Events",    value: stats?.totalEvents    ?? 0, accent: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.15)",  trend: "+3"   },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-deep">Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Track your event performance and engagement</p>
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
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ background: s.bg, color: s.accent }}>
                <ArrowUpRight size={10} />{s.trend}
              </span>
            </div>
            <div className="font-black text-2xl text-deep stat-number">{s.value.toLocaleString()}</div>
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
              <p className="text-slate-400 text-xs mt-0.5">Searches vs downloads this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Searches</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#A855F7" }} />Downloads</span>
            </div>
          </div>
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
        </motion.div>

        {/* Photo categories donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="rounded-3xl p-6 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
        >
          <div className="mb-5">
            <h2 className="font-bold text-base text-deep">Photo Categories</h2>
            <p className="text-slate-400 text-xs mt-0.5">Distribution by type</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(255,45,120,0.15)", borderRadius: "12px", color: "#1e293b", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-deep">{d.value}%</span>
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
      </motion.div>

      {/* Insight cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Avg photos / event", value: stats ? Math.round((stats.totalPhotos || 0) / Math.max(stats.totalEvents || 1, 1)) : "—", accent: "#FF2D78", bg: "rgba(255,45,120,0.06)", border: "rgba(255,45,120,0.12)", icon: <TrendingUp size={16} /> },
          { label: "Search-to-download", value: stats && stats.totalSearches > 0 ? `${Math.round((stats.totalDownloads / stats.totalSearches) * 100)}%` : "—", accent: "#A855F7", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.12)", icon: <Download size={16} /> },
          { label: "Avg searches / event", value: stats ? Math.round((stats.totalSearches || 0) / Math.max(stats.totalEvents || 1, 1)) : "—", accent: "#0D9488", bg: "rgba(13,148,136,0.06)", border: "rgba(13,148,136,0.12)", icon: <Search size={16} /> },
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
            <div className="font-black text-3xl text-deep stat-number">{c.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
