"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Brain, Lock, Zap, Download, Tag, Video, QrCode, Palette, Users, Globe } from "lucide-react";

const features = [
  { icon: <Brain size={20} />,    title: "AI Face Recognition",  desc: "FaceNet-powered 128-dim embeddings. Works on group photos.", color: "#FF6B61" },
  { icon: <Zap size={20} />,      title: "Lightning Fast",        desc: "FAISS vector search — results in under 3 seconds.",          color: "#2DD4BF" },
  { icon: <Lock size={20} />,     title: "Privacy First",         desc: "Selfies never stored. Non-matching faces blurred.",           color: "#A992FF" },
  { icon: <Users size={20} />,    title: "Group Photo Support",   desc: "Detects all faces in group shots automatically.",             color: "#FF6B61" },
  { icon: <Download size={20} />, title: "Easy Downloads",        desc: "Download individual photos or your full album as ZIP.",       color: "#2DD4BF" },
  { icon: <Tag size={20} />,      title: "AI Auto-Tagging",       desc: "Automatic tags: portrait, group, outdoor, and more.",         color: "#A992FF" },
  { icon: <Video size={20} />,    title: "Video Support",         desc: "Face detection works on event video recordings too.",         color: "#FF6B61" },
  { icon: <QrCode size={20} />,   title: "QR Code Access",        desc: "Photographers generate QR codes for instant access.",         color: "#2DD4BF" },
  { icon: <Palette size={20} />,  title: "Custom Watermarks",     desc: "Add branded watermarks to protect your work.",               color: "#A992FF" },
  { icon: <Globe size={20} />,    title: "Works Everywhere",      desc: "Fully browser-based. No app download needed.",               color: "#FF6B61" },
];

export default function Features() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="features" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)" }} />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(rgba(169,146,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "#FF6B61" }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "#2DD4BF" }}
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
              color: "#2DD4BF",
              background: "rgba(45,212,191,0.08)",
              border: "1px solid rgba(45,212,191,0.2)",
            }}
          >
            Everything You Need
          </span>
          <h2 className="font-black text-3xl sm:text-5xl lg:text-6xl mt-4 mb-6 tracking-tight text-deep">
            Packed with{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B61, #A992FF, #2DD4BF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Features
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Built for photographers and guests alike. Professional tools, consumer simplicity.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl p-5 group cursor-default shine-card feature-card feature-card-${
                f.color === "#FF6B61" ? "coral" : f.color === "#2DD4BF" ? "teal" : "lav"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                }}
              >
                <span style={{ color: f.color }}>{f.icon}</span>
              </div>
              <h3 className="font-semibold text-sm mb-2 text-deep">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Feature showcase cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Group detection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="rounded-3xl overflow-hidden group kinetic-card shine-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(255,107,97,0.15)",
              boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
            }}
          >
            <div className="relative h-56 overflow-hidden">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEibHgaGGhKtdEMX5AS0ic_RuMUKzJykpw-9iiczWMfNq8_Zc2Mzh5yfRzmuLyJkIjmogpnydtBiN1yeeaaRilgGApvL3xYjhrtZrAgLcDNafjfENz9knL44mCa_gwGEq58oX-bN6A4_u1dLhTttBrGucpqyfOyRff4xTSgdyJ3Yx84IIzWFSCuym0AKjw/s1600/Gemini_Generated_Image_cqlig4cqlig4cqli.png"
                alt="Group Photo Detection"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ filter: "brightness(0.7) saturate(0.8)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }}
              />
              {/* Face detection boxes */}
              {[
                { x: "20%", y: "30%", match: true },
                { x: "45%", y: "22%", match: false },
                { x: "68%", y: "32%", match: false },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="absolute w-11 h-11 rounded-xl"
                  style={{
                    left: f.x, top: f.y,
                    transform: "translate(-50%,-50%)",
                    border: f.match
                      ? "2px solid #FF6B61"
                      : "2px solid rgba(15,23,42,0.2)",
                    boxShadow: f.match ? "0 0 20px rgba(255,107,97,0.5)" : "none",
                  }}
                >
                  {f.match && (
                    <div
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF6B61, #A992FF)" }}
                    >
                      ✓
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users size={17} style={{ color: "#FF6B61" }} />
                <span className="font-bold text-deep">Group Photo Detection</span>
              </div>
              <p className="text-slate-600 text-sm">
                Detects every face in group shots. Find yourself even when surrounded by hundreds of people.
              </p>
            </div>
          </motion.div>

          {/* Speed showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="rounded-3xl overflow-hidden group kinetic-card shine-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(45,212,191,0.2)",
              boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="relative h-56 flex items-center justify-center overflow-hidden"
              style={{ background: "radial-gradient(circle, rgba(45,212,191,0.10) 0%, transparent 70%)" }}
            >
              {[1, 2, 3].map(r => (
                <motion.div
                  key={r}
                  className="absolute rounded-full"
                  style={{
                    width: 60 + r * 40,
                    height: 60 + r * 40,
                    border: "1px solid rgba(45,212,191,0.2)",
                  }}
                  animate={{ scale: [1, 1.8 + r * 0.2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, delay: r * 0.4, repeat: Infinity }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center relative z-10"
              >
                <div
                  className="font-black text-7xl stat-number"
                  style={{
                    background: "linear-gradient(135deg, #2DD4BF, #5EEAD4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 20px rgba(45,212,191,0.5))",
                  }}
                >
                  2.3s
                </div>
                <p className="text-slate-500 text-sm mt-1">Average search time</p>
              </motion.div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={17} style={{ color: "#2DD4BF" }} />
                <span className="font-bold text-deep">Blazing Fast Search</span>
              </div>
              <p className="text-slate-600 text-sm">
                FAISS vector indexing searches 10,000+ photos in milliseconds. No waiting, no loading screens.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
