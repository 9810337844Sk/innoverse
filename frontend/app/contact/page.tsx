"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Mail, Phone, MapPin, MessageCircle, Clock,
  Send, CheckCircle, Sparkles, ArrowRight, User,
  Tag, FileText,
} from "lucide-react";
import { useState } from "react";
import Footer from "@/components/landing/Footer";

const WHATSAPP_NUM = "9800000000";

const contactMethods = [
  {
    icon: <Mail size={22} />,
    title: "Email Us",
    value: "hello@photofly.com.np",
    sub: "We reply within 24 hours",
    href: "mailto:hello@photofly.com.np",
    accent: "#FF2D78",
    bg: "rgba(255,45,120,0.06)",
    border: "rgba(255,45,120,0.15)",
  },
  {
    icon: <MessageCircle size={22} />,
    title: "WhatsApp",
    value: `+977 ${WHATSAPP_NUM}`,
    sub: "Typically responds in 30 min",
    href: `https://wa.me/${WHATSAPP_NUM}`,
    accent: "#25D366",
    bg: "rgba(37,211,102,0.06)",
    border: "rgba(37,211,102,0.2)",
  },
  {
    icon: <Phone size={22} />,
    title: "Call Us",
    value: `+977 ${WHATSAPP_NUM}`,
    sub: "Mon – Sat, 9 AM – 6 PM",
    href: `tel:+977${WHATSAPP_NUM}`,
    accent: "#A855F7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
  },
  {
    icon: <MapPin size={22} />,
    title: "Visit Us",
    value: "Thamel, Kathmandu",
    sub: "Nepal, 44600",
    href: "https://maps.google.com/?q=Thamel,Kathmandu",
    accent: "#0D9488",
    bg: "rgba(13,148,136,0.06)",
    border: "rgba(13,148,136,0.15)",
  },
];

const faqs = [
  {
    q: "How long does it take to activate my plan?",
    a: "After payment confirmation, your plan is activated within 24 hours. For WhatsApp orders, it's usually instant.",
  },
  {
    q: "Do you support events outside Kathmandu?",
    a: "Yes! PhotoFly works for any event anywhere. Photographers upload photos remotely and guests access them via a link or QR code.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept eSewa and WhatsApp-based payments. More payment options are coming soon.",
  },
  {
    q: "Can I get a demo before purchasing?",
    a: "Absolutely. Message us on WhatsApp or email us and we'll set up a live demo for you.",
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

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const isValid = form.name.trim() && form.email.trim() && form.message.trim();

  return (
    <main className="min-h-screen" style={{ background: "#FAFBFC" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden aurora-bg">
        <div className="animated-grid absolute inset-0 pointer-events-none" />
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-[0.07] animate-blob blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 70%)" }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
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
              <Sparkles size={13} /> Get in Touch
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-black text-5xl sm:text-6xl lg:text-7xl text-deep tracking-tight mb-6"
          >
            We&apos;d love to{" "}
            <span className="gradient-text">hear from you</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-xl leading-relaxed"
          >
            Have a question, want a demo, or need help with your plan?
            Our team is here to help — reach out any way you prefer.
          </motion.p>
        </div>
      </section>

      {/* ── Contact Methods ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y" style={{ borderColor: "rgba(255,45,120,0.08)" }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((m, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <a
                href={m.href}
                target={m.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="block rounded-3xl p-6 kinetic-card transition-all"
                style={{ background: m.bg, border: `1px solid ${m.border}` }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${m.accent}18`, color: m.accent }}
                >
                  {m.icon}
                </div>
                <h3 className="font-bold text-deep mb-1">{m.title}</h3>
                <div className="font-semibold text-sm mb-1" style={{ color: m.accent }}>{m.value}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={11} /> {m.sub}
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Form + FAQ ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* Contact Form */}
          <FadeIn>
            <div>
              <h2 className="font-black text-3xl sm:text-4xl text-deep mb-2 tracking-tight">
                Send us a message
              </h2>
              <p className="text-slate-500 mb-8">Fill in the form and we&apos;ll get back to you within 24 hours.</p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl p-10 text-center"
                  style={{ background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.2)" }}
                >
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
                    <CheckCircle size={52} style={{ color: "#0D9488" }} className="mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-black text-2xl text-deep mb-2">Message Sent!</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Thanks for reaching out, <strong>{form.name}</strong>. We&apos;ll reply to{" "}
                    <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: "rgba(26,10,18,0.5)" }}>Name *</label>
                      <div className="relative flex items-stretch">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10"
                          style={{ color: "rgba(107,114,128,0.6)" }}>
                          <User size={16} />
                        </div>
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 w-px h-[22px] pointer-events-none z-10"
                          style={{ background: "rgba(255,45,120,0.18)" }} />
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          className="input-field pl-[3.25rem]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: "rgba(26,10,18,0.5)" }}>Email *</label>
                      <div className="relative flex items-stretch">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10"
                          style={{ color: "rgba(107,114,128,0.6)" }}>
                          <Mail size={16} />
                        </div>
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 w-px h-[22px] pointer-events-none z-10"
                          style={{ background: "rgba(255,45,120,0.18)" }} />
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          className="input-field pl-[3.25rem]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                      style={{ color: "rgba(26,10,18,0.5)" }}>Subject</label>
                    <div className="relative flex items-stretch">
                      <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10"
                        style={{ color: "rgba(107,114,128,0.6)" }}>
                        <Tag size={16} />
                      </div>
                      <div className="absolute left-12 top-1/2 -translate-y-1/2 w-px h-[22px] pointer-events-none z-10"
                        style={{ background: "rgba(255,45,120,0.18)" }} />
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="input-field pl-[3.25rem] appearance-none cursor-pointer"
                      >
                        <option value="">Select a topic…</option>
                        <option value="pricing">Pricing &amp; Plans</option>
                        <option value="demo">Request a Demo</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                      style={{ color: "rgba(26,10,18,0.5)" }}>Message *</label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-0 w-12 flex items-start justify-center pointer-events-none z-10 pt-0.5"
                        style={{ color: "rgba(107,114,128,0.6)" }}>
                        <FileText size={16} />
                      </div>
                      <div className="absolute left-12 top-0 bottom-0 w-px pointer-events-none z-10 my-3"
                        style={{ background: "rgba(255,45,120,0.18)" }} />
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help…"
                        required
                        rows={5}
                        className="input-field pl-[3.25rem] resize-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.97 } : {}}
                    disabled={!isValid || loading}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: isValid ? "linear-gradient(135deg, #FF2D78, #A855F7)" : "rgb(241,245,249)",
                      color: isValid ? "#fff" : "rgb(148,163,184)",
                      boxShadow: isValid ? "0 4px 24px rgba(255,45,120,0.25)" : "none",
                      cursor: isValid ? "pointer" : "not-allowed",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send Message <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-slate-400 text-center">
                    Or reach us instantly on{" "}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUM}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold"
                      style={{ color: "#25D366" }}
                    >
                      WhatsApp
                    </a>
                  </p>
                </form>
              )}
            </div>
          </FadeIn>

          {/* FAQ */}
          <FadeIn delay={0.15}>
            <div>
              <h2 className="font-black text-3xl sm:text-4xl text-deep mb-2 tracking-tight">
                Frequently asked
              </h2>
              <p className="text-slate-500 mb-8">Quick answers to common questions.</p>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{
                      border: openFaq === i ? "1px solid rgba(255,45,120,0.25)" : "1px solid rgba(255,45,120,0.1)",
                      background: openFaq === i ? "rgba(255,45,120,0.03)" : "#FFFFFF",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-deep text-sm pr-4">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{
                            background: openFaq === i ? "rgba(255,45,120,0.1)" : "rgba(255,45,120,0.06)",
                            color: "#FF2D78",
                          }}
                        >
                          +
                        </div>
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div
                className="mt-8 rounded-3xl p-6"
                style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
                  >
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-deep mb-1">Still have questions?</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Chat with us on WhatsApp for the fastest response.
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUM}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-sm font-bold text-white px-5 py-2.5 rounded-xl flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
                      >
                        <MessageCircle size={15} /> Chat on WhatsApp
                      </motion.button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Map / Location ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t" style={{ borderColor: "rgba(255,45,120,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div
              className="rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10"
              style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #FFFFFF 100%)", border: "1px solid rgba(255,45,120,0.12)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)", boxShadow: "0 8px 24px rgba(255,45,120,0.3)" }}
              >
                <MapPin size={28} className="text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-black text-2xl text-deep mb-1">Find us in Kathmandu</h3>
                <p className="text-slate-600">Thamel, Kathmandu, Nepal — Open Mon–Sat, 9 AM to 6 PM</p>
              </div>
              <a
                href="https://maps.google.com/?q=Thamel,Kathmandu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)", boxShadow: "0 4px 20px rgba(255,45,120,0.25)" }}
                >
                  Open in Maps <ArrowRight size={15} />
                </motion.button>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
