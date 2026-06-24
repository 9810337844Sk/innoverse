"use client";
import { ReactNode, useEffect, useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Images,
  BarChart3, Settings, LogOut, Menu, X, ChevronRight,
  Bell, Camera, Download, Search,
  CheckCheck, Clock, Sparkles, Eye, CalendarPlus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifItem = {
  id:       string;
  type:     "welcome" | "event" | "search" | "download" | "view";
  title:    string;
  subtitle: string;
  time:     string;
  isNew:    boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifIcon({ type }: { type: NotifItem["type"] }) {
  const cfg: Record<NotifItem["type"], { icon: React.ReactNode; bg: string; color: string }> = {
    welcome:  { icon: <Sparkles size={13} />,    bg: "linear-gradient(135deg,rgba(255,45,120,0.12),rgba(168,85,247,0.12))", color: "#FF2D78" },
    event:    { icon: <CalendarPlus size={13} />, bg: "rgba(59,130,246,0.1)",  color: "#3B82F6" },
    search:   { icon: <Search size={13} />,       bg: "rgba(168,85,247,0.1)",  color: "#A855F7" },
    download: { icon: <Download size={13} />,     bg: "rgba(13,148,136,0.1)",  color: "#0D9488" },
    view:     { icon: <Eye size={13} />,           bg: "rgba(245,158,11,0.1)",  color: "#F59E0B" },
  };
  const c = cfg[type];
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}
    </div>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems = [
  { icon: <LayoutDashboard size={17} />, label: "Overview",  href: "/dashboard" },
  { icon: <CalendarDays size={17} />,   label: "Events",    href: "/dashboard/events" },
  { icon: <Images size={17} />,         label: "Photos",    href: "/dashboard/photos" },
  { icon: <Settings size={17} />,       label: "Settings",  href: "/dashboard/settings" },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SidebarContent = memo(function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,45,120,0.08)" }}>
        <Link href="/" className="flex items-center" onClick={onClose}>
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 4px 14px rgba(255,45,120,0.2)" }}>
            <Image src="/logo.jpg" alt="PhotoFly logo" width={140} height={36} className="h-9 w-auto object-contain" />
          </motion.div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Navigation</p>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                active ? "text-deep" : "text-slate-500 hover:text-deep"
              }`}>
              {active && (
                <motion.div layoutId="activeNav" className="absolute inset-0 rounded-2xl"
                  style={{ background: "linear-gradient(135deg,rgba(255,45,120,0.08),rgba(168,85,247,0.05))", border: "1px solid rgba(255,45,120,0.15)" }} />
              )}
              {!active && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,45,120,0.04)" }} />
              )}
              <span className={`relative z-10 transition-colors flex-shrink-0 ${active ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}>
                {item.icon}
              </span>
              <span className="relative z-10 flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="ml-auto relative z-10 flex-shrink-0" style={{ color: "#A855F7" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
        <div className="mt-4 rounded-2xl p-3 mb-2"
          style={{ background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 2px 8px rgba(255,45,120,0.25)" }}>
              {user?.avatar
                ? <Image src={user.avatar} alt={`${user.name}`} width={36} height={36} className="h-full w-full object-cover" />
                : user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-deep truncate leading-tight">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{user?.email}</div>
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
});

// ── Dashboard Layout ──────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const _hasHydrated = useAuthStore(s => s._hasHydrated);
  const theme = useThemeStore(s => s.theme);

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  const { updateUser } = useAuthStore();
  const handleLogout = () => { logout(); router.push("/"); };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role === "admin") { router.replace("/admin"); }
  }, [_hasHydrated, user, router]);

  // Verify session cookie against server once on mount — catches expired / wrong-role tokens
  useEffect(() => {
    if (!_hasHydrated || !user) return;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async res => {
        if (res.status === 401) { logout(); router.replace("/auth/login"); return; }
        if (res.ok) {
          const json = await res.json() as { user?: { name: string; email: string; role: string; avatar?: string | null } };
          if (json.user) updateUser({ name: json.user.name, email: json.user.email, role: json.user.role, avatar: json.user.avatar });
        }
      })
      .catch(() => { /* network error — keep local state */ });
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  useEffect(() => { void useThemeStore.persist.rehydrate(); }, []);

  // ── Click-outside + Escape ──────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);

  // ── Fetch notifications ─────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (notifsLoading) return;
    setNotifsLoading(true);
    try {
      const lastSeen = localStorage.getItem("dash_notif_last_seen")
        ? new Date(localStorage.getItem("dash_notif_last_seen")!)
        : new Date(0);

      const [eventsRes, statsRes] = await Promise.all([
        fetch("/api/events?limit=10").then(r => r.ok ? r.json() : { events: [] }),
        fetch("/api/photographer/stats").then(r => r.ok ? r.json() : {}),
      ]);

      const firstName = user?.name?.split(" ")[0] ?? "there";
      const welcome: NotifItem = {
        id: "welcome", type: "welcome",
        title: `Welcome back, ${firstName}! 👋`,
        subtitle: "Here's a summary of your recent activity",
        time: new Date().toISOString(), isNew: false,
      };

      const eventItems: NotifItem[] = ((eventsRes.events ?? []) as Array<{
        _id: string; name: string; createdAt: string; searchCount?: number; downloadCount?: number;
      }>)
        .slice(0, 5)
        .map(e => ({
          id:       `ev-${e._id}`,
          type:     "event" as const,
          title:    `Event "${e.name}" created`,
          subtitle: `${e.searchCount ?? 0} searches · ${e.downloadCount ?? 0} downloads`,
          time:     e.createdAt,
          isNew:    new Date(e.createdAt) > lastSeen,
        }));

      const stats = statsRes as { totalSearches?: number; totalDownloads?: number };
      const activityItems: NotifItem[] = [];

      if ((stats.totalSearches ?? 0) > 0) {
        activityItems.push({
          id: "total-searches", type: "search",
          title: `${stats.totalSearches} total AI searches`,
          subtitle: "Guests have used face recognition to find their photos",
          time: new Date().toISOString(), isNew: false,
        });
      }
      if ((stats.totalDownloads ?? 0) > 0) {
        activityItems.push({
          id: "total-downloads", type: "download",
          title: `${stats.totalDownloads} total downloads`,
          subtitle: "Guests have downloaded photos from your events",
          time: new Date().toISOString(), isNew: false,
        });
      }

      const combined = [...eventItems, ...activityItems]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setNotifications([welcome, ...combined]);
      setUnreadCount(combined.filter(n => n.isNew).length);
    } catch { /* non-critical */ }
    finally { setNotifsLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  useEffect(() => { void fetchNotifications(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = () => {
    localStorage.setItem("dash_notif_last_seen", new Date().toISOString());
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    setUnreadCount(0);
  };

  const pageTitle = navItems.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard";

  if (!_hasHydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`dashboard-shell dashboard-theme-${theme} flex h-screen overflow-hidden`}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white"
        style={{ borderRight: "1px solid rgba(255,45,120,0.08)", boxShadow: "2px 0 16px rgba(255,45,120,0.04)" }}>
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
              style={{ borderRight: "1px solid rgba(255,45,120,0.1)", boxShadow: "4px 0 32px rgba(255,45,120,0.08)" }}>
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="px-5 py-3.5 flex items-center gap-3 bg-white flex-shrink-0 relative z-30"
          style={{ borderBottom: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 1px 8px rgba(255,45,120,0.04)" }}>

          <button className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-deep hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={19} />
          </button>

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex-shrink-0">
            <Image src="/logo.jpg" alt="PhotoFly" width={110} height={28} className="h-7 w-auto object-contain" />
          </Link>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:block">Dashboard</span>
            {pageTitle !== "Overview" && (
              <><ChevronRight size={13} className="text-slate-300 hidden sm:block" />
                <span className="font-semibold text-deep">{pageTitle}</span></>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                aria-label="Notifications"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  border: `1px solid ${notifOpen ? "rgba(255,45,120,0.35)" : "rgba(255,45,120,0.12)"}`,
                  background: notifOpen ? "rgba(255,45,120,0.06)" : "transparent",
                  color: notifOpen ? "#FF2D78" : "#94A3B8",
                }}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", lineHeight: 1 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-11 w-80 bg-white rounded-2xl overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12),0 4px 16px rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.12)", zIndex: 50 }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(255,45,120,0.08)" }}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-deep">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}>{unreadCount}</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="flex items-center gap-1 text-xs font-semibold transition-colors"
                          style={{ color: "#FF2D78" }}>
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="overflow-y-auto max-h-72">
                      {notifsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="w-5 h-5 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                            style={{ background: "rgba(255,45,120,0.06)" }}>
                            <Bell size={20} style={{ color: "#FF2D78" }} />
                          </div>
                          <p className="text-sm font-semibold text-deep mb-1">All caught up!</p>
                          <p className="text-xs text-slate-400">No recent activity yet.</p>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <motion.div key={n.id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 px-4 py-3 cursor-default"
                            style={{
                              borderBottom: i < notifications.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                              background: n.type === "welcome"
                                ? "linear-gradient(135deg,rgba(255,45,120,0.03),rgba(168,85,247,0.03))"
                                : undefined,
                            }}
                            onMouseEnter={e => { if (n.type !== "welcome") (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                            onMouseLeave={e => { if (n.type !== "welcome") (e.currentTarget as HTMLElement).style.background = ""; }}>
                            <NotifIcon type={n.type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold leading-tight truncate"
                                  style={n.type === "welcome" ? {
                                    background: "linear-gradient(135deg,#FF2D78,#A855F7)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                  } : { color: "#1A0A12" }}>
                                  {n.title}
                                </p>
                                {n.isNew && (
                                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                    style={{ background: "#FF2D78" }} />
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
                    <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,45,120,0.07)" }}>
                      <Link href="/dashboard/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: "#FF2D78" }}>
                        View all notifications <ChevronRight size={11} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile button — direct link to settings ── */}
            <Link href="/dashboard/settings"
              aria-label="My profile"
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all hover:scale-[1.02]"
              style={{ border: "1px solid rgba(255,45,120,0.12)", background: "rgba(255,45,120,0.03)" }}>
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 2px 6px rgba(255,45,120,0.35)" }}>
                {user?.avatar
                  ? <Image src={user.avatar} alt={user.name ?? ""} width={28} height={28} className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-deep leading-none">{user?.name ?? "Photographer"}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Camera size={9} style={{ color: "#FF2D78" }} /> My Profile
                </div>
              </div>
            </Link>

          </div>
        </header>

        <main className="dashboard-main flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
