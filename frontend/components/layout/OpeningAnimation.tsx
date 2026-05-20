"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ScanFace, Camera } from "lucide-react";

export default function OpeningAnimation() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"logo" | "text" | "bar" | "exit">("logo");

  useEffect(() => {
    // Skip if already seen in this session
    if (sessionStorage.getItem("intro-done")) {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("bar"),  1300);
    const t3 = setTimeout(() => setPhase("exit"), 2600);
    const t4 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("intro-done", "1");
    }, 3400);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D0618 0%, #1A0A12 50%, #0A1628 100%)" }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Ambient blobs ── */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 65%)",
              top: "-15%", left: "-10%",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%)",
              bottom: "-10%", right: "-8%",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 65%)",
              top: "40%", right: "15%",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          {/* ── Animated grid overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,45,120,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,120,0.06) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          {/* ── Floating particles ── */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${(i / 16) * 100}%`,
                bottom: -10,
                background: ["#FF6B9D", "#A855F7", "#14B8A6"][i % 3],
                opacity: 0.5,
              }}
              animate={{ y: [0, -700], opacity: [0.5, 0] }}
              transition={{
                duration: Math.random() * 4 + 4,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center gap-6">

            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{ boxShadow: ["0 0 0px rgba(255,45,120,0)", "0 0 60px rgba(255,45,120,0.6)", "0 0 20px rgba(255,45,120,0.3)"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-3 rounded-[28px] border border-pink-500/30"
                animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FF2D78 0%, #A855F7 50%, #0D9488 100%)" }}
              >
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                />
                <Camera size={40} className="text-white drop-shadow-lg" />
              </div>
            </motion.div>

            {/* Brand name */}
            <AnimatePresence>
              {(phase === "text" || phase === "bar" || phase === "exit") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <motion.h1
                    className="text-5xl font-black tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #FF2D78 0%, #FF6B9D 40%, #A855F7 70%, #14B8A6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      backgroundSize: "200% auto",
                    }}
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    PhotoFly
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-slate-400 text-sm font-medium mt-1 tracking-widest uppercase"
                  >
                    AI Photo Recognition
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {(phase === "bar" || phase === "exit") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* Progress bar */}
                  <div
                    className="w-56 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7, #14B8A6)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  </div>

                  {/* Scanning label */}
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

          {/* ── Bottom tagline ── */}
          <AnimatePresence>
            {(phase === "bar" || phase === "exit") && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
