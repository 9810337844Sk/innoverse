"use client";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Home, Info, Mail, Zap, Star, DollarSign, LayoutDashboard, Shield, LogOut, User, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

// ── Nav link definitions ────────────────────────────────────────────────────
const landingAnchors = [
  { label: "How it Works", href: "#how-it-works", icon: Zap },
  { label: "Features",     href: "#features",     icon: Star },
  { label: "Pricing",      href: "#pricing",      icon: DollarSign },
];

const pageLinks = [
  { label: "About",   href: "/about",   icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

const allLinks = [
  { label: "Home",         href: "/",              icon: Home },
  { label: "Find Photos",  href: "/find",          icon: Search },
  { label: "How it Works", href: "/#how-it-works", icon: Zap },
  { label: "Features",     href: "/#features",     icon: Star },
  { label: "Pricing",      href: "/#pricing",      icon: DollarSign },
  { label: "About",        href: "/about",         icon: Info },
  { label: "Contact",      href: "/contact",       icon: Mail },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { scrollY }   = useScroll();
  const pathname      = usePathname();
  const router        = useRouter();
  const isLanding     = pathname === "/";
  const { user, logout } = useAuthStore();
  const _hasHydrated     = useAuthStore(s => s._hasHydrated);
  const dropdownRef      = useRef<HTMLDivElement>(null);

  const desktopLinks = isLanding
    ? [...landingAnchors, ...pageLinks]
    : [
        { label: "Home",        href: "/",        icon: Home },
        { label: "Find Photos", href: "/find",    icon: Search },
        { label: "About",       href: "/about",   icon: Info },
        { label: "Contact",     href: "/contact", icon: Mail },
      ];

  useEffect(() => {
    const unsub = scrollY.on("change", v => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith("#") || href.includes("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel = user?.role === "admin" ? "Admin Panel" : "Studio Dashboard";
  const DashboardIcon  = user?.role === "admin" ? Shield : LayoutDashboard;

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.94)",
        borderBottom: "1px solid rgba(255,45,120,0.12)",
        boxShadow: scrolled ? "0 4px 32px rgba(255,45,120,0.10), 0 1px 4px rgba(0,0,0,0.04)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ background: "linear-gradient(90deg, #FF2D78 0%, #FF6B9D 40%, #A855F7 70%, #0D9488 100%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="rounded-xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: "0 4px 16px rgba(255,45,120,0.25)" }}>
              <Image src="/logo.jpg" alt="PhotoFly logo" width={160} height={41} className="h-10 w-auto object-contain" />
            </motion.div>
          </Link>

          {/* ── Desktop nav pill ── */}
          <nav className="hidden md:flex items-center gap-0.5 rounded-2xl px-1.5 py-1"
            style={{
              background: "rgba(255,245,248,0.9)",
              border: "1px solid rgba(255,45,120,0.14)",
              backdropFilter: "blur(8px)",
            }}>
            {desktopLinks.map(l => {
              const active   = isActive(l.href);
              const isAnchor = l.href.startsWith("#") || l.href.includes("/#");
              const Tag      = isAnchor ? "a" : Link;
              const href     = isAnchor && l.href.startsWith("/#") && isLanding
                ? l.href.replace("/#", "#") : l.href;
              return (
                <Tag key={l.href} href={href as string}
                  className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 group flex items-center gap-1.5 ${
                    active ? "text-primary" : "text-deep/65 hover:text-primary"
                  }`}
                  style={active ? { background: "rgba(255,45,120,0.1)" } : {}}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,45,120,0.06)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {l.label}
                  {active && (
                    <motion.span layoutId="nav-indicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                      style={{ background: "linear-gradient(90deg, #FF2D78, #FF6B9D)" }} />
                  )}
                </Tag>
              );
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            {/* Find Photos quick-access on landing */}
            {isLanding && (
              <Link href="/find">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  style={{ background: "rgba(255,45,120,0.07)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                  <Search size={14} /> Find Photos
                </motion.button>
              </Link>
            )}

            {/* Wait for hydration — avoids SSR mismatch flicker */}
            {!_hasHydrated ? (
              <div className="w-24 h-9 rounded-xl skeleton" />
            ) : user ? (
              /* ── Logged-in user dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: dropdownOpen ? "rgba(255,45,120,0.08)" : "rgba(255,45,120,0.05)",
                    border: "1px solid rgba(255,45,120,0.18)",
                  }}>
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)" }}>
                    {user.avatar ? (
                      <Image src={user.avatar} alt={`${user.name} profile`} width={28} height={28} className="h-full w-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase() ?? "U"
                    )}
                  </div>
                  <span className="text-sm font-semibold text-deep max-w-[100px] truncate">{user.name}</span>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-slate-400" />
                  </motion.div>
                </motion.button>

                {/* Dropdown panel */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl overflow-hidden"
                      style={{ boxShadow: "0 16px 48px rgba(255,45,120,0.15), 0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(255,45,120,0.12)" }}>

                      {/* User info */}
                      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,45,120,0.08)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)", boxShadow: "0 2px 8px rgba(255,45,120,0.3)" }}>
                            {user.avatar ? (
                              <Image src={user.avatar} alt={`${user.name} profile`} width={36} height={36} className="h-full w-full object-cover" />
                            ) : (
                              user.name?.[0]?.toUpperCase() ?? "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-deep truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        {/* Role badge */}
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                            style={user.role === "admin"
                              ? { background: "rgba(239,68,68,0.1)", color: "#EF4444" }
                              : user.role === "photographer"
                              ? { background: "rgba(255,45,120,0.1)", color: "#FF2D78" }
                              : { background: "rgba(99,102,241,0.1)", color: "#6366F1" }
                            }>
                            {user.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <Link href={dashboardHref} onClick={() => setDropdownOpen(false)}>
                          <motion.div whileHover={{ x: 2 }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group"
                            style={{ background: "rgba(255,45,120,0.04)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,45,120,0.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,45,120,0.04)")}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)", boxShadow: "0 2px 8px rgba(255,45,120,0.25)" }}>
                              <DashboardIcon size={14} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-deep">{dashboardLabel}</p>
                              <p className="text-xs text-slate-400">{dashboardHref}</p>
                            </div>
                          </motion.div>
                        </Link>

                        <div className="my-1.5" style={{ height: "1px", background: "rgba(255,45,120,0.07)" }} />

                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(239,68,68,0.08)" }}>
                            <LogOut size={14} className="text-red-500" />
                          </div>
                          <span className="text-sm font-semibold text-red-500">Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest buttons ── */
              <>
                <Link href="/auth/login">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    style={{ color: "#1A0A12", opacity: 0.65 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "rgba(255,45,120,0.06)"; (e.currentTarget as HTMLElement).style.color = "#FF2D78"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.65"; (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#1A0A12"; }}>
                    Login
                  </motion.button>
                </Link>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(255,45,120,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    className="text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)", boxShadow: "0 4px 18px rgba(255,45,120,0.32)" }}>
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <motion.button whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ background: "#FFF0F5", border: "1px solid rgba(255,45,120,0.18)" }}
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <AnimatePresence mode="wait">
              {mobileOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} className="text-primary" /></motion.div>
                : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} className="text-primary" /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden"
            style={{ background: "#FFFFFF", borderTop: "1px solid rgba(255,45,120,0.1)" }}>
            <div className="px-4 py-4 space-y-1">

              {/* Nav links */}
              {allLinks.map((l, i) => {
                const active   = isActive(l.href);
                const Icon     = l.icon;
                const isAnchor = l.href.startsWith("#") || l.href.includes("/#");
                const Tag      = isAnchor ? "a" : Link;
                const href     = isAnchor && l.href.startsWith("/#") && isLanding
                  ? l.href.replace("/#", "#") : l.href;
                return (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}>
                    <Tag href={href as string} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
                        active ? "text-primary bg-primary-pale" : "text-deep/70 hover:text-primary hover:bg-primary-pale"
                      }`}>
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-primary text-white" : "bg-primary-pale text-primary"}`}
                        style={active ? { boxShadow: "0 2px 10px rgba(255,45,120,0.3)" } : {}}>
                        <Icon size={15} />
                      </span>
                      {l.label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Tag>
                  </motion.div>
                );
              })}

              {/* Auth / user section */}
              <div className="pt-3 mt-2" style={{ borderTop: "1px solid rgba(255,45,120,0.1)" }}>
                {!_hasHydrated ? (
                  <div className="h-12 rounded-2xl skeleton" />
                ) : user ? (
                  <div className="space-y-2">
                    {/* User info card */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.1)" }}>
                      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)" }}>
                        {user.avatar ? (
                          <Image src={user.avatar} alt={`${user.name} profile`} width={36} height={36} className="h-full w-full object-cover" />
                        ) : (
                          user.name?.[0]?.toUpperCase() ?? "U"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-deep truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
                      </div>
                    </div>
                    {/* Dashboard link */}
                    <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all"
                        style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.08), rgba(168,85,247,0.06))", border: "1px solid rgba(255,45,120,0.15)", color: "#FF2D78" }}>
                        <DashboardIcon size={16} />
                        {dashboardLabel}
                      </div>
                    </Link>
                    {/* Logout */}
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-red-500 transition-all"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all"
                        style={{ color: "#FF2D78", border: "1.5px solid rgba(255,45,120,0.25)", background: "rgba(255,45,120,0.04)" }}>
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 rounded-2xl text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
