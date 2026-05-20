"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Garima S.",  role: "Wedding Guest",        text: "Found all my photos from Sachin & Alysa Carson's Wedding in literally 3 seconds. Absolutely mind-blowing!", rating: 5, accent: "#FF6B61" },
  { name: "Srina R.",   role: "Event Attendee",        text: "I couldn't believe how fast it found me in every group shot. PhotoFly is a game changer for events!", rating: 5, accent: "#A992FF" },
  { name: "Harshit K.", role: "Event Photographer",    text: "My clients are obsessed. I upload 2000 photos and everyone finds their own instantly. Best tool I've used.", rating: 5, accent: "#2DD4BF" },
  { name: "Anurag M.",  role: "Corporate Attendee",    text: "Found myself in crowd shots I didn't even know existed. The AI accuracy is incredible.", rating: 5, accent: "#FF6B61" },
  { name: "Sachin K.",  role: "Wedding Photographer",  text: "Shot Sachin & Alysa Carson's Wedding — every guest found their photos before leaving the venue!", rating: 5, accent: "#A992FF" },
  { name: "Alysa C.",   role: "Wedding Guest",         text: "Found all 47 photos from Sachin & Alysa Carson's Wedding in literally 3 seconds. Mind-blowing!", rating: 5, accent: "#2DD4BF" },
  { name: "James K.",   role: "Event Photographer",    text: "My clients love it. I upload 2000 photos and everyone finds their own instantly. Game changer.", rating: 5, accent: "#FF6B61" },
  { name: "Priya R.",   role: "Corporate Attendee",    text: "Found my photos without scrolling through 800 images. Absolutely incredible technology.", rating: 5, accent: "#A992FF" },
];

function Card({ t }: { t: typeof testimonials[0] }) {
  const initials = t.name.split(" ").map(p => p[0]).join("").slice(0, 2);

  return (
    <div
      className="mx-3 w-80 flex-shrink-0 rounded-2xl p-6 transition-all duration-300 group kinetic-card shine-card bg-white shadow-card"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${t.accent}20`,
      }}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-xs font-black text-white"
            style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}99)` }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #0D9488, #5EEAD4)", color: "#FFFFFF" }}
          >
            ✓
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-deep">{t.name}</div>
          <div className="text-xs text-slate-500">{t.role}</div>
        </div>
      </div>
      <Quote size={14} style={{ color: `${t.accent}50` }} className="mb-2" />
      <p className="mb-4 text-sm leading-relaxed text-slate-600">{t.text}</p>
      <div className="flex gap-1">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={11} style={{ color: t.accent, fill: t.accent }} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const row1 = [...testimonials.slice(0, 4), ...testimonials.slice(0, 4), ...testimonials.slice(0, 4)];
  const row2 = [...testimonials.slice(4), ...testimonials.slice(4), ...testimonials.slice(4)];

  return (
    <section className="relative overflow-hidden py-32" ref={ref}>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #FFF5F8 100%)" }}
      />

      <div className="relative mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center"
        >
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em]"
            style={{
              color: "#FF6B61",
              background: "rgba(255,107,97,0.08)",
              border: "1px solid rgba(255,107,97,0.2)",
            }}
          >
            Testimonials
          </span>
          <h2 className="mt-4 mb-6 font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-deep">
            Loved by{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B61, #A992FF, #2DD4BF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Thousands
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
            From intimate weddings to massive sporting events — people love finding their photos instantly.
          </p>
        </motion.div>
      </div>

      <div className="space-y-4 overflow-hidden">
        <div className="flex animate-marquee-left will-change-transform">
          {row1.map((t, i) => <Card key={i} t={t} />)}
        </div>
        <div className="flex animate-marquee-right will-change-transform">
          {row2.map((t, i) => <Card key={i} t={t} />)}
        </div>
      </div>

      {/* Edge fades */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-32"
        style={{ background: "linear-gradient(90deg, #FAFBFC, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-32"
        style={{ background: "linear-gradient(270deg, #FAFBFC, transparent)" }}
      />
    </section>
  );
}
