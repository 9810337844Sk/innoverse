"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users, CalendarDays, Images, Search, Download,
  TrendingUp, UserX, Camera, User, Shield,
  HardDrive, Activity,
} from "lucide-react";
import api from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

type AdminStats = {
  totalUsers: number; totalPhotographers: number; totalGuests: number;
  totalAdmins: number; totalBanned: number;
  totalEvents: number; activeEvents: number;
  totalPhotos: number; totalSearches: number; totalDownloads: number;
  planBreakdown: { free: number; pro: number; studio: number };
  monthlyRegistrations: { month: string; users: number }[];
  monthlyPhotos: { month: string; photos: number }[];
  storageUsedGB: number;
};

function StatCard({
  icon, label, value, sub, color, delay = 0,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-5 flex flex-col gap-3"
      style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: color }}>
          {icon}
        </div>
        <TrendingUp size={14} className="text-slate-300" />
      </div>
      <div>
        <div className="text-2xl font-black text-deep tracking-tight stat-number">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-sm text-slate-500 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </motion.div>
  );
}

const tooltipStyle = {
  background: "#fff",
  border: "1px solid rgba(255,45,120,0.15)",
  borderRadius: "12px",
  color: "#1A0A12",
  boxShadow: "0 4px 20px rgba(255,45,120,0.08)",
  fontSize: 12,
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(r => setStats(r.data as AdminStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl text-deep tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time stats across all users, events and photos</p>
      </div>

      {/* ── Primary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0}    icon={<Users size={18} />}      label="Total Users"    value={loading ? "—" : s?.totalUsers ?? 0}    color="linear-gradient(135deg,#6366F1,#8B5CF6)" sub={`${s?.totalBanned ?? 0} banned`} />
        <StatCard delay={0.07} icon={<Camera size={18} />}     label="Photographers"  value={loading ? "—" : s?.totalPhotographers ?? 0} color="linear-gradient(135deg,#FF2D78,#FF6B9D)" sub={`${s?.totalGuests ?? 0} guests`} />
        <StatCard delay={0.14} icon={<CalendarDays size={18} />} label="Total Events" value={loading ? "—" : s?.totalEvents ?? 0}   color="linear-gradient(135deg,#0D9488,#14B8A6)" sub={`${s?.activeEvents ?? 0} active`} />
        <StatCard delay={0.21} icon={<Images size={18} />}     label="Photos Uploaded" value={loading ? "—" : s?.totalPhotos ?? 0}  color="linear-gradient(135deg,#F59E0B,#FBBF24)" sub={`${s?.storageUsedGB ?? 0} GB used`} />
      </div>

      {/* ── Secondary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.28} icon={<Search size={18} />}    label="Face Searches"  value={loading ? "—" : s?.totalSearches ?? 0}  color="linear-gradient(135deg,#A855F7,#C084FC)" />
        <StatCard delay={0.35} icon={<Download size={18} />}  label="Downloads"      value={loading ? "—" : s?.totalDownloads ?? 0} color="linear-gradient(135deg,#3B82F6,#60A5FA)" />
        <StatCard delay={0.42} icon={<UserX size={18} />}     label="Banned Users"   value={loading ? "—" : s?.totalBanned ?? 0}    color="linear-gradient(135deg,#EF4444,#F87171)" />
        <StatCard delay={0.49} icon={<HardDrive size={18} />} label="Storage Used"   value={loading ? "—" : `${s?.storageUsedGB ?? 0} GB`} color="linear-gradient(135deg,#64748B,#94A3B8)" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly registrations */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} style={{ color: "#6366F1" }} />
            <h2 className="font-bold text-deep text-base">User Registrations</h2>
            <span className="ml-auto text-xs text-slate-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s?.monthlyRegistrations ?? []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#A5B4FC" />
                </linearGradient>
              </defs>
              <Bar dataKey="users" name="Users" fill="url(#regGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly photos */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Images size={16} style={{ color: "#FF2D78" }} />
            <h2 className="font-bold text-deep text-base">Photos Uploaded</h2>
            <span className="ml-auto text-xs text-slate-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={s?.monthlyPhotos ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="photos" name="Photos" stroke="#FF2D78" strokeWidth={2.5}
                dot={{ fill: "#FF2D78", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#FF2D78", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Plan breakdown + role breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <h2 className="font-bold text-deep text-base mb-5">Plan Distribution</h2>
          <div className="space-y-4">
            {[
              { label: "Free",   value: s?.planBreakdown.free   ?? 0, color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
              { label: "Pro",    value: s?.planBreakdown.pro    ?? 0, color: "#FF2D78", bg: "rgba(255,45,120,0.08)" },
              { label: "Studio", value: s?.planBreakdown.studio ?? 0, color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
            ].map(p => {
              const total = (s?.totalUsers ?? 1) || 1;
              const pct = Math.round((p.value / total) * 100);
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-deep">{p.label}</span>
                    <span className="text-sm font-bold text-deep">{p.value.toLocaleString()} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: p.bg }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Role breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.67 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <h2 className="font-bold text-deep text-base mb-5">User Roles</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <User size={20} />,   label: "Guests",        value: s?.totalGuests        ?? 0, color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
              { icon: <Camera size={20} />, label: "Photographers", value: s?.totalPhotographers ?? 0, color: "#FF2D78", bg: "rgba(255,45,120,0.08)" },
              { icon: <Shield size={20} />, label: "Admins",        value: s?.totalAdmins        ?? 0, color: "#0D9488", bg: "rgba(13,148,136,0.08)" },
            ].map(r => (
              <div key={r.label} className="rounded-2xl p-4 text-center" style={{ background: r.bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${r.color}20`, color: r.color }}>
                  {r.icon}
                </div>
                <div className="text-xl font-black text-deep stat-number">{r.value.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-0.5">{r.label}</div>
              </div>
            ))}
          </div>

          {/* Banned alert */}
          {(s?.totalBanned ?? 0) > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <UserX size={15} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 font-medium">
                {s?.totalBanned} user{(s?.totalBanned ?? 0) > 1 ? "s are" : " is"} currently banned
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
