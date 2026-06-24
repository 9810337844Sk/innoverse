"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Garima S.",  role: "Wedding Guest",       text: "Found all my photos from the wedding in literally 3 seconds. Absolutely mind-blowing — I didn't even know half those photos existed!", rating: 5, accent: "#FF2D78" },
  { name: "Srina R.",   role: "Event Attendee",       text: "I couldn't believe how fast it found me in every group shot. This is genuinely magic — it found me in photos I was barely visible in.", rating: 5, accent: "#A855F7" },
  { name: "Harshit K.", role: "Event Photographer",   text: "My clients are obsessed. I upload 2000 photos, everyone finds their own before they even leave the venue. Best tool I've touched.", rating: 5, accent: "#2DD4BF" },
  { name: "Anurag M.",  role: "Corporate Attendee",   text: "Found myself in crowd shots I didn't even know existed. The AI accuracy is incredible for a conference with 800+ people.", rating: 5, accent: "#FF2D78" },
  { name: "Sachin K.",  role: "Wedding Photographer", text: "Shot a 300-guest wedding — every single guest found their photos before leaving. Zero support requests, zero confusion. Phenomenal.", rating: 5, accent: "#A855F7" },
  { name: "Alysa C.",   role: "Wedding Guest",        text: "Found all 47 photos in seconds. The face recognition even found me in shots where I was half-turned away. Genuinely shocked.", rating: 5, accent: "#2DD4BF" },
  { name: "James K.",   role: "Event Photographer",   text: "Switched from manual email delivery to PhotoFly. Saved 3 hours per event and my clients leave happier every single time.", rating: 5, accent: "#FF2D78" },
  { name: "Priya R.",   role: "Corporate Attendee",   text: "Found my photos without scrolling through 800 images. This is the kind of product that makes you wonder how it wasn't built sooner.", rating: 5, accent: "#A855F7" },
];

const TRUST_STATS = [
  { value: "4.9", label: "out of 5 stars", sub: "from 200+ reviews" },
  { value: "500+", label: "photographers", sub: "trust PhotoFly" },
  { value: "15k+", label: "photos found", sub: "across all events" },
  { value: "<3s", label: "average match", sub: "no loading screens" },
];

function Card({ t, index }: { t: typeof testimonials[0]; index: number }) {
  const initials = t.name.split(" ").map(p => p[0]).join("").slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.07 }}
      className="mx-2 sm:mx-3 w-72 sm:w-80 flex-shrink-0 rounded-2xl p-6 group"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${t.accent}18`,
        boxShadow: `0 2px 20px rgba(15,23,42,0.05)`,
      }}
    >
      {/* Quote mark */}
      <div className="mb-3">
        <Quote size={16} style={{ color: `${t.accent}40` }} />
      </div>

      {/* Text */}
      <p className="text-sm leading-relaxed text-slate-600 mb-5">{t.text}</p>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={11} style={{ color: t.accent, fill: t.accent }} />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${t.accent}12` }}>
        <div className="relative flex-shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white"
            style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}aa)` }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg,#0D9488,#5EEAD4)", boxShadow: "0 1px 4px rgba(13,148,136,0.4)" }}
          >
            <span className="text-white text-[8px] font-black">✓</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-deep">{t.name}</div>
          <div className="text-xs text-slate-400">{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const row1 = [...testimonials.slice(0, 4), ...testimonials.slice(0, 4), ...testimonials.slice(0, 4)];
  const row2 = [...testimonials.slice(4), ...testimonials.slice(4), ...testimonials.slice(4)];

  return (
    <section className="relative overflow-hidden py-24 lg:py-36" ref={ref}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #FFF5F8 100%)" }} />

      <div className="relative mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span
            className="mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: "#FF2D78", background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.18)" }}
          >
            Testimonials
          </span>
          <h2 className="mt-0 mb-5 font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-deep leading-[1.06]">
            Loved by guests.{" "}
            <span style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7,#2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Trusted by pros.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 leading-relaxed">
            From intimate weddings to 1,000-person conferences — people love finding their photos in seconds.
          </p>
        </motion.div>

        {/* Trust stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {TRUST_STATS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl px-4 py-4 text-center"
              style={{ background: "#FFFFFF", border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(255,45,120,0.04)" }}
            >
              <div
                className="font-black text-2xl leading-none mb-1"
                style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                {s.value}
              </div>
              <div className="text-xs font-bold text-deep mb-0.5">{s.label}</div>
              <div className="text-[10px] text-slate-400">{s.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4 overflow-hidden">
        <div className="flex animate-marquee-left will-change-transform">
          {row1.map((t, i) => <Card key={i} t={t} index={i} />)}
        </div>
        <div className="flex animate-marquee-right will-change-transform">
          {row2.map((t, i) => <Card key={i} t={t} index={i} />)}
        </div>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 lg:w-40" style={{ background: "linear-gradient(90deg, #F8FAFC, transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 lg:w-40" style={{ background: "linear-gradient(270deg, #FFF5F8, transparent)" }} />
    </section>
  );
}
