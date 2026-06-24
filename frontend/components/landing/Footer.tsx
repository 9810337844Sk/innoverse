"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Twitter, Instagram, Github, ArrowRight, ScanFace, Camera } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features" },
  { label: "Pricing",      href: "/#pricing" },
  { label: "API Docs",     href: "#" },
];

const PHOTOGRAPHER_LINKS = [
  { label: "Dashboard",     href: "/dashboard" },
  { label: "Upload Photos", href: "/dashboard/photos" },
  { label: "Analytics",     href: "/dashboard/analytics" },
  { label: "Pricing Plans", href: "/#pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us",         href: "/about" },
  { label: "Contact",          href: "/contact" },
  { label: "Privacy Policy",   href: "#" },
  { label: "Terms of Service", href: "#" },
];

const SOCIALS = [
  { Icon: Twitter,   label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Github,    label: "GitHub" },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-white border-t border-slate-200"
    >
      {/* ── CTA Section ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto relative"
        >
          {/* Headline */}
          <h2 className="font-black text-3xl sm:text-4xl lg:text-5xl mb-4 tracking-tight leading-tight text-deep">
            Your photos,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D78 0%, #A855F7 58%, #0D9488 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              found in seconds.
            </span>
          </h2>

          {/* Sub */}
          <p className="text-slate-600 text-base mb-8 leading-relaxed max-w-lg mx-auto">
            No account needed. No app to download.
            Enter your event code, take a selfie — done.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/find">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 text-white font-bold px-7 py-3.5 rounded-2xl text-sm"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #A855F7)",
                  boxShadow: "0 4px 16px rgba(255,45,120,0.3)",
                }}
              >
                <ScanFace size={17} />
                Find My Photos
                <ArrowRight size={14} />
              </motion.button>
            </Link>
            <Link href="/auth/register?role=photographer">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all bg-white border border-primary/20 hover:border-primary/40 text-deep"
              >
                <Camera size={17} />
                I&apos;m a Photographer
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Links grid ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand column */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.jpg"
                alt="PhotoFly"
                width={130}
                height={33}
                className="h-8 w-auto object-contain"
              />
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              AI-powered photo recognition for events. Find every photo of yourself — instantly.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-slate-100 hover:bg-primary/10 text-slate-500 hover:text-primary"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: "Product",            links: PRODUCT_LINKS },
            { title: "For Photographers",  links: PHOTOGRAPHER_LINKS },
            { title: "Company",            links: COMPANY_LINKS },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-900">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-600 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © 2026 PhotoFly. All rights reserved.
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            Made with{" "}
            <span style={{ color: "#FF2D78" }}>♥</span>
            {" "}in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
