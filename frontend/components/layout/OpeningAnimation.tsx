"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ScanFace } from "lucide-react";
import Image from "next/image";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: ((i / 12) * 100).toFixed(2),
  size: (i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2),
  delay: ((i * 0.45) % 3).toFixed(2),
  dur: (4 + (i % 4)).toFixed(1),
  opacity: (0.25 + (i % 4) * 0.08).toFixed(2),
  color: ["#FF6B9D", "#A855F7", "#14B8A6"][i % 3],
}));

export default function OpeningAnimation() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"logo" | "text" | "bar" | "exit">("logo");

  useEffect(() => {
    if (sessionStorage.getItem("intro-done")) {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => setPhase("text"), 450);
    const t2 = setTimeout(() => setPhase("bar"),  950);
    const t3 = setTimeout(() => setPhase("exit"), 1850);
    const t4 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("intro-done", "1");
    }, 2350);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D0618 0%, #1A0A12 50%, #0A1628 100%)" }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient blobs (CSS animation, no JS overhead) */}
          <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none animate-blob"
            style={{ background: "radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 65%)", top: "-15%", left: "-10%" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none animate-blob"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%)", bottom: "-10%", right: "-8%", animationDelay: "3s" }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "linear-gradient(rgba(255,45,120,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,120,0.06) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          {/* CSS-animated particles */}
          {PARTICLES.map(p => (
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

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-6">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative flex items-center justify-center"
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-6 rounded-full border border-pink-500/25"
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              {/* Logo image */}
              <div className="relative overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="PhotoFly"
                  width={220}
                  height={64}
                  className="h-16 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,45,120,0.35)]"
                  priority
                />
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)" }}
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* Tagline */}
            <AnimatePresence>
              {(phase === "text" || phase === "bar" || phase === "exit") && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-slate-400 text-sm font-medium tracking-widest uppercase"
                >
                  AI Photo Recognition
                </motion.p>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {(phase === "bar" || phase === "exit") && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-56 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7, #14B8A6)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                    />
                  </div>
                  <motion.div
                    className="flex items-center gap-2 text-slate-400 text-xs font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ScanFace size={13} className="text-pink-400" />
                    <span>Initializing AI engine…</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom tagline */}
          <AnimatePresence>
            {(phase === "bar" || phase === "exit") && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="absolute bottom-10 text-slate-500 text-xs tracking-wider"
              >
                Find every photo of you · Instantly
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
