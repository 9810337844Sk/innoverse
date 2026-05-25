"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Images, CalendarDays, Search, Download, TrendingUp,
  Plus, ArrowUpRight, Sparkles, Camera,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Stats = { totalPhotos: number; totalEvents: number; totalSearches: number; totalDownloads: number };
type Event = { _id: string; name: string; date: string; code: string; photoCount: number };

export default function DashboardPage() {
  const { user }     = useAuthStore();
  const _hasHydrated = useAuthStore(s => s._hasHydrated);
  const [stats, setStats]   = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/photographer/stats"), api.get("/events?limit=5")])
      .then(([s, e]) => {
        setStats((s as { data: Stats }).data);
        setEvents((e as { data: { events: Event[] } }).data.events);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      icon: <Images size={18} />,
      label: "Total Photos",
      value: stats?.totalPhotos ?? 0,
      accent: "#FF2D78",
      bg: "rgba(255,45,120,0.08)",
      border: "rgba(255,45,120,0.15)",
    },
    {
      icon: <CalendarDays size={18} />,
      label: "Events",
      value: stats?.totalEvents ?? 0,
      accent: "#A855F7",
      bg: "rgba(168,85,247,0.08)",
      border: "rgba(168,85,247,0.15)",
    },
    {
      icon: <Search size={18} />,
      label: "Searches",
      value: stats?.totalSearches ?? 0,
      accent: "#0D9488",
      bg: "rgba(13,148,136,0.08)",
      border: "rgba(13,148,136,0.15)",
    },
    {
      icon: <Download size={18} />,
      label: "Downloads",
      value: stats?.totalDownloads ?? 0,
      accent: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.15)",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, #fff5f8 0%, #ffffff 45%, #faf5ff 100%)",
          border: "1px solid rgba(255,45,120,0.12)",
          boxShadow: "0 4px 32px rgba(255,45,120,0.07)",
        }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7, #0D9488)" }} />

        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25), transparent 70%)" }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,45,120,0.3), transparent 70%)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.2)" }}>
                <Sparkles size={12} style={{ color: "#0D9488" }} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#0D9488" }}>
                Photographer Dashboard
              </span>
            </div>
            <h1 className="font-black text-2xl sm:text-3xl mb-1.5 tracking-tight text-deep">
              Welcome back, {_hasHydrated ? (user?.name?.split(" ")[0] ?? "Photographer") : "..."} 👋
            </h1>
            <p className="text-slate-500 text-sm">
              Here&apos;s what&apos;s happening with your events today.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl hidden sm:flex"
              style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
              <Camera size={24} />
            </div>
            <Link href="/dashboard/events">
              <Button size="sm"><Plus size={14} /> New Event</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-2xl p-5 bg-white cursor-default"
              style={{
                border: `1px solid ${s.border}`,
                boxShadow: `0 2px 16px ${s.bg}`,
              }}
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <span style={{ color: s.accent }}>{s.icon}</span>
                </div>
              </div>
              <div className="font-black text-2xl mb-0.5 stat-number text-deep">{s.value.toLocaleString()}</div>
              <div className="text-slate-400 text-xs font-medium">{s.label}</div>
            </motion.div>
          ))
        }
      </div>

      {/* ── Chart + Quick actions ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-3xl p-6 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-base text-deep">Activity This Week</h2>
              <p className="text-slate-400 text-xs mt-0.5">Searches & downloads over 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "#FF2D78" }} />Searches
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "#0D9488" }} />Downloads
              </span>
            </div>
          </div>
          {stats && (stats.totalSearches > 0 || stats.totalDownloads > 0) ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={[
                { day: "Mon", searches: Math.round(stats.totalSearches * 0.08), downloads: Math.round(stats.totalDownloads * 0.06) },
                { day: "Tue", searches: Math.round(stats.totalSearches * 0.12), downloads: Math.round(stats.totalDownloads * 0.10) },
                { day: "Wed", searches: Math.round(stats.totalSearches * 0.10), downloads: Math.round(stats.totalDownloads * 0.08) },
                { day: "Thu", searches: Math.round(stats.totalSearches * 0.15), downloads: Math.round(stats.totalDownloads * 0.14) },
                { day: "Fri", searches: Math.round(stats.totalSearches * 0.20), downloads: Math.round(stats.totalDownloads * 0.18) },
                { day: "Sat", searches: Math.round(stats.totalSearches * 0.22), downloads: Math.round(stats.totalDownloads * 0.28) },
                { day: "Sun", searches: Math.round(stats.totalSearches * 0.13), downloads: Math.round(stats.totalDownloads * 0.16) },
              ]}>
                <defs>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF2D78" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF2D78" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(255,45,120,0.15)",
                    borderRadius: "14px",
                    color: "#1e293b",
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />
                <Area type="monotone" dataKey="searches"  stroke="#FF2D78" fill="url(#gs)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="downloads" stroke="#0D9488" fill="url(#gd)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[190px] flex flex-col items-center justify-center text-slate-300">
              <TrendingUp size={36} className="mb-3" />
              <p className="text-sm text-slate-400">No activity yet — create an event and share it.</p>
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="rounded-3xl p-6 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
        >
          <h2 className="font-bold text-base text-deep mb-1">Quick Actions</h2>
          <p className="text-slate-400 text-xs mb-5">Jump to common tasks</p>
          <div className="space-y-2.5">
            {[
              { label: "Create New Event",  sub: "Set up a new photo event",   href: "/dashboard/events",    accent: "#FF2D78", bg: "rgba(255,45,120,0.06)",  border: "rgba(255,45,120,0.12)",  icon: <CalendarDays size={16} /> },
              { label: "Upload Photos",     sub: "Add photos to an event",     href: "/dashboard/events",    accent: "#A855F7", bg: "rgba(168,85,247,0.06)",  border: "rgba(168,85,247,0.12)",  icon: <Images size={16} /> },
              { label: "View Analytics",   sub: "Track event performance",    href: "/dashboard/analytics", accent: "#0D9488", bg: "rgba(13,148,136,0.06)",  border: "rgba(13,148,136,0.12)",  icon: <TrendingUp size={16} /> },
              { label: "Account Settings", sub: "Update your profile",        href: "/dashboard/settings",  accent: "#F59E0B", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.12)",  icon: <Search size={16} /> },
            ].map((a, i) => (
              <Link key={i} href={a.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors group"
                  style={{ border: `1px solid ${a.border}`, background: a.bg }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "white", border: `1px solid ${a.border}` }}>
                    <span style={{ color: a.accent }}>{a.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-deep truncate">{a.label}</div>
                    <div className="text-[11px] text-slate-400 truncate">{a.sub}</div>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent events ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl p-6 bg-white"
        style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base text-deep">Recent Events</h2>
            <p className="text-slate-400 text-xs mt-0.5">Your latest {events.length > 0 ? events.length : ""} events</p>
          </div>
          <Link href="/dashboard/events"
            className="flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
            style={{ color: "#A855F7" }}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
              <CalendarDays size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm mb-1 font-medium">No events yet</p>
            <p className="text-slate-400 text-xs mb-5">Create your first event to get started</p>
            <Link href="/dashboard/events">
              <Button size="sm"><Plus size={14} /> Create Event</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.map((ev, i) => (
              <motion.div key={ev._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}>
                <Link href={`/dashboard/events/${ev._id}`}
                  className="event-row flex items-center gap-4 p-3.5 rounded-2xl group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.12)" }}>
                    <CalendarDays size={15} style={{ color: "#FF2D78" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-deep group-hover:text-primary transition-colors">
                      {ev.name}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span className="mx-1.5 text-slate-200">·</span>
                      {ev.photoCount} photos
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg hidden sm:block"
                      style={{ color: "#A855F7", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                      {ev.code}
                    </span>
                    <ArrowUpRight size={13} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
