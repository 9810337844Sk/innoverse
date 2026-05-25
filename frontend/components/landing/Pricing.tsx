"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, Clock, Camera, Zap, Building2 } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "NPR 0",
    period: "forever",
    desc: "Perfect for trying out PhotoFly",
    free: true,
    comingSoon: false,
    features: [
      "1 event/month",
      "Up to 100 photos",
      "Basic face search",
      "Standard support",
    ],
    cta: "Get Started Free",
    href: "/auth/register",
    highlight: false,
    icon: <Camera size={21} />,
    accent: "#A992FF",
    accentBg: "rgba(169,146,255,0.08)",
    accentBorder: "rgba(169,146,255,0.2)",
  },
  {
    name: "Pro",
    price: "NPR 3,999",
    period: "per month",
    desc: "For active photographers",
    free: false,
    comingSoon: true,
    features: [
      "Unlimited events",
      "5,000 photos/event",
      "Priority AI processing",
      "QR code generation",
      "Custom watermarks",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Coming Soon",
    href: "",
    highlight: true,
    icon: <Zap size={21} />,
    accent: "#FF6B61",
    accentBg: "rgba(255,107,97,0.1)",
    accentBorder: "rgba(255,107,97,0.3)",
  },
  {
    name: "Studio",
    price: "NPR 13,499",
    period: "per month",
    desc: "For professional studios",
    free: false,
    comingSoon: true,
    features: [
      "Everything in Pro",
      "Unlimited photos",
      "Video face detection",
      "White-label branding",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Coming Soon",
    href: "",
    highlight: false,
    icon: <Building2 size={21} />,
    accent: "#2DD4BF",
    accentBg: "rgba(45,212,191,0.08)",
    accentBorder: "rgba(45,212,191,0.2)",
  },
];

export default function Pricing() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="pricing" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" ref={ref}>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 55%, #FFF5F8 100%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05] animate-blob blur-3xl"
        style={{ background: "radial-gradient(circle, #A992FF 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <span
            className="inline-block text-sm font-bold uppercase tracking-[0.2em] mb-4 px-4 py-1.5 rounded-full"
            style={{
              color: "#A992FF",
              background: "rgba(169,146,255,0.08)",
              border: "1px solid rgba(169,146,255,0.25)",
            }}
          >
            Pricing
          </span>
          <h2 className="font-black text-3xl sm:text-5xl lg:text-6xl mt-4 mb-6 text-deep tracking-tight">
            Simple,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B61, #A992FF, #2DD4BF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-slate-500 text-base">Start free. More plans launching soon.</p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 items-center">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
                p.comingSoon ? "opacity-70" : "kinetic-card shine-card"
              } ${p.highlight ? "md:scale-105" : ""}`}
              style={{
                background: p.highlight
                  ? `linear-gradient(135deg, ${p.accentBg}, #FFFFFF)`
                  : "#FFFFFF",
                border: `1px solid ${p.accentBorder}`,
                boxShadow: p.highlight
                  ? `0 12px 40px ${p.accent}18`
                  : "0 4px 24px rgba(15,23,42,0.06)",
              }}
            >
              {/* Most Popular badge */}
              {p.highlight && !p.comingSoon && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #FF6B61, #A992FF)",
                    boxShadow: "0 4px 16px rgba(255,107,97,0.4)",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Coming Soon badge */}
              {p.comingSoon && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #64748b, #94a3b8)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(100,116,139,0.3)",
                  }}
                >
                  <Clock size={11} /> Coming Soon
                </div>
              )}

              {/* Plan info */}
              <div className="mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                  style={{ background: p.accentBg, border: `1px solid ${p.accentBorder}` }}
                >
                  <span style={{ color: p.accent }}>{p.icon}</span>
                </div>
                <h3 className="font-bold text-xl mb-1 text-deep">{p.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{p.desc}</p>
                <div className="flex items-end gap-1">
                  <span
                    className="font-black text-4xl"
                    style={{ color: p.comingSoon ? "#94a3b8" : "#1A0A12" }}
                  >
                    {p.price}
                  </span>
                  <span className="text-slate-400 text-sm mb-1">/{p.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-500">
                    <Check
                      size={15}
                      style={{ color: p.comingSoon ? "#94a3b8" : p.accent }}
                      className="flex-shrink-0"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {p.free ? (
                <Link href={p.href}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-2xl font-bold text-sm text-deep transition-all uppercase tracking-wide bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary-pale"
                  >
                    {p.cta}
                  </motion.button>
                </Link>
              ) : (
                <div
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-not-allowed select-none"
                  style={{
                    background: "rgba(100,116,139,0.08)",
                    color: "#94a3b8",
                    border: "1px solid rgba(100,116,139,0.2)",
                  }}
                >
                  <Clock size={14} /> {p.cta}
                </div>
              )}

              {/* Notify me link for coming soon */}
              {p.comingSoon && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  Want early access?{" "}
                  <a
                    href="/contact"
                    className="font-semibold hover:underline"
                    style={{ color: p.accent }}
                  >
                    Let us know →
                  </a>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-slate-400 mt-12 flex items-center justify-center gap-2"
        >
          <Clock size={14} />
          Pro &amp; Studio plans are under development — sign up free and we&apos;ll notify you when they launch.
        </motion.p>
      </div>
    </section>
  );
}
