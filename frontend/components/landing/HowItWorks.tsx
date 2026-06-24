"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { QrCode, ScanFace, Images, ArrowRight, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <QrCode size={28} />,
    step: "01",
    title: "Enter Event Code",
    desc: "Scan the QR code at the event or type the unique 6-character code from your photographer.",
    detail: "Weddings · Conferences · Sports · Parties",
    time: "5 sec",
    accent: "#FF2D78",
    accentLight: "rgba(255,45,120,0.08)",
    accentBorder: "rgba(255,45,120,0.18)",
    accentGlow: "rgba(255,45,120,0.12)",
  },
  {
    icon: <ScanFace size={28} />,
    step: "02",
    title: "Upload Your Selfie",
    desc: "Snap a quick selfie or upload a photo. Our AI extracts your facial signature and discards the image immediately.",
    detail: "Never stored · Processed in-memory only",
    time: "10 sec",
    accent: "#A855F7",
    accentLight: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.18)",
    accentGlow: "rgba(168,85,247,0.12)",
  },
  {
    icon: <Images size={28} />,
    step: "03",
    title: "Get All Your Photos",
    desc: "See every photo you appear in — including group shots. Download individually or grab the full album as a ZIP.",
    detail: "Individual files · Full ZIP album · Instant",
    time: "<3 sec",
    accent: "#2DD4BF",
    accentLight: "rgba(45,212,191,0.08)",
    accentBorder: "rgba(45,212,191,0.18)",
    accentGlow: "rgba(45,212,191,0.12)",
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 lg:py-36 px-4 sm:px-6 lg:px-8" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #FFFFFF 100%)" }} />
      <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "radial-gradient(circle, rgba(169,146,255,0.8) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <span
            className="mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: "#A855F7", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            Simple Process
          </span>
          <h2 className="mt-0 mb-5 font-black text-4xl sm:text-5xl lg:text-6xl text-deep tracking-tight leading-[1.06]">
            From event to photos{" "}
            <span style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7,#2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              in 60 seconds.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 leading-relaxed">
            No account. No app download. No scrolling through hundreds of images.
          </p>

          {/* Time badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", color: "#0D9488" }}
          >
            <CheckCircle size={15} />
            Total time: under 60 seconds
          </motion.div>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Connector line (desktop) */}
          <div className="absolute top-[88px] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] hidden h-[1px] lg:block" style={{ zIndex: 0 }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.6, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full origin-left"
              style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7, #2DD4BF)" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              className="relative group"
              style={{ zIndex: 1 }}
            >
              <div
                className="overflow-hidden rounded-3xl h-full"
                style={{
                  background: "#FFFFFF",
                  border: `1.5px solid ${step.accentBorder}`,
                  boxShadow: `0 4px 28px ${step.accentGlow}, 0 1px 0 rgba(255,255,255,0.8) inset`,
                }}
              >
                {/* Top glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-24 pointer-events-none rounded-t-3xl"
                  style={{ background: `radial-gradient(ellipse at 40% 0%, ${step.accentGlow} 0%, transparent 70%)` }}
                />

                {/* Header area */}
                <div className="relative px-7 pt-7 pb-0">
                  <div className="flex items-start justify-between mb-5">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                      style={{ background: `linear-gradient(135deg, ${step.accent}, ${step.accent}cc)`, boxShadow: `0 6px 20px ${step.accentGlow}` }}
                    >
                      {step.icon}
                    </div>
                    {/* Step number */}
                    <div
                      className="font-black text-6xl leading-none select-none"
                      style={{ color: step.accent, opacity: 0.1 }}
                    >
                      {step.step}
                    </div>
                  </div>

                  {/* Time badge */}
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg mb-5"
                    style={{ background: `${step.accent}12`, color: step.accent, border: `1px solid ${step.accent}22` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.accent }} />
                    {step.time}
                  </div>
                </div>

                {/* Content */}
                <div className="px-7 pb-7">
                  <h3 className="font-black text-xl text-deep mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 mb-4">{step.desc}</p>
                  <div
                    className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                    style={{ background: step.accentLight, border: `1px solid ${step.accentBorder}`, color: step.accent }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: step.accent }} />
                    {step.detail}
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {i < 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.7 + i * 0.2, type: "spring" }}
                  className="absolute -right-5 top-[80px] z-20 hidden h-10 w-10 items-center justify-center rounded-full lg:flex"
                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(168,85,247,0.22)", boxShadow: "0 4px 16px rgba(168,85,247,0.12)" }}
                >
                  <ArrowRight size={14} style={{ color: "#A855F7" }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
