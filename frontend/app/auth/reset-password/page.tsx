"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Strength = "weak" | "fair" | "good" | "strong";

function getPasswordStrength(pwd: string): { strength: Strength; score: number; checks: Record<string, boolean> } {
  const checks = {
    length:    pwd.length >= 8,
    upper:     /[A-Z]/.test(pwd),
    lower:     /[a-z]/.test(pwd),
    number:    /\d/.test(pwd),
    special:   /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const strength: Strength =
    score <= 1 ? "weak" :
    score <= 2 ? "fair" :
    score <= 3 ? "good" : "strong";
  return { strength, score, checks };
}

const STRENGTH_CONFIG = {
  weak:   { color: "#EF4444", bg: "rgba(239,68,68,0.1)",    label: "Weak",   bars: 1 },
  fair:   { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   label: "Fair",   bars: 2 },
  good:   { color: "#14B8A6", bg: "rgba(20,184,166,0.1)",   label: "Good",   bars: 3 },
  strong: { color: "#22C55E", bg: "rgba(34,197,94,0.1)",    label: "Strong", bars: 4 },
};

const CHECK_LABELS: Record<string, string> = {
  length:  "At least 8 characters",
  upper:   "Uppercase letter (A–Z)",
  lower:   "Lowercase letter (a–z)",
  number:  "Number (0–9)",
  special: "Special character (!@#…)",
};

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [tokenError, setTokenError] = useState("");

  const { strength, score, checks } = getPasswordStrength(password);
  const cfg      = STRENGTH_CONFIG[strength];
  const match    = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    if (!token) setTokenError("Missing reset token. Please use the link from your email.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (score < 4)            { toast.error("Please choose a stronger password"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json() as { message: string };
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed";
      if (msg.includes("expired") || msg.includes("Invalid") || msg.includes("already been used")) {
        setTokenError(msg);
      } else {
        toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  if (tokenError) {
    return (
      <div className="rounded-3xl p-8 bg-white text-center"
        style={{ border: "1px solid rgba(239,68,68,0.15)", boxShadow: "0 8px 40px rgba(239,68,68,0.06)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.08)" }}>
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="font-black text-xl text-deep mb-2">Link invalid or expired</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{tokenError}</p>
        <Link href="/auth/forgot-password"
          className="inline-block px-6 py-3 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl p-8 bg-white text-center"
        style={{ border: "1px solid rgba(34,197,94,0.15)", boxShadow: "0 8px 40px rgba(34,197,94,0.06)" }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg,#22C55E,#14B8A6)", boxShadow: "0 12px 32px rgba(34,197,94,0.3)" }}>
          <CheckCircle size={36} className="text-white" />
        </motion.div>
        <h2 className="font-black text-2xl text-deep tracking-tight mb-2">Password updated!</h2>
        <p className="text-slate-500 text-sm mb-1">Your password has been changed successfully.</p>
        <p className="text-slate-400 text-xs mb-6">Redirecting you to sign in…</p>
        <div className="h-1.5 rounded-full overflow-hidden mx-auto max-w-[200px]" style={{ background: "rgba(34,197,94,0.12)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#22C55E,#14B8A6)" }}
            initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "linear" }} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl p-7 bg-white"
      style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 8px 40px rgba(255,45,120,0.08),0 2px 8px rgba(0,0,0,0.04)" }}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#FF2D78" }} />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
              style={{ background: "#FFF5F8", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
              onFocus={e => { e.target.style.borderColor = "#FF2D78"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,45,120,0.15)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength bars */}
          {password.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }} className="mt-3">
              <div className="flex gap-1.5 mb-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: i <= cfg.bars ? cfg.color : "rgba(0,0,0,0.06)" }} />
                ))}
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label} password</span>
                <span className="text-xs text-slate-400">{score}/5 criteria met</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(checks).map(([key, ok]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    {ok
                      ? <CheckCircle size={11} className="flex-shrink-0" style={{ color: "#22C55E" }} />
                      : <XCircle   size={11} className="flex-shrink-0 text-slate-300" />}
                    <span className={`text-xs ${ok ? "text-slate-600" : "text-slate-400"}`}>
                      {CHECK_LABELS[key]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: match ? "#22C55E" : mismatch ? "#EF4444" : "#A855F7" }} />
            <input
              type={showConf ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
              style={{
                background: match ? "rgba(34,197,94,0.04)" : mismatch ? "rgba(239,68,68,0.04)" : "#F8F5FF",
                border: `1.5px solid ${match ? "rgba(34,197,94,0.3)" : mismatch ? "rgba(239,68,68,0.3)" : "rgba(168,85,247,0.15)"}`,
                color: "#1A0A12",
              }}
              onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${match ? "rgba(34,197,94,0.1)" : "rgba(168,85,247,0.1)"}`; }}
              onBlur={e => { e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <AnimatePresence>
            {match && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium mt-2" style={{ color: "#22C55E" }}>
                <CheckCircle size={11} /> Passwords match
              </motion.p>
            )}
            {mismatch && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium mt-2" style={{ color: "#EF4444" }}>
                <XCircle size={11} /> Passwords don&apos;t match
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button type="submit"
          disabled={loading || !match || score < 4}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 20px rgba(255,45,120,0.3)" }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating password…</>
            : <><KeyRound size={16} /> Set New Password</>}
        </button>
      </form>

      <div className="mt-6 pt-5 text-center text-sm text-slate-500"
        style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
        <Link href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline transition-colors"
          style={{ color: "#FF2D78" }}>
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "#FAFBFC" }}>

      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#1A0A12 0%,#2D0F1E 50%,#1A0A12 100%)" }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 65%)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle,#FF2D78 0%,transparent 65%)" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="mb-auto" />
          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(168,85,247,0.15)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.25)" }}>
                <Sparkles size={11} /> Secure Reset
              </span>
              <h2 className="font-black text-4xl text-white leading-tight mb-4">
                Choose a<br />
                <span style={{ background: "linear-gradient(135deg,#A855F7,#FF2D78,#FF6B9D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  new password.
                </span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Create a strong password to keep your PhotoFly account secure.
              </p>

              {[
                { bar: 1, label: "Weak",   color: "#EF4444" },
                { bar: 2, label: "Fair",   color: "#F59E0B" },
                { bar: 3, label: "Good",   color: "#14B8A6" },
                { bar: 4, label: "Strong", color: "#22C55E" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="flex items-center gap-3 mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(b => (
                      <div key={b} className="w-5 h-2.5 rounded-sm transition-all"
                        style={{ background: b <= item.bar ? item.color : "rgba(255,255,255,0.08)" }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex gap-2 mt-auto pt-8">
            {[60, 61, 62, 63, 64].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex-1 aspect-square rounded-xl overflow-hidden" style={{ opacity: 0.4 }}>
                <Image src={`https://picsum.photos/seed/${s}/120/120`} alt="" width={120} height={120}
                  className="object-cover w-full h-full" loading="lazy" unoptimized />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]">

          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/">
              <Image src="/logo.jpg" alt="PhotoFly" width={130} height={34} className="h-9 w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg,#A855F7,#FF2D78)", boxShadow: "0 8px 24px rgba(168,85,247,0.3)" }}>
              <KeyRound size={24} className="text-white" />
            </div>
            <h1 className="font-black text-3xl text-deep tracking-tight mb-2">Set new password</h1>
            <p className="text-slate-500 text-sm">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          <Suspense fallback={
            <div className="rounded-3xl p-7 bg-white flex items-center justify-center h-40"
              style={{ border: "1px solid rgba(255,45,120,0.12)" }}>
              <div className="w-6 h-6 border-2 border-slate-200 border-t-pink-500 rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
