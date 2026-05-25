"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Camera, Users, Zap, Shield, Heart, Award,
  MapPin, Mail, Phone, ArrowRight, Sparkles,
  Code2, Brain, Palette, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/landing/Footer";

const stats = [
  { value: "500+", label: "Photos Processed",      icon: "📸", accent: "#FF2D78" },
  { value: "10+",  label: "Events Created",         icon: "🎉", accent: "#A855F7" },
  { value: "90+",  label: "Events Covered",         icon: "😊", accent: "#0D9488" },
  { value: "90%",  label: "Recognition Accuracy",   icon: "🎯", accent: "#F59E0B" },
];

const teamMembers = [
  {
    name: "Sachin Kushwaha",
    role: "Backend Developer",
    bio: "Builds the server architecture, APIs, authentication flow, and backend services that keep PhotoFly fast, secure, and reliable.",
    avatar: "SK",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTcSAUoix_y-ScR6Q9BItjFsj9ZoqQrHNkYjuLKkOHR4KVRU890aTgo-2IYqDAbj7pJIiYwJZEu9h1Bu1n23fEp2WqVcoMKPJJOQH0UXmIAd3rjIHk2YirPgS850WEIE1Aq2D_Lt_fk3hYig1_8-w8Do73hqN3_UkjhtTMKWv_KA6qYDP8tm2NMsruwis/s1600/sachin.png",
    gradient: "linear-gradient(135deg, #FF2D78, #FF6B9D)",
    skills: ["Backend", "APIs", "Security"],
    location: "Kathmandu, Nepal",
    badge: "Backend",
    badgeColor: "#FF2D78",
    badgeBg: "rgba(255,45,120,0.1)",
  },
  {
    name: "Nirjal Thapa",
    role: "Frontend Developer",
    bio: "Creates the user-facing experience across landing pages, dashboard screens, event pages, and photo search flows.",
    avatar: "NT",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2dkLpGEtrB86ChM49UWA3Uojqgf6Id-YDi8C2tqSHFAx55TKPxL9BoreF7hOf1DttqvBGgWhjeEiPmSy9zeQ91igZVjyO5C6DaM3trizqw_EIG0COwr3HGcR29YWIUi1yE4TTjV01LdVwZE8WrJE6BFDvlMJn1e-NQuU8-7tb3UPKhTv2znSlgntje_SA/s1600/Gemini_Generated_Image_ogslfaogslfaogsl.png",
    gradient: "linear-gradient(135deg, #0D9488, #14B8A6)",
    skills: ["Frontend", "React", "Next.js"],
    location: "Nepal",
    badge: "Frontend",
    badgeColor: "#0D9488",
    badgeBg: "rgba(13,148,136,0.1)",
  },
  {
    name: "Anusha Ghimire",
    role: "UI/UX Designer",
    bio: "Shapes the visual language, page layouts, and interaction details so PhotoFly feels polished and easy to use.",
    avatar: "AG",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgcau_RcY2hJFe08mhaLqLp_91fCGUcl2IZ3l32vzZDkN7KVj3DWIucgR2-wRHF_VtyHemNXj8qAsxoTPOGCzHVIaQOakPK_CQu2FMXMVKCWBYK8iXMwcYx-TZmUFR8mBMTXwYnE2qDZYseCDtxmONS74fINXrMqcCiKk1JfYH8txUUZdRxokZUnIUJKXMH/s1600/Gemini_Generated_Image_3dbwg73dbwg73dbw.png",
    gradient: "linear-gradient(135deg, #2563EB, #06B6D4)",
    skills: ["UI/UX", "Figma", "Design"],
    location: "Nepal",
    badge: "Design",
    badgeColor: "#2563EB",
    badgeBg: "rgba(37,99,235,0.1)",
  },
  {
    name: "Aabaran Dhungana",
    role: "Database Designer",
    bio: "Designs the data model, database structure, and storage workflows behind users, events, photos, and uploads.",
    avatar: "AD",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9Ip38ZLZ8Zyum_tsmy1V816-YWpWyLWHGcLZGKMxmdcOtKz0w2wDSQmca7GPmMTUb4JbvQFHxvpdm61seQFZLAtwE8YT68STV0mR_xfT-cq53EVktFwiWMlmRAvMLc8Js51BSSTcQg3LB_3StYQrPcVPsYeRdjVuzpkriASDRNNFx2NRd72WaCzS8j1g1/s1600/Aabaran.jpeg",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    skills: ["Database", "Schema", "Supabase"],
    location: "Nepal",
    badge: "Database",
    badgeColor: "#F59E0B",
    badgeBg: "rgba(245,158,11,0.1)",
  },
  {
    name: "Abinash Giri",
    role: "AI Service Engine Developer",
    bio: "Develops the AI service engine and face matching logic that powers fast photo discovery for event guests.",
    avatar: "AG",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3KeC3y0DELeENYez_bM2-MaDpNWt1FU0zXULGaPsjh9uCrEF5jffvNV-GPuuEBOIM2Brn6bIRSN4gp1TL0a_GuuiCN-1H1SWpT-dd5T8lKbAA9QVQohSooVe94EzDKygPiE1wGGIsffEBim6EEpnOQ08Pqzn-n325EZoFeHwFqt52gxIl1T0AD9t0WBAn/s1600/Gemini_Generated_Image_374dut374dut374d.png",
    gradient: "linear-gradient(135deg, #A855F7, #7C3AED)",
    skills: ["AI Service", "Face Search", "Python"],
    location: "Nepal",
    badge: "AI Engine",
    badgeColor: "#A855F7",
    badgeBg: "rgba(168,85,247,0.1)",
  },
];

const values = [
  {
    icon: <Heart size={22} />,
    title: "Built with Love",
    desc: "Every feature is crafted with care for photographers and their clients.",
    accent: "#FF2D78",
    bg: "rgba(255,45,120,0.06)",
    border: "rgba(255,45,120,0.15)",
  },
  {
    icon: <Zap size={22} />,
    title: "Speed First",
    desc: "Find your photos in seconds, not hours. Time is precious at every event.",
    accent: "#A855F7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
  },
  {
    icon: <Shield size={22} />,
    title: "Privacy Matters",
    desc: "Your photos and biometric data are handled with the highest security standards.",
    accent: "#0D9488",
    bg: "rgba(13,148,136,0.06)",
    border: "rgba(13,148,136,0.15)",
  },
  {
    icon: <Users size={22} />,
    title: "Community Driven",
    desc: "We listen to photographers and guests to continuously improve our platform.",
    accent: "#FF6B61",
    bg: "rgba(255,107,97,0.06)",
    border: "rgba(255,107,97,0.15)",
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen" style={{ background: "#FAFBFC" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden aurora-bg">
        <div className="animated-grid absolute inset-0 pointer-events-none" />

        {/* Blobs */}
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-[0.07] animate-blob blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-[0.06] animate-blob blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 70%)", animationDelay: "3s" }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] mb-6 px-4 py-1.5 rounded-full"
              style={{
                color: "#FF2D78",
                background: "rgba(255,45,120,0.08)",
                border: "1px solid rgba(255,45,120,0.2)",
              }}
            >
              <Sparkles size={13} /> Our Story
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-black text-5xl sm:text-6xl lg:text-7xl text-deep tracking-tight mb-6"
          >
            We&apos;re making{" "}
            <span className="gradient-text">memories</span>
            <br />
            easy to find
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-xl leading-relaxed max-w-2xl mx-auto"
          >
            PhotoFly was born from a simple frustration — spending hours scrolling through
            thousands of event photos just to find yourself. We built the solution we wished existed.
          </motion.p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y" style={{ borderColor: "rgba(255,45,120,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: `0 16px 40px ${s.accent}22` }}
                  className="relative rounded-3xl p-6 text-center overflow-hidden bg-white"
                  style={{ border: `1px solid ${s.accent}22`, boxShadow: `0 4px 20px ${s.accent}0d` }}
                >
                  {/* Glow blob */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${s.accent}10 0%, transparent 65%)` }} />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

                  <div className="relative">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-black text-4xl sm:text-5xl mb-2 stat-number"
                      style={{
                        background: `linear-gradient(135deg, ${s.accent}, ${s.accent}99)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>
                      {s.value}
                    </div>
                    <div className="text-slate-500 text-sm font-semibold">{s.label}</div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full"
                style={{ color: "#A855F7", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                Our Mission
              </span>
              <h2 className="font-black text-4xl sm:text-5xl text-deep tracking-tight mb-6">
                Every person deserves to{" "}
                <span className="gradient-text-static">find their moment</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                At PhotoFly, we believe that every smile, every dance, every candid moment captured
                at an event should be effortlessly accessible to the person in it — not buried in
                a folder of 3,000 photos.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We&apos;re a Kathmandu-based startup combining cutting-edge AI face recognition with
                a beautifully simple experience for both photographers and their clients across Nepal.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={15} style={{ color: "#FF2D78" }} />
                  Kathmandu, Nepal
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Award size={15} style={{ color: "#A855F7" }} />
                  Founded 2026
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="relative">
              {/* Decorative card stack */}
              <div
                className="absolute -top-4 -right-4 w-full h-full rounded-3xl"
                style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}
              />
              <div
                className="relative rounded-3xl p-8 bg-white"
                style={{ border: "1px solid rgba(255,45,120,0.15)", boxShadow: "0 8px 40px rgba(255,45,120,0.1)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)", boxShadow: "0 8px 24px rgba(255,45,120,0.3)" }}
                >
                  <Camera size={26} className="text-white" />
                </div>
                <h3 className="font-black text-2xl text-deep mb-3">The Problem We Solved</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  After a wedding with 4,000 photos, guests spent days searching for their pictures.
                  Photographers spent hours manually tagging. We automated the entire process with AI.
                </p>
                <div className="space-y-3">
                  {[
                    "Upload photos once, guests find theirs instantly",
                    "AI processes thousands of faces in minutes",
                    "Share via QR code — no app download needed",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(255,45,120,0.1)" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF2D78" }} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full"
                style={{ color: "#0D9488", background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)" }}
              >
                Our Values
              </span>
              <h2 className="font-black text-4xl sm:text-5xl text-deep tracking-tight">
                What drives us every day
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="rounded-3xl p-6 h-full kinetic-card"
                  style={{ background: v.bg, border: `1px solid ${v.border}` }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${v.accent}18`, color: v.accent }}
                  >
                    {v.icon}
                  </div>
                  <h3 className="font-bold text-lg text-deep mb-2">{v.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.15), transparent)" }} />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 65%)" }} />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 65%)" }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Section header */}
          <FadeIn>
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-white"
                style={{
                  background: "linear-gradient(135deg, #1A0A12 0%, #FF2D78 55%, #A855F7 100%)",
                  boxShadow: "0 14px 38px rgba(255,45,120,0.28)",
                }}
              >
                <Sparkles size={15} /> Team Premium
              </motion.div>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-5 px-4 py-2 rounded-full"
                style={{ color: "#FF2D78", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}
              >
                <Users size={12} /> The Team
              </motion.span>
              <h2 className="font-black text-4xl sm:text-5xl text-deep tracking-tight mb-4">
                The people building{" "}
                <span className="gradient-text-static">PhotoFly</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                A small, passionate team from Nepal — obsessed with making photo discovery magical.
              </p>
            </div>
          </FadeIn>

          {/* Team grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {teamMembers.map((member, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative rounded-3xl bg-white overflow-hidden flex flex-col"
                  style={{
                    border: "1px solid rgba(255,45,120,0.1)",
                    boxShadow: "0 4px 24px rgba(255,45,120,0.06)",
                  }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                    style={{ boxShadow: `0 0 0 1px ${member.badgeColor}33, 0 20px 60px ${member.badgeColor}15` }} />

                  {/* Top gradient strip */}
                  <div className="h-1.5 w-full flex-shrink-0" style={{ background: member.gradient }} />

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Circular member photo */}
                    <div className="relative mx-auto -mt-1 mb-5 h-28 w-28 rounded-full p-1.5"
                      style={{ background: member.gradient, boxShadow: `0 14px 34px ${member.badgeColor}30` }}>
                      <div className="h-full w-full overflow-hidden rounded-full bg-white p-1">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={96}
                            height={96}
                            className="h-full w-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full text-white text-3xl font-black"
                            style={{ background: member.gradient }}>
                            {member.avatar}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-md"
                        style={{ color: member.badgeColor, background: "rgba(255,255,255,0.95)", boxShadow: "0 6px 16px rgba(15,23,42,0.08)" }}>
                        {member.badge}
                      </span>
                    </div>

                    {/* Name & role */}
                    <h3 className="font-black text-lg text-deep mb-0.5 leading-tight text-center">{member.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-center"
                      style={{ color: member.badgeColor }}>
                      {member.role}
                    </p>

                    {/* Bio */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{member.bio}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {member.skills.map((skill, j) => (
                        <span key={j} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                          style={{
                            background: `${member.badgeColor}0d`,
                            color: member.badgeColor,
                            border: `1px solid ${member.badgeColor}22`,
                          }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Location + social */}
                    <div className="flex items-center justify-between pt-4"
                      style={{ borderTop: "1px solid rgba(255,45,120,0.07)" }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin size={11} style={{ color: member.badgeColor }} />
                        {member.location}
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
                        style={{ color: member.badgeColor, background: member.badgeBg }}
                      >
                        Premium
                      </span>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {/* Bottom "join us" banner */}
          <FadeIn delay={0.4}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mt-12 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,45,120,0.05) 0%, rgba(168,85,247,0.05) 100%)",
                border: "1px solid rgba(255,45,120,0.12)",
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 80% 50%, rgba(168,85,247,0.06) 0%, transparent 60%)" }} />
              <div className="relative text-center sm:text-left">
                <h3 className="font-black text-xl text-deep mb-1">Want to join the team?</h3>
                <p className="text-slate-500 text-sm">We&apos;re always looking for passionate people who love building great products.</p>
              </div>
              <Link href="/contact" className="flex-shrink-0 relative">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(255,45,120,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7)", boxShadow: "0 4px 18px rgba(255,45,120,0.25)" }}
                >
                  Get in touch <ArrowRight size={15} />
                </motion.button>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div
              className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FF2D78 0%, #FF6B9D 50%, #A855F7 100%)",
                boxShadow: "0 24px 64px rgba(255,45,120,0.3)",
              }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                style={{ background: "white" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"
                style={{ background: "white" }} />

              <div className="relative">
                <h2 className="font-black text-4xl sm:text-5xl text-white mb-4 tracking-tight">
                  Ready to get started?
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  Join hundreds of photographers already using PhotoFly across Nepal.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-3.5 rounded-2xl font-bold text-primary bg-white flex items-center gap-2 justify-center"
                      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    >
                      Start Free <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                  <Link href="/contact">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-3.5 rounded-2xl font-bold text-white border-2 border-white/40 hover:border-white/70 transition-colors flex items-center gap-2 justify-center"
                    >
                      Contact Us
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
