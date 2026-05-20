"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, Images,
  LogOut, Menu, X, ChevronRight, Shield, Bell,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import NextImage from "next/image";

const navItems = [
  { icon: <LayoutDashboard size={16} />, label: "Overview", href: "/admin" },
  { icon: <Users size={16} />,          label: "Users",    href: "/admin/users" },
  { icon: <CalendarDays size={16} />,   label: "Events",   href: "/admin/events" },
  { icon: <Images size={16} />,         label: "Photos",   href: "/admin/photos" },
  { icon: <BarChart3 size={16} />,      label: "Analytics",href: "/admin/analytics" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Navigation</p>
        {navItems.map(item => {
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

      {/* User + logout */}
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user }  = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked]         = useState(false);

  // Client-side admin guard
  useEffect(() => {
    if (user === null) { router.replace("/auth/login"); return; }
    if (user.role !== "admin") { router.replace("/dashboard"); return; }
    setChecked(true);
  }, [user, router]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = navItems.find(n =>
    n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Admin";

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
        {/* Top bar */}
        <header className="px-5 py-3.5 flex items-center gap-4 bg-white flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 1px 6px rgba(239,68,68,0.04)" }}>
          <button className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-deep hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:block">Admin</span>
            {pageTitle !== "Overview" && (
              <>
                <ChevronRight size={13} className="text-slate-300 hidden sm:block" />
                <span className="font-semibold text-deep">{pageTitle}</span>
              </>
            )}
            {pageTitle === "Overview" && (
              <span className="font-semibold text-deep hidden sm:block">Overview</span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-deep hover:bg-slate-100 transition-colors relative"
              style={{ border: "1px solid rgba(239,68,68,0.1)" }}>
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Shield size={12} /> Super Admin
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


