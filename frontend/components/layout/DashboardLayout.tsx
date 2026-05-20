"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Images,
  BarChart3, Settings, LogOut, Menu, X, ChevronRight,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

const navItems = [
  { icon: <LayoutDashboard size={17} />, label: "Overview",  href: "/dashboard" },
  { icon: <CalendarDays size={17} />,   label: "Events",    href: "/dashboard/events" },
  { icon: <Images size={17} />,         label: "Photos",    href: "/dashboard/photos" },
  { icon: <BarChart3 size={17} />,      label: "Analytics", href: "/dashboard/analytics" },
  { icon: <Settings size={17} />,       label: "Settings",  href: "/dashboard/settings" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,45,120,0.08)" }}>
        <Link href="/" className="flex items-center" onClick={onClose}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 4px 14px rgba(255,45,120,0.2)" }}
          >
            <Image src="/logo.jpg" alt="PhotoFly logo" width={140} height={36} className="h-9 w-auto object-contain" />
          </motion.div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Navigation</p>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                active ? "text-deep" : "text-slate-500 hover:text-deep"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,45,120,0.08), rgba(168,85,247,0.05))",
                    border: "1px solid rgba(255,45,120,0.15)",
                  }}
                />
              )}
              {!active && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,45,120,0.04)" }} />
              )}
              <span className={`relative z-10 transition-colors flex-shrink-0 ${active ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}>
                {item.icon}
              </span>
              <span className="relative z-10 flex-1">{item.label}</span>
              {active && (
                <ChevronRight size={13} className="ml-auto relative z-10 flex-shrink-0" style={{ color: "#A855F7" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
        <div className="mt-4 rounded-2xl p-3 mb-2"
          style={{ background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.1)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)", boxShadow: "0 2px 8px rgba(255,45,120,0.25)" }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-deep truncate leading-tight">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all w-full group"
        >
          <LogOut size={15} className="group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/"); };

  // Page title from pathname
  const pageTitle = navItems.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white"
        style={{ borderRight: "1px solid rgba(255,45,120,0.08)", boxShadow: "2px 0 16px rgba(255,45,120,0.04)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden bg-white"
              style={{ borderRight: "1px solid rgba(255,45,120,0.1)", boxShadow: "4px 0 32px rgba(255,45,120,0.08)" }}
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="px-5 py-3.5 flex items-center gap-4 bg-white flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 1px 8px rgba(255,45,120,0.04)" }}>
          <button
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-deep hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={19} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:block">Dashboard</span>
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

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-deep hover:bg-slate-100 transition-colors relative"
              style={{ border: "1px solid rgba(255,45,120,0.1)" }}>
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)" }}
              title={user?.name}>
              {user?.name?.[0]?.toUpperCase() || "U"}
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
