"use client";
import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Camera, Sparkles, Shield, Zap, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Image from "next/image";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const PERKS = [
  "Unlimited event creation",
  "AI face recognition for guests",
  "QR code sharing per event",
  "Google Drive photo sync",
  "Real-time analytics dashboard",
];

function RegisterForm() {
  const router  = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const user         = useAuthStore(s => s.user);
  const _hasHydrated = useAuthStore(s => s._hasHydrated);
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // If already logged in → redirect to dashboard
  useEffect(() => {
    if (_hasHydrated && user) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [_hasHydrated, user, router]);

  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, role: "photographer" }) as {
        data: { user: { role: string }; token: string };
      };
      setAuth(data.user as Parameters<typeof setAuth>[0], data.token);
      toast.success("Account created! Welcome to PhotoFly 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#FAFBFC" }}>

      {/* ── Left panel — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1A0A12 0%, #2D0F1E 50%, #1A0A12 100%)" }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 65%)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 65%)" }} />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* spacer */}
          <div className="mb-auto" />

          {/* Copy */}
          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,45,120,0.15)", color: "#FF6B9D", border: "1px solid rgba(255,45,120,0.25)" }}>
                <Sparkles size={11} /> Free to get started
              </span>
              <h2 className="font-black text-4xl text-white leading-tight mb-4">
                Start delivering<br />
                <span style={{
                  background: "linear-gradient(135deg, #FF2D78, #FF6B9D, #A855F7)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  photos smarter.
                </span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Set up your first event in minutes. Guests find their photos instantly with AI face recognition.
              </p>

              {/* Perks list */}
              <div className="space-y-3">
                {PERKS.map((perk, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,45,120,0.2)" }}>
                      <CheckCircle size={12} style={{ color: "#FF6B9D" }} />
                    </div>
                    <span className="text-sm text-white/65">{perk}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom photo strip */}
          <div className="flex gap-2 mt-auto pt-8">
            {[50, 51, 52, 53, 54].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex-1 aspect-square rounded-xl overflow-hidden" style={{ opacity: 0.45 }}>
                <Image src={`https://picsum.photos/seed/${s}/120/120`} alt="" width={120} height={120}
                  className="object-cover w-full h-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 70%)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/">
              <Image src="/logo.jpg" alt="PhotoFly" width={130} height={34} className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-black text-3xl text-deep tracking-tight mb-2">Create account</h1>
            <p className="text-slate-500 text-sm">Join photographers already using PhotoFly</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-7 bg-white"
            style={{
              border: "1px solid rgba(255,45,120,0.12)",
              boxShadow: "0 8px 40px rgba(255,45,120,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            }}>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <Input
                label="Full Name"
                placeholder="Your full name"
                icon={<User size={16} />}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
                required
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="new-email"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                icon={<Lock size={16} />}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
                minLength={8}
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-5 text-center text-sm text-slate-500"
              style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
              Already have an account?{" "}
              <Link href="/auth/login"
                className="font-bold hover:underline transition-colors"
                style={{ color: "#FF2D78" }}>
                Sign in
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: <Shield size={13} />, text: "Secure signup" },
              { icon: <Zap size={13} />,    text: "Free forever" },
              { icon: <Camera size={13} />, text: "No credit card" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span style={{ color: "#FF2D78" }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
