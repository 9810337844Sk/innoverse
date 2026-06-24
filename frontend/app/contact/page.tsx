"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import Footer from "@/components/landing/Footer";

const WHATSAPP_NUM = "9779823415625";
const DISPLAY_PHONE = "+977-9823415625";

const contactMethods = [
  {
    icon: <Mail size={22} />,
    title: "Email Us",
    value: "groupinnoverse@gmail.com",
    sub: "We reply within 24 hours",
    href: "mailto:groupinnoverse@gmail.com",
    accent: "#FF2D78",
    bg: "rgba(255,45,120,0.06)",
    border: "rgba(255,45,120,0.15)",
  },
  {
    icon: <MessageCircle size={22} />,
    title: "WhatsApp",
    value: DISPLAY_PHONE,
    sub: "Typically responds in 30 min",
    href: `https://wa.me/${WHATSAPP_NUM}`,
    accent: "#25D366",
    bg: "rgba(37,211,102,0.06)",
    border: "rgba(37,211,102,0.2)",
  },
  {
    icon: <Phone size={22} />,
    title: "Call Us",
    value: DISPLAY_PHONE,
    sub: "Mon - Sat, 9 AM - 6 PM",
    href: `tel:+${WHATSAPP_NUM}`,
    accent: "#A855F7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.15)",
  },
  {
    icon: <MapPin size={22} />,
    title: "Visit Us",
    value: "Maitidevi, Kathmandu",
    sub: "Nepal, 44600",
    href: "https://maps.google.com/?q=Maitidevi,Kathmandu",
    accent: "#0D9488",
    bg: "rgba(13,148,136,0.06)",
    border: "rgba(13,148,136,0.15)",
  },
];

const faqs = [
  {
    q: "How long does it take to activate my plan?",
    a: "After payment confirmation, your plan is activated within 24 hours. For WhatsApp orders, it is usually instant.",
  },
  {
    q: "Do you support events outside Kathmandu?",
    a: "Yes. PhotoFly works for events anywhere. Photographers upload photos remotely and guests access them through a link or QR code.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept eSewa and WhatsApp-based payments. More payment options are coming soon.",
  },
  {
    q: "Can I get a demo before purchasing?",
    a: "Absolutely. Contact us on WhatsApp or email and we will arrange a live demo.",
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

const SUBJECTS = [
  "General Enquiry",
  "Pricing & Plans",
  "Technical Support",
  "Demo Request",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [form, setForm]         = useState({ name: "", email: "", subject: "General Enquiry", message: "" });
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSending(true);
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error || "Send failed");
      setSent(true);
      setForm({ name: "", email: "", subject: "General Enquiry", message: "" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "#FAFBFC" }}>
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden aurora-bg">
        <div className="animated-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] mb-6 px-4 py-1.5 rounded-full"
            style={{ color: "#FF2D78", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}
          >
            <Sparkles size={13} /> Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-black text-5xl sm:text-6xl lg:text-7xl text-deep tracking-tight mb-6"
          >
            We&apos;d love to <span className="gradient-text">hear from you</span>
          </motion.h1>
          <p className="text-slate-600 text-xl leading-relaxed">
            Have a question, want a demo, or need help with your plan? Reach us directly through any channel below.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y" style={{ borderColor: "rgba(255,45,120,0.08)" }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <FadeIn key={method.title} delay={index * 0.08}>
              <a
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="block rounded-3xl p-6 kinetic-card transition-all h-full"
                style={{ background: method.bg, border: `1px solid ${method.border}` }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${method.accent}18`, color: method.accent }}>
                  {method.icon}
                </div>
                <h3 className="font-bold text-deep mb-1">{method.title}</h3>
                <div className="font-semibold text-sm mb-1" style={{ color: method.accent }}>{method.value}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={11} /> {method.sub}
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Contact Form ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#FAFBFC" }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-4"
                style={{ color: "#FF2D78", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.18)" }}>
                <Send size={11} /> Send a Message
              </span>
              <h2 className="font-black text-3xl sm:text-4xl text-deep tracking-tight">Drop us a line</h2>
              <p className="text-slate-500 mt-2 text-sm">Fill out the form and we&apos;ll get back to you within 24 hours.</p>
            </div>

            <div className="rounded-3xl p-8 sm:p-10"
              style={{ background: "#fff", border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 4px 40px rgba(255,45,120,0.06)" }}>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}>✉️</div>
                  <h3 className="font-black text-2xl text-deep">Message sent!</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Thanks for reaching out. We&apos;ll reply to your email within 24 hours.</p>
                  <button onClick={() => setSent(false)}
                    className="mt-2 text-sm font-semibold px-5 py-2 rounded-xl"
                    style={{ color: "#FF2D78", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.15)" }}>
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Full Name *</label>
                      <input
                        type="text" required placeholder="Sachin Kushwaha"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "#F8FAFC", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(255,45,120,0.5)")}
                        onBlur={e  => (e.target.style.borderColor = "rgba(255,45,120,0.15)")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input
                        type="email" required placeholder="you@example.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "#F8FAFC", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(255,45,120,0.5)")}
                        onBlur={e  => (e.target.style.borderColor = "rgba(255,45,120,0.15)")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Subject</label>
                    <select
                      value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
                      style={{ background: "#F8FAFC", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(255,45,120,0.5)")}
                      onBlur={e  => (e.target.style.borderColor = "rgba(255,45,120,0.15)")}
                    >
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Message *</label>
                    <textarea
                      required rows={5} placeholder="Tell us about your event, the number of guests, any questions…"
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{ background: "#F8FAFC", border: "1.5px solid rgba(255,45,120,0.15)", color: "#1A0A12" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(255,45,120,0.5)")}
                      onBlur={e  => (e.target.style.borderColor = "rgba(255,45,120,0.15)")}
                    />
                  </div>

                  {formError && (
                    <p className="text-sm font-medium px-4 py-3 rounded-xl"
                      style={{ color: "#FF2D78", background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.15)" }}>
                      {formError}
                    </p>
                  )}

                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 6px 20px rgba(255,45,120,0.3)" }}>
                    {sending ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="font-black text-3xl sm:text-4xl text-deep mb-2 tracking-tight">Frequently asked</h2>
            <p className="text-slate-500 mb-8">Quick answers to common questions.</p>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={faq.q} className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    border: openFaq === index ? "1px solid rgba(255,45,120,0.25)" : "1px solid rgba(255,45,120,0.1)",
                    background: openFaq === index ? "rgba(255,45,120,0.03)" : "#FFFFFF",
                  }}>
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="font-semibold text-deep text-sm pr-4">{faq.q}</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold text-primary bg-primary-pale">
                      {openFaq === index ? "-" : "+"}
                    </span>
                  </button>
                  {openFaq === index && <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="mt-10 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5"
              style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)" }}>
              <MessageCircle size={24} style={{ color: "#25D366" }} />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-deep">Need a quick response?</h3>
                <p className="text-sm text-slate-600">Chat with us on WhatsApp for the fastest support.</p>
              </div>
              <a href={`https://wa.me/${WHATSAPP_NUM}`} target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold text-white px-5 py-2.5 rounded-xl flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t" style={{ borderColor: "rgba(255,45,120,0.08)" }}>
        <FadeIn>
          <div className="max-w-6xl mx-auto rounded-3xl flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10"
            style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #FFFFFF 100%)", border: "1px solid rgba(255,45,120,0.12)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)" }}>
              <MapPin size={28} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-black text-2xl text-deep mb-1">Visit us in Kathmandu</h3>
              <p className="text-slate-600">Maitidevi, Kathmandu, Nepal - Open Mon-Sat, 9 AM to 6 PM</p>
            </div>
            <a href="https://maps.google.com/?q=Maitidevi,Kathmandu" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #FF2D78, #FF6B9D)" }}>
              Open in Maps <ArrowRight size={15} />
            </a>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
