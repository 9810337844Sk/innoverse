"use client";
import { Heart, Building2, Zap, Gift, Music, Briefcase, Camera, Users } from "lucide-react";

const EVENTS = [
  { Icon: Heart,     label: "Weddings",         color: "#FF2D78" },
  { Icon: Building2, label: "Conferences",       color: "#A855F7" },
  { Icon: Zap,       label: "Sports Events",     color: "#F59E0B" },
  { Icon: Gift,      label: "Birthday Parties",  color: "#2DD4BF" },
  { Icon: Music,     label: "Music Festivals",   color: "#FF2D78" },
  { Icon: Briefcase, label: "Corporate Events",  color: "#A855F7" },
  { Icon: Camera,    label: "Photo Walks",       color: "#2DD4BF" },
  { Icon: Users,     label: "Family Reunions",   color: "#F59E0B" },
];

const ROW = [...EVENTS, ...EVENTS, ...EVENTS];

export default function EventsStrip() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0D0A18 0%, #110C1E 100%)" }}
    >
      {/* Top border glow */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,45,120,0.2) 30%, rgba(168,85,247,0.15) 60%, transparent 100%)" }} />

      <div className="relative py-5">
        {/* Left/right edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 pointer-events-none z-10"
          style={{ background: "linear-gradient(90deg, #0D0A18, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 pointer-events-none z-10"
          style={{ background: "linear-gradient(270deg, #0D0A18, transparent)" }}
        />

        {/* Marquee row */}
        <div className="flex animate-marquee-left will-change-transform">
          {ROW.map((event, i) => {
            const Icon = event.Icon;
            return (
              <div key={i} className="flex items-center gap-2.5 px-6 sm:px-9 flex-shrink-0">
                <Icon size={13} style={{ color: event.color, opacity: 0.85 }} />
                <span
                  className="text-xs sm:text-[13px] font-semibold whitespace-nowrap tracking-wide"
                  style={{ color: "#64748b" }}
                >
                  {event.label}
                </span>
                <span className="text-[#2d2540] text-sm font-bold">·</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom border glow */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.12) 30%, rgba(45,212,191,0.1) 60%, transparent 100%)" }} />
    </div>
  );
}
