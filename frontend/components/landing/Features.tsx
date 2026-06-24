"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Brain, Lock, Zap, Download, QrCode, Palette, Users, Globe, ScanFace, Shield } from "lucide-react";

const PRIMARY = [
  {
    icon: <Brain size={24} />,
    eyebrow: "FACENET512 · FAISS",
    title: "AI Face Recognition",
    desc: "128-dimensional facial embeddings match your face across thousands of photos — including group shots where you're not even the focus.",
    stats: [
      { value: "128", label: "dim embeddings" },
      { value: "10k+", label: "photos/search" },
      { value: "90%", label: "accuracy" },
    ],
    accent: "#FF2D78",
    glow: "rgba(255,45,120,0.12)",
    visual: (
      <div className="relative w-full flex items-center justify-center" style={{ height: 160 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map(r => (
            <motion.div
              key={r}
              className="absolute rounded-full"
              style={{ width: 60 + r * 48, height: 60 + r * 48, border: "1px solid rgba(255,45,120,0.18)" }}
              animate={{ scale: [1, 1.7 + r * 0.15], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, delay: r * 0.5, repeat: Infinity }}
            />
          ))}
        </div>
        <div className="relative z-10 flex gap-3 items-center">
          {[
            { label: "You", match: true },
            { label: "?", match: false },
            { label: "?", match: false },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.2, type: "spring" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black"
                style={{
                  border: f.match ? "2px solid #FF2D78" : "1.5px solid rgba(255,45,120,0.2)",
                  background: f.match ? "rgba(255,45,120,0.1)" : "rgba(255,45,120,0.03)",
                  color: f.match ? "#FF2D78" : "rgba(255,45,120,0.3)",
                  boxShadow: f.match ? "0 0 20px rgba(255,45,120,0.3)" : "none",
                }}
              >
                <ScanFace size={f.match ? 20 : 16} />
              </div>
              {f.match && (
                <motion.span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  Match ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: <Zap size={24} />,
    eyebrow: "FAISS VECTOR SEARCH",
    title: "Results in Under 3 Seconds",
    desc: "Approximate nearest-neighbor search over millions of face vectors. No loading bars, no wait times — just instant delivery.",
    stats: [
      { value: "2.3s", label: "avg response" },
      { value: "99.9%", label: "uptime" },
      { value: "<50ms", label: "API latency" },
    ],
    accent: "#2DD4BF",
    glow: "rgba(45,212,191,0.12)",
    visual: (
      <div className="relative w-full flex items-center justify-center" style={{ height: 160 }}>
        {[1, 2, 3].map(r => (
          <motion.div
            key={r}
            className="absolute rounded-full"
            style={{ width: 50 + r * 44, height: 50 + r * 44, border: "1px solid rgba(45,212,191,0.2)" }}
            animate={{ scale: [1, 1.9 + r * 0.2], opacity: [0.6, 0] }}
            transition={{ duration: 2, delay: r * 0.4, repeat: Infinity }}
          />
        ))}
        <motion.div
          className="relative z-10 text-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <div
            className="font-black text-7xl leading-none"
            style={{
              background: "linear-gradient(135deg, #2DD4BF, #5EEAD4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 24px rgba(45,212,191,0.5))",
            }}
          >
            2.3s
          </div>
          <div className="text-xs font-semibold mt-1" style={{ color: "rgba(45,212,191,0.7)" }}>average search time</div>
        </motion.div>
      </div>
    ),
  },
  {
    icon: <Lock size={24} />,
    eyebrow: "ZERO RETENTION · AES-256",
    title: "Privacy by Design",
    desc: "Your selfie is processed in-memory, never written to disk, and discarded the moment matching completes. No face data stored, ever.",
    stats: [
      { value: "0", label: "faces stored" },
      { value: "AES-256", label: "in-transit" },
      { value: "100%", label: "ephemeral" },
    ],
    accent: "#A855F7",
    glow: "rgba(168,85,247,0.12)",
    visual: (
      <div className="relative w-full flex items-center justify-center" style={{ height: 160 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map(r => (
            <motion.div
              key={r}
              className="absolute rounded-full"
              style={{ width: 56 + r * 46, height: 56 + r * 46, border: "1px solid rgba(168,85,247,0.18)" }}
              animate={{ scale: [1, 1.6 + r * 0.2], opacity: [0.4, 0] }}
              transition={{ duration: 2.5, delay: r * 0.6, repeat: Infinity }}
            />
          ))}
        </div>
        <motion.div
          className="relative z-10 flex flex-col items-center gap-3"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", border: "1.5px solid rgba(168,85,247,0.3)" }}
          >
            <Shield size={30} style={{ color: "#A855F7" }} />
          </div>
          <div className="flex gap-1.5">
            {["face", "data", "gone"].map((t, i) => (
              <motion.span
                key={t}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.2)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 3, delay: i * 1, repeat: Infinity }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    ),
  },
];

const SECONDARY = [
  { icon: <Users size={18} />,    title: "Group Photos",       desc: "Detects every face in crowd shots automatically.",    accent: "#FF2D78" },
  { icon: <QrCode size={18} />,   title: "QR Code Access",     desc: "Instant event entry via scannable QR — no typing.",   accent: "#2DD4BF" },
  { icon: <Download size={18} />, title: "Easy Downloads",     desc: "Download individually or grab a full ZIP album.",     accent: "#A855F7" },
  { icon: <Palette size={18} />,  title: "Custom Watermarks",  desc: "Brand every photo before guests download.",           accent: "#FF2D78" },
  { icon: <Globe size={18} />,    title: "Works Everywhere",   desc: "Browser-based — no app install, any device.",        accent: "#2DD4BF" },
];

export default function Features() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="features" className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(rgba(169,146,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: "#FF2D78" }} />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: "#2DD4BF" }} />

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span
            className="inline-block text-xs font-black uppercase tracking-[0.22em] mb-5 px-4 py-1.5 rounded-full"
            style={{ color: "#2DD4BF", background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)" }}
          >
            Built for Scale
          </span>
          <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight text-deep leading-[1.06]">
            Enterprise AI.{" "}
            <span style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7,#2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Consumer Simple.
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            PhotoFly runs the same face-recognition stack used in enterprise security — delivered through a link your guests open in 10 seconds.
          </p>
        </motion.div>

        {/* Primary 3-column showcase */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {PRIMARY.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-3xl overflow-hidden group"
              style={{
                background: "#FFFFFF",
                border: `1px solid ${f.accent}22`,
                boxShadow: `0 4px 32px ${f.glow}, 0 1px 0 rgba(255,255,255,0.8) inset`,
              }}
            >
              {/* Ambient glow top */}
              <div
                className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${f.glow} 0%, transparent 70%)` }}
              />

              {/* Eyebrow + icon */}
              <div className="relative px-7 pt-7 flex items-center justify-between">
                <span
                  className="text-[10px] font-black tracking-[0.18em] uppercase"
                  style={{ color: f.accent, opacity: 0.7 }}
                >
                  {f.eyebrow}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.accent}14`, color: f.accent, border: `1px solid ${f.accent}28` }}
                >
                  {f.icon}
                </div>
              </div>

              {/* Visual */}
              <div className="relative px-4 py-2">
                {f.visual}
              </div>

              {/* Content */}
              <div className="px-7 pb-7">
                <h3 className="font-black text-xl text-deep mb-2 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{f.desc}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {f.stats.map((s, j) => (
                    <div
                      key={j}
                      className="rounded-2xl px-2 py-2 text-center"
                      style={{ background: `${f.accent}08`, border: `1px solid ${f.accent}18` }}
                    >
                      <div className="font-black text-sm leading-none" style={{ color: f.accent }}>{s.value}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-medium leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary 5-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-12">
          {SECONDARY.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="rounded-2xl p-5 group cursor-default"
              style={{
                background: "#FFFFFF",
                border: `1px solid ${f.accent}18`,
                boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${f.accent}12`, border: `1px solid ${f.accent}24`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-sm mb-1.5 text-deep">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {[
            "FaceNet512 architecture",
            "FAISS vector indexing",
            "AES-256 encryption",
            "Zero data retention",
            "99.9% uptime SLA",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ["#FF2D78","#2DD4BF","#A855F7","#FF2D78","#2DD4BF"][i] }} />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
