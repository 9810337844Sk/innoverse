"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { QrCode, ScanFace, Images, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <QrCode size={26} />,
    step: "01",
    title: "Enter Event Code",
    desc: "Scan the QR code at the event or enter the unique code from your photographer.",
    detail: "Works with weddings, conferences, parties and sports",
    accent: "#FF6B61",
    accentBg: "rgba(255,107,97,0.12)",
    accentBorder: "rgba(255,107,97,0.25)",
  },
  {
    icon: <ScanFace size={26} />,
    step: "02",
    title: "Upload Your Selfie",
    desc: "Take a quick selfie or upload a photo. AI extracts your facial signature securely.",
    detail: "Your selfie is never stored — processed and discarded",
    accent: "#A992FF",
    accentBg: "rgba(169,146,255,0.12)",
    accentBorder: "rgba(169,146,255,0.25)",
  },
  {
    icon: <Images size={26} />,
    step: "03",
    title: "Get Your Photos",
    desc: "In seconds, see every photo of you — including group shots. Download instantly.",
    detail: "Download individually or grab the full album as ZIP",
    accent: "#2DD4BF",
    accentBg: "rgba(45,212,191,0.10)",
    accentBorder: "rgba(45,212,191,0.25)",
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 lg:py-32 px-4 sm:px-6 lg:px-8" ref={ref}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 45%, #FFF5F8 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(169,146,255,0.8) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em]"
            style={{
              color: "#A992FF",
              background: "rgba(169,146,255,0.08)",
              border: "1px solid rgba(169,146,255,0.25)",
            }}
          >
            Simple Process
          </span>
          <h2 className="mt-4 mb-6 font-black text-3xl sm:text-5xl lg:text-6xl text-deep tracking-tight">
            Three Steps to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B61, #A992FF, #2DD4BF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Photos
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
            No account needed. No scrolling. Just instant results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Connector line */}
          <div className="absolute top-24 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] hidden h-px lg:block">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-full origin-left"
              style={{ background: "linear-gradient(90deg, #FF6B61, #A992FF, #2DD4BF)" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              <div
                className={`shine-card overflow-hidden rounded-3xl step-card step-card-${i === 0 ? "coral" : i === 1 ? "lav" : "teal"}`}
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${step.accentBorder}`,
                  boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
                }}
              >
                {/* Simple header (no images) */}
                <div className="relative p-6 pb-0">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 15% 20%, ${step.accent}1f 0%, transparent 55%)`,
                    }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${step.accent}, ${step.accent}cc)` }}
                    >
                      {step.icon}
                    </div>
                    <div
                      className="select-none font-black text-5xl leading-none"
                      style={{ color: step.accent, opacity: 0.12 }}
                    >
                      {step.step}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-5">
                  <h3 className="mb-3 font-bold text-xl text-deep">{step.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
                    style={{
                      background: step.accentBg,
                      border: `1px solid ${step.accentBorder}`,
                      color: step.accent,
                    }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: step.accent }} />
                    {step.detail}
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {i < 2 && (
                <div
                  className="absolute -right-5 top-24 z-10 hidden h-10 w-10 items-center justify-center rounded-full lg:flex"
                  style={{
                    background: "rgba(169,146,255,0.1)",
                    border: "1px solid rgba(169,146,255,0.2)",
                  }}
                >
                  <ArrowRight size={15} style={{ color: "#A992FF" }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
