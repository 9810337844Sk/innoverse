"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus, ArrowUpRight, Sparkles, Camera, Zap, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Stats = { totalPhotos: number; totalEvents: number; totalSearches: number; totalDownloads: number };
type Event = { _id: string; name: string; date: string; code: string; photoCount: number };

export default function DashboardPage() {
  const { user }     = useAuthStore();
  const _hasHydrated = useAuthStore(s => s._hasHydrated);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get("/events?limit=5")
      .then((e) => {
        setEvents((e as { data: { events: Event[] } }).data.events);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    
    // Auto-refresh when user navigates back to dashboard
    const handleFocus = () => {
      fetchData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Refresh every 10 seconds if user is on the page
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, 10000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const firstName = _hasHydrated ? (user?.name?.split(" ")[0] ?? "") : "";

  return (
    <div className="space-y-5 max-w-6xl">

      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      {true && (
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "#fff",
          border: "1px solid rgba(255,45,120,0.1)",
          boxShadow: "0 4px 40px rgba(255,45,120,0.06), 0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        {/* ── Top rainbow line ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
          style={{ background: "linear-gradient(90deg,#FF2D78,#A855F7,#0D9488)" }} />

        {/* ── Ambient light from top-left ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 12% 5%, rgba(255,45,120,0.05) 0%, rgba(168,85,247,0.025) 40%, transparent 65%)" }} />

        {/* ── Bokeh ring top-right ── */}
        <div className="absolute -top-20 right-40 w-72 h-72 rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(168,85,247,0.06)", background: "radial-gradient(circle,rgba(168,85,247,0.05) 0%,transparent 70%)" }} />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">

          {/* ── Left: greeting + stats ── */}
          <div className="flex-1 flex flex-col justify-between gap-5">

            {/* Eyebrow */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
                <Sparkles size={11} style={{ color: "#FF2D78" }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#FF2D78" }}>
                  Photographer Dashboard
                </span>
              </div>

              {/* Heading */}
              <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide">Welcome back,</p>
              <div className="flex items-end gap-2 mb-3">
                <h1
                  className="font-black leading-none tracking-tight"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 2.75rem)",
                    background: "linear-gradient(120deg,#FF2D78 0%,#C026D3 45%,#A855F7 75%,#0D9488 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {firstName}
                </h1>
                <motion.span
                  className="text-3xl select-none"
                  animate={{ rotate: [0, 15, -8, 15, 0], y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                >
                  👋
                </motion.span>
              </div>
            </div>
          </div>

          {/* ── Right: quick action buttons ── */}
          <div className="lg:w-44 flex-shrink-0 flex flex-col gap-3 justify-center">
            <button onClick={fetchData} disabled={loading}>
              <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", opacity: loading ? 0.6 : 1 }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(13,148,136,0.12)" }}>
                  <RefreshCw size={15} style={{ color: "#0D9488" }} className={loading ? "animate-spin" : ""} />
                </div>
                <div className="font-semibold text-sm" style={{ color: "#0D9488" }}>Refresh</div>
              </motion.div>
            </button>
            <Link href="/dashboard/events/new">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Plus size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-none">New Event</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap size={9} className="text-white/60" />
                    <span className="text-[10px] text-white/60 font-medium">AI-powered</span>
                  </div>
                </div>
              </motion.div>
            </Link>
            <Link href="/find">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(168,85,247,0.12)" }}>
                  <Camera size={15} style={{ color: "#A855F7" }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: "#A855F7" }}>Find Photos</div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
      )}

      {/* ── Recent events ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl p-6 bg-white"
        style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-sm text-deep tracking-tight">Recent Events</h2>
            <p className="text-slate-400 text-xs mt-0.5">Your latest {events.length > 0 ? events.length : ""} events</p>
          </div>
          <Link href="/dashboard/events"
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
            style={{ color: "#A855F7" }}>
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.1)" }}>
              <CalendarDays size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm mb-1 font-semibold">No events yet</p>
            <p className="text-slate-400 text-xs mb-5">Create your first event to start delivering photos.</p>
            <Link href="/dashboard/events/new">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 14px rgba(255,45,120,0.35)" }}>
                <Plus size={14} /> Create Event
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((ev, i) => (
              <motion.div key={ev._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}>
                <Link href={`/dashboard/events/${ev._id}`}
                  className="flex items-center gap-4 p-3.5 rounded-2xl group hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.1)" }}>
                    <CalendarDays size={14} style={{ color: "#FF2D78" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-deep group-hover:text-primary transition-colors truncate">{ev.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span className="mx-1.5 text-slate-200">·</span>
                      {ev.photoCount} photos
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-mono px-2 py-1 rounded-lg hidden sm:block"
                      style={{ color: "#A855F7", background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.12)" }}>
                      {ev.code}
                    </span>
                    <ArrowUpRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
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
