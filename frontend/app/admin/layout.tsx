"use client";
import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, Images,
  LogOut, Menu, X, ChevronRight, Shield, Bell,
  UserCircle, Settings, LayoutGrid,
  UserPlus, CalendarPlus, CheckCheck, Clock, Sparkles, Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import NextImage from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifItem = {
  id:        string;
  type:      "welcome" | "user" | "event" | "photo";
  title:     string;
  subtitle:  string;
  time:      string;   // ISO string
  isNew:     boolean;
  viewCount?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={16} />, label: "Overview",  href: "/admin" },
  { icon: <Users size={16} />,           label: "Users",     href: "/admin/users" },
  { icon: <CalendarDays size={16} />,    label: "Events",    href: "/admin/events" },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.15)" }}>
            <NextImage src="/logo.jpg" alt="PhotoFly" width={130} height={34} className="h-8 w-auto object-contain" />
          </motion.div>
        </Link>
        <div className="mt-3 flex items-center gap-2 px-2 py-1.5 rounded-xl"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <Shield size={12} style={{ color: "#EF4444" }} />
          <span className="text-xs font-bold" style={{ color: "#EF4444" }}>Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 relative overflow-hidden group"
              style={active ? { color: "#1A0A12" } : { color: "#64748B" }}>
              {active && (
                <motion.div layoutId="adminNav" className="absolute inset-0 rounded-2xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }} />
              )}
              {!active && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(239,68,68,0.04)" }} />
              )}
              <span className="relative z-10 flex-shrink-0" style={{ color: active ? "#EF4444" : "#94A3B8" }}>
                {item.icon}
              </span>
              <span className="relative z-10 flex-1">{item.label}</span>
              {active && <ChevronRight size={12} className="relative z-10 flex-shrink-0" style={{ color: "#EF4444" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(239,68,68,0.06)" }}>
        <div className="mt-4 rounded-2xl p-3 mb-2"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#EF4444,#F97316)" }}>
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-deep truncate leading-tight">{user?.name ?? "Admin"}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all w-full group">
          <LogOut size={15} className="group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Notification icon by type ─────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotifItem["type"] }) {
  const cfg = {
    welcome: { icon: <Sparkles size={14} />,    bg: "linear-gradient(135deg,rgba(255,45,120,0.15),rgba(168,85,247,0.15))", color: "#FF2D78" },
    user:    { icon: <UserPlus size={14} />,    bg: "rgba(59,130,246,0.1)",   color: "#3B82F6" },
    event:   { icon: <CalendarPlus size={14} />,bg: "rgba(239,68,68,0.1)",    color: "#EF4444" },
    photo:   { icon: <Eye size={14} />,         bg: "rgba(168,85,247,0.1)",   color: "#A855F7" },
  }[type];
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon}
    </div>
  );
}

// ── Admin layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [checked,      setChecked]      = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setChecked(true);
      return;
    }
    
    if (user === null) { router.replace("/auth/login"); return; }
    if (user.role !== "admin") { router.replace("/dashboard"); return; }
    setChecked(true);
  }, [user, router, pathname]);

  // ── Click-outside ───────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setNotifOpen(false); setProfileOpen(false); }
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown",   key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);

  // ── Fetch recent activity for notifications ─────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (notifsLoading) return;
    setNotifsLoading(true);
    try {
      const lastSeenKey = "admin_notif_last_seen";
      const lastSeen = localStorage.getItem(lastSeenKey)
        ? new Date(localStorage.getItem(lastSeenKey)!)
        : new Date(0);

      const [usersRes, eventsRes, activityRes] = await Promise.all([
        fetch("/api/admin/users").then(r => r.ok ? r.json() : { users: [] }),
        fetch("/api/admin/events").then(r => r.ok ? r.json() : { events: [] }),
        fetch("/api/admin/activity").then(r => r.ok ? r.json() : { views: [] }),
      ]);

      const userItems: NotifItem[] = ((usersRes.users ?? []) as Array<{ _id: string; name: string; role: string; createdAt: string }>)
        .slice(0, 5)
        .map(u => ({
          id:       u._id,
          type:     "user" as const,
          title:    `${u.name} joined`,
          subtitle: u.role === "photographer" ? "New photographer account" : "New user account",
          time:     u.createdAt,
          isNew:    new Date(u.createdAt) > lastSeen,
        }));

      const eventItems: NotifItem[] = ((eventsRes.events ?? []) as Array<{ _id: string; name: string; photographer: { name: string } | null; createdAt: string }>)
        .slice(0, 5)
        .map(e => ({
          id:       e._id,
          type:     "event" as const,
          title:    `Event "${e.name}" created`,
          subtitle: e.photographer ? `by ${e.photographer.name}` : "by unknown",
          time:     e.createdAt,
          isNew:    new Date(e.createdAt) > lastSeen,
        }));

      const photoItems: NotifItem[] = ((activityRes.views ?? []) as Array<{
        photo_id: string; photo_name: string; view_count: number;
        download_count: number; last_viewed_at: string; events: { name: string } | null;
      }>)
        .slice(0, 5)
        .map(v => ({
          id:        `pv-${v.photo_id}`,
          type:      "photo" as const,
          title:     `Photo viewed ${v.view_count} time${v.view_count !== 1 ? "s" : ""}`,
          subtitle:  v.events?.name ? `in "${v.events.name}"` : v.photo_name || "Unknown photo",
          time:      v.last_viewed_at,
          isNew:     new Date(v.last_viewed_at) > lastSeen,
          viewCount: v.view_count,
        }));

      const combined = [...userItems, ...eventItems, ...photoItems]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 12);

      // Welcome notification — always first, never counts as unread
      const adminName = user?.name?.split(" ")[0] ?? "Admin";
      const welcome: NotifItem = {
        id:       "welcome",
        type:     "welcome",
        title:    `Welcome back, ${adminName}! 👋`,
        subtitle: "Here's a summary of recent platform activity",
        time:     new Date().toISOString(),
        isNew:    false,
      };

      setNotifications([welcome, ...combined]);
      setUnreadCount(combined.filter(n => n.isNew).length);
    } catch {
      // silently fail — non-critical
    } finally {
      setNotifsLoading(false);
    }
  }, [notifsLoading, user?.name]);

  useEffect(() => {
    if (checked) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const markAllRead = () => {
    localStorage.setItem("admin_notif_last_seen", new Date().toISOString());
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    setUnreadCount(0);
  };

  const handleNotifOpen = () => {
    setProfileOpen(false);
    setNotifOpen(v => !v);
  };

  const handleProfileOpen = () => {
    setNotifOpen(false);
    setProfileOpen(v => !v);
  };

  const handleLogout = () => { logout(); router.push("/"); };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Login page (no layout) ──────────────────────────────────────────────────
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const pageTitle = NAV_ITEMS.find(n =>
    n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Admin";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white"
        style={{ borderRight: "1px solid rgba(239,68,68,0.08)", boxShadow: "2px 0 12px rgba(239,68,68,0.04)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden bg-white"
              style={{ borderRight: "1px solid rgba(239,68,68,0.1)", boxShadow: "4px 0 24px rgba(239,68,68,0.08)" }}>
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-deep hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="px-5 py-3.5 flex items-center gap-4 bg-white flex-shrink-0 relative z-30"
          style={{ borderBottom: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 1px 6px rgba(239,68,68,0.04)" }}>

          <button className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-deep hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:block">Admin</span>
            {pageTitle !== "Overview" && (
              <><ChevronRight size={13} className="text-slate-300 hidden sm:block" />
                <span className="font-semibold text-deep">{pageTitle}</span></>
            )}
            {pageTitle === "Overview" && (
              <span className="font-semibold text-deep hidden sm:block">Overview</span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifOpen}
                aria-label="Notifications"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  border: `1px solid ${notifOpen ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.1)"}`,
                  background: notifOpen ? "rgba(239,68,68,0.06)" : "transparent",
                  color: notifOpen ? "#EF4444" : "#94A3B8",
                }}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: "#EF4444", lineHeight: 1 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-11 w-80 bg-white rounded-2xl overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12),0 4px 16px rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.12)", zIndex: 50 }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-deep">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: "#EF4444" }}>{unreadCount}</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                          style={{ color: "#EF4444" }}>
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="overflow-y-auto max-h-72">
                      {notifsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="w-5 h-5 border-2 border-red-100 border-t-red-500 rounded-full animate-spin" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                            style={{ background: "rgba(239,68,68,0.06)" }}>
                            <Bell size={20} style={{ color: "#EF4444" }} />
                          </div>
                          <p className="text-sm font-semibold text-deep mb-1">All caught up!</p>
                          <p className="text-xs text-slate-400">No recent activity to show.</p>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <motion.div key={n.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 px-4 py-3 transition-colors cursor-default"
                            style={{
                              borderBottom: i < notifications.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                              background: n.type === "welcome"
                                ? "linear-gradient(135deg,rgba(255,45,120,0.04),rgba(168,85,247,0.04))"
                                : undefined,
                            }}
                            onMouseEnter={e => { if (n.type !== "welcome") (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                            onMouseLeave={e => { if (n.type !== "welcome") (e.currentTarget as HTMLElement).style.background = ""; }}>
                            <NotifIcon type={n.type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-deep leading-tight truncate"
                                  style={n.type === "welcome" ? {
                                    background: "linear-gradient(135deg,#FF2D78,#A855F7)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                  } : undefined}>
                                  {n.title}
                                </p>
                                {n.isNew && (
                                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                    style={{ background: "#EF4444" }} />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{n.subtitle}</p>
                              {n.type !== "welcome" && (
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Clock size={9} />{relativeTime(n.time)}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(239,68,68,0.07)" }}>
                      <Link href="/admin/users"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: "#EF4444" }}>
                        View all activity <ChevronRight size={11} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile button ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={handleProfileOpen}
                aria-label="Admin profile"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all"
                style={{
                  border: `1px solid ${profileOpen ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.12)"}`,
                  background: profileOpen ? "rgba(239,68,68,0.06)" : "rgba(239,68,68,0.04)",
                }}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#EF4444,#F97316)", boxShadow: "0 2px 6px rgba(239,68,68,0.35)" }}>
                  {user?.avatar
                    ? <NextImage src={user.avatar} alt={user.name ?? ""} width={28} height={28} className="w-full h-full object-cover rounded-lg" />
                    : user?.name?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-deep leading-none">{user?.name ?? "Admin"}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Shield size={9} style={{ color: "#EF4444" }} /> Super Admin
                  </div>
                </div>
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-11 w-64 bg-white rounded-2xl overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12),0 4px 16px rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.12)", zIndex: 50 }}>

                    {/* Profile hero */}
                    <div className="px-5 py-4"
                      style={{ background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-black flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#EF4444,#F97316)", boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}>
                          {user?.avatar
                            ? <NextImage src={user.avatar} alt={user.name ?? ""} width={44} height={44} className="w-full h-full object-cover rounded-2xl" />
                            : user?.name?.[0]?.toUpperCase() ?? "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-deep truncate leading-tight">{user?.name ?? "Admin"}</div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                              <Shield size={9} /> Super Admin
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      {[
                        { icon: <LayoutGrid size={14} />,   label: "Admin Overview",  href: "/admin" },
                        { icon: <UserCircle size={14} />,   label: "My Profile",      href: "/dashboard/settings" },
                        { icon: <LayoutDashboard size={14} />, label: "User Dashboard", href: "/dashboard" },
                        { icon: <Settings size={14} />,     label: "Settings",        href: "/dashboard/settings" },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-deep hover:bg-slate-50 transition-all group">
                          <span className="text-slate-400 group-hover:text-red-500 transition-colors">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Sign out */}
                    <div className="py-1.5" style={{ borderTop: "1px solid rgba(239,68,68,0.08)" }}>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group">
                        <LogOut size={14} className="group-hover:text-red-600 transition-colors" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6" style={{ background: "#F8FAFC" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
