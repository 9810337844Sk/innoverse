"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Camera, ScanFace, CheckCircle } from "lucide-react";

/* ── Floating particles ─────────────────────────────────────────────────── */
const HERO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: ((i / 20) * 100 + (i % 3) * 2.5).toFixed(1),
  size: i % 3 === 0 ? 5 : i % 3 === 1 ? 3.5 : 2.5,
  delay: ((i * 0.48) % 10).toFixed(2),
  dur: (7 + (i % 8)).toFixed(1),
  opacity: (0.12 + (i % 5) * 0.07).toFixed(2),
  color: ["#FF6B61", "#A992FF", "#2DD4BF"][i % 3],
}));

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {HERO_PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle-dot"
          style={{
            left: `${p.x}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            "--p-opacity": p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

const RIVERSIDE_IMAGE = "https://t3.ftcdn.net/jpg/19/25/44/64/360_F_1925446413_4LzeQ3mPGDNV3BJSh13TVSQwQZLTUDIe.jpg";
const WHATSAPP_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-1fnygfTN2VR1NViEGoRUHG2JcgWSK3XL9eWK7P-5gv5dNGRIbhYWXFf7y5X2QmnYkzHEGLIoqfX61Sc87ticiv8_2FGPfkj77ZOpO2gPgRpCWPyATdMlzPRiPXgdk8AndQNXKm7Nu9Gl1-abbZodhKnEghUlMSqJDUjKwxTyBacyNl_CZtfRXPYSsgwi/s1600/WhatsApp%20Image%202026-05-20%20at%201.19.57%20PM.jpeg";

const COLLAGE = [
  { url: RIVERSIDE_IMAGE, w: 2, h: 2, match: true },
  { url: WHATSAPP_IMAGE, w: 1, h: 1, match: false },
  { url: "https://i.pinimg.com/originals/06/97/65/0697650a10f853205beeb731a7836d37.jpg", w: 1, h: 1, match: false },
  { url: "https://t3.ftcdn.net/jpg/19/25/44/64/360_F_1925446413_4LzeQ3mPGDNV3BJSh13TVSQwQZLTUDIe.jpg", w: 1, h: 2, match: true },
  { url: "https://t3.ftcdn.net/jpg/10/36/97/86/360_F_1036978629_GJQQnjzhhrRNe9Wi1dzVSTSZzP9Qqkzr.jpg", w: 2, h: 1, match: false },
  { url: RIVERSIDE_IMAGE, w: 1, h: 1, match: true },
  { url: WHATSAPP_IMAGE, w: 1, h: 1, match: false },
  { url: "https://i.pinimg.com/originals/06/97/65/0697650a10f853205beeb731a7836d37.jpg", w: 2, h: 1, match: false },
  { url: "https://t3.ftcdn.net/jpg/19/25/44/64/360_F_1925446413_4LzeQ3mPGDNV3BJSh13TVSQwQZLTUDIe.jpg", w: 1, h: 1, match: true },
];

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.07 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1      = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2      = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const matchedIdx = COLLAGE.map((c, i) => (c.match ? i : -1)).filter(i => i >= 0);
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveIdx(p => (p + 1) % matchedIdx.length), 1800);
    return () => clearInterval(t);
  }, [matchedIdx.length]);
  const currentHighlight = matchedIdx[activeIdx];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 aurora-bg" />
        <motion.div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.15] animate-aurora-drift"
          style={{ background: "radial-gradient(circle, #FF6B61 0%, transparent 65%)", y: y1 }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.12] animate-blob"
          style={{ background: "radial-gradient(circle, #A992FF 0%, transparent 65%)", animationDelay: "3s", y: y2 }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.10] animate-blob"
          style={{ background: "radial-gradient(circle, #2DD4BF 0%, transparent 65%)", animationDelay: "6s" }}
        />
        <div className="absolute inset-0 animated-grid opacity-70" />
        <Particles />
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
      >
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-20 items-center">

          {/* ── Left copy ── */}
          <div className="flex flex-col items-start text-left">

            {/* Badge with animated rotating border */}
            <motion.div custom={0} variants={fadeLeft} initial={false} animate="show" className="mb-5 sm:mb-7">
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* Spinning conic-gradient border ring */}
                <div style={{ position: "absolute", inset: "-1.5px", borderRadius: "9999px", overflow: "hidden", zIndex: 0 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      width: "200%", height: "200%",
                      top: "-50%", left: "-50%",
                      background: "conic-gradient(from 0deg, #FF2D78 0deg, transparent 60deg, #A855F7 120deg, transparent 180deg, #2DD4BF 240deg, transparent 300deg, #FF2D78 360deg)",
                    }}
                  />
                </div>
                <div
                  className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-deep shadow-sm"
                  style={{ background: "rgba(250,251,252,0.98)", zIndex: 1 }}
                >
                  <Sparkles size={12} className="text-secondary flex-shrink-0" />
                  <span>FaceNet AI · 90% accuracy</span>
                  <span
                    className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                    style={{ background: "#2DD4BF", boxShadow: "0 0 8px #2DD4BF" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1} variants={fadeLeft} initial={false} animate="show"
              className="font-black text-4xl sm:text-5xl lg:text-6xl xl:text-[88px] leading-[1.02] mb-5 sm:mb-6 tracking-tight"
            >
              <span className="block text-deep">Find Every Photo</span>
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, #FF2D78 0%, #A855F7 45%, #0D9488 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Of You. Instantly.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              custom={2} variants={fadeLeft} initial={false} animate="show"
              className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg"
            >
              Snap a selfie. Our AI finds every photo of you across the entire event — group shots, candids, everything — in under 3 seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3} variants={fadeLeft} initial={false} animate="show"
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-7 sm:mb-10 w-full sm:w-auto"
            >
              <Link href="/find" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base shadow-pink"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)" }}
                >
                  <ScanFace size={18} /> Find My Photos <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/auth/register?role=photographer" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base text-deep bg-white/90 border border-primary/15 shadow-card hover:border-primary/30 hover:bg-white transition-colors"
                >
                  <Camera size={18} className="text-primary" /> I&apos;m a Photographer
                </motion.button>
              </Link>
            </motion.div>

            {/* Inline stats strip */}
            <motion.div
              custom={4} variants={fadeLeft} initial={false} animate="show"
              className="pt-1"
            >
              <div className="w-10 h-px mb-4" style={{ background: "linear-gradient(90deg, #FF2D78, transparent)" }} />
              <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                {[
                  { value: "15+", label: "events" },
                  { value: "500+", label: "photos" },
                  { value: "4.9★", label: "rating" },
                  { value: "<3s", label: "results" },
                ].map((s, i) => (
                  <div key={i} className="flex items-baseline gap-1">
                    <span
                      className="font-black text-base sm:text-lg stat-number"
                      style={{
                        background: "linear-gradient(135deg, #FF2D78, #A855F7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {s.value}
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm ml-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mobile photo preview */}
            <motion.div
              custom={5} variants={fadeLeft} initial={false} animate="show"
              className="mt-7 grid grid-cols-2 gap-3 w-full lg:hidden"
            >
              {[RIVERSIDE_IMAGE, WHATSAPP_IMAGE].map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/10 shadow-card bg-white"
                >
                  <Image
                    src={url}
                    alt={`Event memory ${i + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 50vw, 0px"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right collage — hidden on mobile, shown lg+ ── */}
          <div className="relative hidden lg:block">
            {/* Ambient background glow */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl scale-110 opacity-25"
              style={{ background: "radial-gradient(circle, rgba(169,146,255,0.5) 0%, rgba(255,107,97,0.3) 50%, transparent 70%)" }}
            />

            {/* Outer collage frame — slow rotating glow ring */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: "-6px", borderRadius: "30px", overflow: "hidden", opacity: 0.22, zIndex: 0 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    width: "200%", height: "200%",
                    top: "-50%", left: "-50%",
                    background: "conic-gradient(from 0deg, #FF2D78 0deg, transparent 80deg, #A855F7 140deg, transparent 220deg, #2DD4BF 280deg, transparent 340deg, #FF2D78 360deg)",
                    filter: "blur(3px)",
                  }}
                />
              </div>

              <motion.div
                initial={false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid grid-cols-3 gap-3 p-1"
                style={{ gridTemplateRows: "repeat(3, 155px)", zIndex: 1 }}
              >
                {COLLAGE.map((photo, i) => {
                  const isHighlighted = i === currentHighlight;
                  return (
                    <div
                      key={i}
                      style={{
                        gridColumn: `span ${photo.w}`,
                        gridRow: `span ${photo.h}`,
                        position: "relative",
                        borderRadius: "16px",
                      }}
                    >
                      {/* Animated spinning border — only for matched cards */}
                      {photo.match && (
                        <div
                          style={{
                            position: "absolute",
                            inset: isHighlighted ? "-3px" : "-2px",
                            borderRadius: isHighlighted ? "19px" : "18px",
                            overflow: "hidden",
                            zIndex: 0,
                          }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: isHighlighted ? 2 : 9,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              position: "absolute",
                              width: "200%", height: "200%",
                              top: "-50%", left: "-50%",
                              background: isHighlighted
                                ? "conic-gradient(from 0deg, #FF2D78 0%, #FF9D4D 18%, #A855F7 38%, #2DD4BF 58%, #A992FF 78%, #FF2D78 100%)"
                                : "conic-gradient(from 0deg, rgba(169,146,255,0.65) 0%, rgba(255,45,120,0.35) 40%, rgba(45,212,191,0.55) 70%, rgba(169,146,255,0.65) 100%)",
                            }}
                          />
                        </div>
                      )}

                      {/* Card */}
                    <motion.div
                        custom={i}
                        variants={fadeRight}
                        initial={false}
                        animate="show"
                        whileHover={{ scale: 1.05, zIndex: 10 }}
                        className="relative rounded-2xl overflow-hidden group cursor-pointer kinetic-card"
                        style={{ height: "100%", position: "relative", zIndex: 1 }}
                      >
                        <Image
                          src={photo.url}
                          alt=""
                          fill
                          unoptimized={photo.url.includes("blogger.googleusercontent.com")}
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          style={{ filter: photo.match ? "none" : "brightness(0.45) saturate(0.6)" }}
                        />

                        {photo.match && (
                          <>
                            {/* Flash overlay on highlight */}
                            <motion.div
                              animate={isHighlighted ? { opacity: [0, 0.22, 0] } : { opacity: 0 }}
                              transition={{ duration: 1.2 }}
                              className="absolute inset-0"
                              style={{ background: "linear-gradient(135deg, rgba(255,107,97,0.5), rgba(169,146,255,0.4))" }}
                            />

                            {/* Pulsing glow ring on highlight */}
                            {isHighlighted && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl"
                                animate={{
                                  boxShadow: [
                                    "inset 0 0 0 2px rgba(255,45,120,0.6)",
                                    "inset 0 0 0 3px rgba(255,45,120,1), 0 0 28px rgba(255,45,120,0.5)",
                                    "inset 0 0 0 2px rgba(255,45,120,0.6)",
                                  ],
                                }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                              />
                            )}

                            {/* "You" badge */}
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: isHighlighted ? [1, 1.12, 1] : 1,
                                opacity: 1,
                              }}
                              transition={isHighlighted
                                ? { scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5 + i * 0.1, type: "spring" } }
                                : { delay: 0.5 + i * 0.1, type: "spring" }
                              }
                              className="absolute top-2 right-2 flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg"
                              style={{
                                background: isHighlighted
                                  ? "linear-gradient(135deg, #FF2D78, #A855F7)"
                                  : "linear-gradient(135deg, #FF6B61, #A992FF)",
                                boxShadow: isHighlighted ? "0 2px 12px rgba(255,45,120,0.5)" : undefined,
                              }}
                            >
                              <CheckCircle size={9} /> You
                            </motion.div>
                          </>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-deep text-xs font-semibold drop-shadow-sm">
                            {photo.match ? "Matched ✓" : "Event photo"}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}

                {/* Improved scan line — thicker, multicolor, glowing */}
                <motion.div
                  className="absolute left-0 right-0 pointer-events-none z-20"
                  style={{
                    height: "3px",
                    background: "linear-gradient(90deg, transparent 0%, #2DD4BF 12%, #A992FF 40%, #FF6B61 72%, #FF2D78 88%, transparent 100%)",
                    boxShadow: "0 0 10px rgba(45,212,191,0.9), 0 0 22px rgba(45,212,191,0.5), 0 0 40px rgba(169,146,255,0.3)",
                    filter: "blur(0.4px)",
                  }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Scan line soft trail */}
                <motion.div
                  className="absolute left-0 right-0 pointer-events-none z-[19]"
                  style={{
                    height: "24px",
                    background: "linear-gradient(180deg, transparent, rgba(45,212,191,0.06), transparent)",
                    filter: "blur(6px)",
                    marginTop: "-12px",
                  }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            {/* Floating card — scanning */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 rounded-2xl px-4 py-3 shadow-card z-20 bg-white/95 backdrop-blur-md"
              style={{ border: "1px solid rgba(45,212,191,0.2)", boxShadow: "0 8px 32px rgba(45,212,191,0.12)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}
                >
                  <ScanFace size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-deep">AI Scanning…</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">847 photos · &lt;3s</div>
                  <div className="mt-1.5 h-1 w-28 rounded-full overflow-hidden bg-slate-200">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #2DD4BF, #A992FF)" }}
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating card — matches */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -top-5 -right-5 rounded-2xl px-4 py-3 z-20 bg-white/95 backdrop-blur-md"
              style={{ border: "1px solid rgba(255,45,120,0.2)", boxShadow: "0 8px 32px rgba(255,45,120,0.12)" }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#FF2D78", boxShadow: "0 0 8px rgba(255,45,120,0.5)" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-xs font-bold text-deep">4 matches found</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sachin &amp; Alysa Carson&apos;s Wedding</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to top, #FAFBFC, rgba(255,255,255,0))" }}
      />
    </section>
  );
}
