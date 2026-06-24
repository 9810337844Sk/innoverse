"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Sparkles, CheckCircle, Send, Shield } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email address"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json() as { message: string };
      if (!res.ok) throw new Error(data.message);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#FAFBFC" }}>

      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#1A0A12 0%,#2D0F1E 50%,#1A0A12 100%)" }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle,#FF2D78 0%,transparent 65%)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 65%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 animate-blob"
            style={{ background: "radial-gradient(circle,#FF6B9D 0%,transparent 60%)" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="mb-auto" />
          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,45,120,0.15)", color: "#FF6B9D", border: "1px solid rgba(255,45,120,0.25)" }}>
                <Shield size={11} /> Account Recovery
              </span>
              <h2 className="font-black text-4xl text-white leading-tight mb-4">
                Forgot your<br />
                <span style={{ background: "linear-gradient(135deg,#FF2D78,#FF6B9D,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  password?
                </span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                No worries. Enter your email and we&apos;ll send a secure reset link straight to your inbox.
              </p>

              {[
                { icon: "🔐", title: "Secure link", desc: "Encrypted reset token" },
                { icon: "⚡", title: "Expires fast", desc: "Valid for 15 minutes only" },
                { icon: "🔄", title: "Single use",   desc: "Link becomes invalid after use" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.15)" }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white/80">{item.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex gap-2 mt-auto pt-8">
            {[55, 56, 57, 58, 59].map((s, i) => (
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
            style={{ background: "radial-gradient(circle,#FF2D78 0%,transparent 70%)" }} />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/">
              <Image src="/logo.jpg" alt="PhotoFly" width={130} height={34} className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* Back link */}
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 8px 24px rgba(255,45,120,0.3)" }}>
                    <Mail size={24} className="text-white" />
                  </div>
                  <h1 className="font-black text-3xl text-deep tracking-tight mb-2">Reset password</h1>
                  <p className="text-slate-500 text-sm">
                    Enter your account email and we&apos;ll send a secure reset link.
                  </p>
                </div>

                <div className="rounded-3xl p-7 bg-white"
                  style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 8px 40px rgba(255,45,120,0.08),0 2px 8px rgba(0,0,0,0.04)" }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#FF2D78" }} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
                          style={{ background: "#FFF5F8", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
                          onFocus={e => { e.target.style.borderColor = "#FF2D78"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.1)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,45,120,0.15)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading || !email.trim()}
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 20px rgba(255,45,120,0.3)" }}>
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                        : <><Send size={16} /> Send Reset Link</>}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 text-center text-sm text-slate-500"
                    style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
                    Remember your password?{" "}
                    <Link href="/auth/login" className="font-bold hover:underline" style={{ color: "#FF2D78" }}>
                      Sign in
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mt-6">
                  {[
                    { icon: <Shield size={13} />, text: "Secure link" },
                    { icon: <Sparkles size={13} />, text: "Instant delivery" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span style={{ color: "#FF2D78" }}>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="sent"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>

                <div className="rounded-3xl p-8 bg-white text-center"
                  style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 8px 40px rgba(255,45,120,0.08)" }}>

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 12px 32px rgba(255,45,120,0.35)" }}>
                    <CheckCircle size={36} className="text-white" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <h2 className="font-black text-2xl text-deep tracking-tight mb-3">Check your inbox</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-2">
                      If <span className="font-semibold text-deep">{email}</span> is registered,
                      you&apos;ll receive a password reset link within a few seconds.
                    </p>
                    <p className="text-slate-400 text-xs mb-6">
                      Click the link in the email to create a new password. The link expires in 15 minutes and can only be used once. Check your spam folder if you don&apos;t see it.
                    </p>

                    <div className="space-y-3">
                      <button onClick={() => { setSent(false); }}
                        className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                        style={{ background: "rgba(255,45,120,0.06)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                        Try a different email
                      </button>
                      <Link href="/auth/login"
                        className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ background: "#F1F5F9", color: "#475569" }}>
                        <ArrowLeft size={14} /> Back to sign in
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
