"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, Clock, Camera, Zap, Building2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "forever",
    desc: "Everything you need to start finding photos instantly.",
    free: true,
    comingSoon: false,
    features: [
      "Unlimited events",
      "Unlimited photos per event",
      "AI face search",
      "Guest download links",
      "Google Drive photo sync",
      "QR code generation",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start for Free",
    href: "/auth/register",
    highlight: false,
    icon: <Camera size={20} />,
    accent: "#A855F7",
    accentLight: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.18)",
  },
  {
    name: "Pro",
    price: "NPR 3,999",
    priceNote: "per month",
    desc: "Perfect plan for growing photographers and studios.",
    free: false,
    comingSoon: true,
    features: [
      "Unlimited events",
      "Unlimited photos per event",
      "AI face search",
      "Guest download links",
      "Google Drive photo sync",
      "QR code generation",
      "Custom watermarks",
      "Analytics dashboard",
      "Priority AI processing",
      "Priority support",
    ],
    cta: "Talk to PhotoFly",
    href: "/contact",
    highlight: true,
    icon: <Zap size={20} />,
    accent: "#FF2D78",
    accentLight: "rgba(255,45,120,0.06)",
    accentBorder: "rgba(255,45,120,0.22)",
  },
  {
    name: "Studio",
    price: "Custom",
    priceNote: "pricing",
    desc: "Tailored solutions for professional studios with high volume.",
    free: false,
    comingSoon: true,
    features: [
      "Everything in Pro",
      "Unlimited photos per event",
      "AI face search",
      "Guest download links",
      "Google Drive photo sync",
      "QR code generation",
      "Custom watermarks",
      "Analytics dashboard",
      "Priority AI processing",
      "White-label branding",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Dedicated onboarding",
    ],
    cta: "Talk to PhotoFly",
    href: "/contact",
    highlight: false,
    icon: <Building2 size={20} />,
    accent: "#2DD4BF",
    accentLight: "rgba(45,212,191,0.08)",
    accentBorder: "rgba(45,212,191,0.18)",
  },
];

export default function Pricing() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="pricing" className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 60%, #FFF5F8 100%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04] blur-3xl pointer-events-none animate-blob" style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <span
            className="inline-block text-xs font-black uppercase tracking-[0.22em] mb-5 px-4 py-1.5 rounded-full"
            style={{ color: "#A855F7", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            Pricing
          </span>
          <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl mb-5 text-deep tracking-tight leading-[1.06]">
            Everything included.{" "}
            <span style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7,#2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Start free.
            </span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            No credit card required. Pro & Studio plans coming soon with premium features.
          </p>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-16"
        >
          {[
            { value: "500+", label: "photographers" },
            { value: "15k+", label: "photos found" },
            { value: "4.9★", label: "avg rating" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span className="font-black text-deep">{s.value}</span> {s.label}
              {i < 2 && <span className="text-slate-200 hidden sm:inline">·</span>}
            </div>
          ))}
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 items-stretch mb-12">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.14, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl flex flex-col overflow-hidden ${p.highlight ? "md:-translate-y-4 md:shadow-2xl" : ""}`}
              style={{
                background: p.highlight
                  ? `linear-gradient(160deg, rgba(255,45,120,0.04) 0%, #FFFFFF 50%)`
                  : "#FFFFFF",
                border: `1.5px solid ${p.accentBorder}`,
                boxShadow: p.highlight
                  ? `0 20px 60px rgba(255,45,120,0.12), 0 2px 0 rgba(255,255,255,0.9) inset`
                  : `0 4px 24px rgba(15,23,42,0.05)`,
              }}
            >
              {/* Badge */}
              {p.highlight && (
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#FF2D78,#A855F7,#2DD4BF)" }} />
              )}

              {p.highlight && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap z-20"
                  style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.35)" }}
                >
                  <Sparkles size={10} /> Most Popular
                </div>
              )}

              {p.comingSoon && !p.highlight && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap z-20"
                  style={{ background: "linear-gradient(135deg,#64748B,#94A3B8)", boxShadow: "0 4px 12px rgba(71,85,105,0.3)" }}
                >
                  <Sparkles size={10} /> Coming Soon
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Plan header */}
                <div className="mb-7">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: p.accentLight, border: `1px solid ${p.accentBorder}`, color: p.accent }}
                  >
                    {p.icon}
                  </div>
                  <h3 className="font-black text-xl mb-1 text-deep tracking-tight">{p.name}</h3>
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">{p.desc}</p>
                  <div className="flex items-end gap-1.5">
                    <span
                      className="font-black text-4xl tracking-tight leading-none"
                      style={{ color: p.comingSoon && !p.highlight ? "#94a3b8" : "#1A0A12" }}
                    >
                      {p.price}
                    </span>
                    <span className="text-slate-400 text-sm mb-0.5">/ {p.priceNote}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px mb-6" style={{ background: `${p.accent}14` }} />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: p.comingSoon && !p.highlight ? "rgba(148,163,184,0.1)" : `${p.accent}12`,
                          color: p.comingSoon && !p.highlight ? "#94a3b8" : p.accent,
                        }}
                      >
                        <Check size={11} strokeWidth={2.5} />
                      </div>
                      <span style={{ color: p.comingSoon && !p.highlight ? "#94a3b8" : "#475569" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {p.free ? (
                  <Link href={p.href}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: "linear-gradient(135deg,#1A0A12,#2D1A26)",
                        color: "#FFFFFF",
                        boxShadow: "0 4px 16px rgba(26,10,18,0.2)",
                      }}
                    >
                      {p.cta} <ArrowRight size={14} />
                    </motion.button>
                  </Link>
                ) : p.comingSoon ? (
                  <Link href={p.href}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: p.highlight 
                          ? "linear-gradient(135deg, rgba(255,45,120,0.08), rgba(168,85,247,0.08))"
                          : "rgba(100,116,139,0.06)",
                        color: p.highlight ? p.accent : "#94a3b8",
                        border: `1.5px solid ${p.highlight ? p.accentBorder : "rgba(100,116,139,0.15)"}`,
                      }}
                    >
                      {p.cta} <ArrowRight size={14} />
                    </motion.button>
                  </Link>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <Sparkles size={13} />
            Get started in seconds —
            <a href="/auth/register" className="font-semibold text-deep hover:text-primary transition-colors">
              create your free account
            </a>
            and start finding photos with AI.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
