"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users, CalendarDays, Images, TrendingUp,
  Activity, HardDrive,
} from "lucide-react";
import api from "@/lib/api";

type DashboardStats = {
  totalUsers: number;
  totalPhotographers: number;
  totalAdmins: number;
  totalBanned: number;
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  planBreakdown: { free: number; pro: number; studio: number };
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

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh stats every 3 seconds for up-to-date numbers
    const interval = setInterval(() => {
      loadStats();
    }, 3000);
    
    // Listen for storage events (when new user registers)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-user-registered') {
        console.log('New user detected - refreshing stats!');
        loadStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check localStorage periodically
    const storageCheck = setInterval(() => {
      if (localStorage.getItem('new-user-registered')) {
        loadStats();
      }
    }, 500);
    
    return () => {
      clearInterval(interval);
      clearInterval(storageCheck);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching stats from API...");

      const response = await api.get("/admin/stats");
      console.log("Stats received:", response.data);
      setStats(response.data as DashboardStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const s = stats;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity size={48} className="mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-bold text-deep mb-2">Failed to Load Stats</h3>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl text-deep tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time stats from Supabase database</p>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard
          delay={0}
          icon={<Users size={18} />}
          label="Total Users"
          value={loading ? "—" : s?.totalUsers ?? 0}
          color="linear-gradient(135deg,#6366F1,#8B5CF6)"
          sub={`${s?.totalBanned ?? 0} banned`}
        />
        <StatCard
          delay={0.07}
          icon={<CalendarDays size={18} />}
          label="Total Events"
          value={loading ? "—" : s?.totalEvents ?? 0}
          color="linear-gradient(135deg,#0D9488,#14B8A6)"
          sub={`${s?.activeEvents ?? 0} active`}
        />
      </div>

      {/* Plan breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl p-6"
        style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <h2 className="font-bold text-deep text-base mb-5">Plan Distribution</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: "Free", value: s?.planBreakdown.free ?? 0, color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
              { label: "Pro", value: s?.planBreakdown.pro ?? 0, color: "#FF2D78", bg: "rgba(255,45,120,0.08)" },
              { label: "Studio", value: s?.planBreakdown.studio ?? 0, color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
            ].map(p => {
              const total = (s?.totalUsers ?? 1) || 1;
              const pct = Math.round((p.value / total) * 100);
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-deep">{p.label}</span>
                    <span className="text-sm font-bold text-deep">
                      {p.value.toLocaleString()} <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
                    </span>
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
        )}
      </motion.div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,45,120,0.08)" }}>
              <Images size={18} style={{ color: "#FF2D78" }} />
            </div>
            <div>
              <div className="text-xl font-black text-deep stat-number">
                {loading ? "—" : (s?.totalPhotos ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Total Photos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.08)" }}>
              <HardDrive size={18} style={{ color: "#6366F1" }} />
            </div>
            <div>
              <div className="text-xl font-black text-deep stat-number">
                {loading ? "—" : `${s?.storageUsedGB ?? 0} GB`}
              </div>
              <div className="text-xs text-slate-500">Storage Used</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
