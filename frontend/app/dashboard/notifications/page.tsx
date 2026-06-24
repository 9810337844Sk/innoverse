"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell, CalendarPlus, Search, Download, Eye,
  Sparkles, CheckCheck, ChevronLeft, RefreshCw,
  Camera, BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

type NotifItem = {
  id:       string;
  type:     "welcome" | "event" | "search" | "download" | "view";
  title:    string;
  subtitle: string;
  detail:   string;
  time:     string;
  isNew:    boolean;
};

const TYPE_CONFIG: Record<NotifItem["type"], { icon: React.ReactNode; bg: string; color: string; label: string }> = {
  welcome:  { icon: <Sparkles size={18} />,    bg: "linear-gradient(135deg,#FF2D78,#A855F7)", color: "#fff",     label: "Welcome" },
  event:    { icon: <CalendarPlus size={18} />, bg: "rgba(59,130,246,0.1)",                    color: "#3B82F6",  label: "Event" },
  search:   { icon: <Search size={18} />,       bg: "rgba(168,85,247,0.1)",                    color: "#A855F7",  label: "AI Search" },
  download: { icon: <Download size={18} />,     bg: "rgba(13,148,136,0.1)",                    color: "#0D9488",  label: "Download" },
  view:     { icon: <Eye size={18} />,           bg: "rgba(245,158,11,0.1)",                    color: "#F59E0B",  label: "Photo View" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const FILTERS = ["All", "Events", "AI Search", "Downloads", "Views"] as const;
type Filter = typeof FILTERS[number];

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<Filter>("All");
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const lastSeen = localStorage.getItem("dash_notif_last_seen")
        ? new Date(localStorage.getItem("dash_notif_last_seen")!)
        : new Date(0);

      const [eventsRes, statsRes] = await Promise.all([
        fetch("/api/events?limit=20").then(r => r.ok ? r.json() : { events: [] }),
        fetch("/api/photographer/stats").then(r => r.ok ? r.json() : {}),
      ]);

      const firstName = user?.name?.split(" ")[0] ?? "there";
      const welcome: NotifItem = {
        id: "welcome", type: "welcome",
        title: `Welcome back, ${firstName}! 👋`,
        subtitle: "You're all caught up with your latest activity.",
        detail: "This is your notification center. New events, searches, downloads, and photo views will appear here.",
        time: new Date().toISOString(), isNew: false,
      };

      const eventItems: NotifItem[] = ((eventsRes.events ?? []) as Array<{
        _id: string; name: string; createdAt: string; date: string;
        searchCount?: number; downloadCount?: number; photoCount?: number;
      }>).map(e => ({
        id: `ev-${e._id}`, type: "event" as const,
        title: `Event "${e.name}" created`,
        subtitle: `${e.searchCount ?? 0} AI searches · ${e.downloadCount ?? 0} downloads · ${e.photoCount ?? 0} photos`,
        detail: `Event date: ${new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        time: e.createdAt,
        isNew: new Date(e.createdAt) > lastSeen,
      }));

      const stats = statsRes as { totalSearches?: number; totalDownloads?: number; totalPhotos?: number; totalEvents?: number };
      const activityItems: NotifItem[] = [];

      if ((stats.totalSearches ?? 0) > 0) {
        activityItems.push({
          id: "total-searches", type: "search",
          title: `${stats.totalSearches} total AI face searches`,
          subtitle: "Guests have used AI face recognition to find their photos",
          detail: "Each search uses our AI engine (Facenet512 + FAISS) to match a guest's selfie to event photos.",
          time: new Date(Date.now() - 3600000).toISOString(), isNew: false,
        });
      }
      if ((stats.totalDownloads ?? 0) > 0) {
        activityItems.push({
          id: "total-downloads", type: "download",
          title: `${stats.totalDownloads} total photo downloads`,
          subtitle: "Guests have saved photos from your events",
          detail: "Downloads are tracked per photo. Guests can download individually or as a ZIP.",
          time: new Date(Date.now() - 7200000).toISOString(), isNew: false,
        });
      }

      const all = [welcome, ...eventItems, ...activityItems]
        .sort((a, b) => {
          if (a.id === "welcome") return -1;
          if (b.id === "welcome") return 1;
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

      setNotifications(all);
      setUnreadCount(eventItems.filter(n => n.isNew).length);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  }, [user?.name]);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = () => {
    localStorage.setItem("dash_notif_last_seen", new Date().toISOString());
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    setUnreadCount(0);
  };

  const filtered = notifications.filter(n => {
    if (filter === "All")       return true;
    if (filter === "Events")    return n.type === "event";
    if (filter === "AI Search") return n.type === "search";
    if (filter === "Downloads") return n.type === "download";
    if (filter === "Views")     return n.type === "view";
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-deep transition-colors mb-4 group">
          <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
                <Bell size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-2xl text-deep tracking-tight leading-none">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="text-xs text-pink-600 font-semibold">{unreadCount} new</span>
                )}
              </div>
            </div>
            <p className="text-slate-500 text-sm ml-[52px]">Your events, searches, and activity in one place</p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all"
                style={{ background: "rgba(255,45,120,0.06)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={fetchNotifications}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all text-slate-500 hover:text-deep"
              style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: <Bell size={15} />,     label: "Total",   value: notifications.length, color: "#FF2D78" },
          { icon: <CalendarPlus size={15} />, label: "Events", value: notifications.filter(n => n.type === "event").length, color: "#3B82F6" },
          { icon: <BarChart3 size={15} />, label: "Activity", value: notifications.filter(n => ["search","download","view"].includes(n.type)).length, color: "#A855F7" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 8px rgba(255,45,120,0.04)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="font-black text-lg text-deep leading-none">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={filter === f
              ? { background: "linear-gradient(135deg,#FF2D78,#A855F7)", color: "#fff", boxShadow: "0 4px 12px rgba(255,45,120,0.25)" }
              : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* Notification list */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl overflow-hidden"
        style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 4px 24px rgba(255,45,120,0.06)" }}>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: "rgba(255,45,120,0.06)" }}>
              <Bell size={28} style={{ color: "#FF2D78" }} />
            </div>
            <p className="font-bold text-deep mb-2">No notifications here</p>
            <p className="text-slate-400 text-sm">
              {filter === "All" ? "Create an event to start seeing activity." : `No ${filter.toLowerCase()} notifications yet.`}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 px-5 py-4 group relative"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                    background: n.type === "welcome"
                      ? "linear-gradient(135deg,rgba(255,45,120,0.03),rgba(168,85,247,0.03))"
                      : n.isNew ? "rgba(255,45,120,0.015)" : undefined,
                  }}>

                  {/* Unread dot */}
                  {n.isNew && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: "#FF2D78" }} />
                  )}

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold leading-tight"
                          style={n.type === "welcome" ? {
                            background: "linear-gradient(135deg,#FF2D78,#A855F7)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                          } : { color: "#1A0A12" }}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.subtitle}</p>
                        {n.detail && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.detail}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${cfg.color}18`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {n.type !== "welcome" && (
                          <p className="text-[10px] text-slate-400 mt-1.5">{relativeTime(n.time)}</p>
                        )}
                      </div>
                    </div>
                    {n.type !== "welcome" && (
                      <p className="text-[10px] text-slate-300 mt-1.5">{formatDate(n.time)}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Footer tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="mt-4 rounded-2xl px-5 py-3.5 flex items-center gap-3"
        style={{ background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.1)" }}>
        <Camera size={16} style={{ color: "#FF2D78", flexShrink: 0 }} />
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-deep">Pro tip:</span> Share your event code with guests so they can find their photos using AI face recognition.
        </p>
      </motion.div>
    </div>
  );
}
