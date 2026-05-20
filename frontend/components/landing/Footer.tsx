import Link from "next/link";
import { Twitter, Instagram, Github } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t"
      style={{
        borderTopColor: "rgba(255,45,120,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div
                className="rounded-xl overflow-hidden flex-shrink-0"
                style={{ boxShadow: "0 0 16px rgba(255,107,97,0.2)" }}
              >
                <Image src="/logo.jpg" alt="PhotoFly logo" width={140} height={36} className="h-9 w-auto object-contain" />
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              AI-powered photo recognition for events. Find your photos instantly.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { Icon: Twitter,   href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Github,    href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="footer-social-icon w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 transition-all duration-200 hover:text-primary"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: "Product",           links: [
              { label: "How it Works", href: "/#how-it-works" },
              { label: "Features",     href: "/#features" },
              { label: "Pricing",      href: "/#pricing" },
              { label: "API Docs",     href: "#" },
            ]},
            { title: "For Photographers", links: [
              { label: "Dashboard",    href: "/dashboard" },
              { label: "Upload Photos",href: "/dashboard/photos" },
              { label: "Analytics",    href: "/dashboard/analytics" },
              { label: "Pricing",      href: "/#pricing" },
            ]},
            { title: "Company",           links: [
              { label: "About",            href: "/about" },
              { label: "Contact",          href: "/contact" },
              { label: "Privacy Policy",   href: "#" },
              { label: "Terms of Service", href: "#" },
            ]},
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-4 text-slate-800 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <Link
                      href={l.href}
                      className="text-slate-600 hover:text-primary text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500"
          style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}
        >
          <p>© 2026 PhotoFly. All rights reserved.</p>
          <p>
            Built with{" "}
            <span style={{ color: "#FF6B61" }}>♥</span>
            {" "}for photographers and their clients
          </p>
        </div>
      </div>
    </footer>
  );
}
