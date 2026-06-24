"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, CalendarDays, Copy, QrCode, Trash2, Eye,
  Check, Download, Share2, Mail, MessageCircle,
  ExternalLink, Images, Search, X, Sparkles, Link2,
  RefreshCw, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

type StoredEvent = {
  _id: string; name: string; date: string; code: string;
  photoCount: number; searchCount: number; downloadCount: number; createdAt: string;
};

const APP_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
function eventUrl(code: string) { return `${APP_URL}/find?code=${code}`; }

const ACCENTS = [
  { color: "#FF2D78", bg: "rgba(255,45,120,0.07)", border: "rgba(255,45,120,0.15)", gradient: "linear-gradient(135deg,#FF2D78,#FF6B9D)" },
  { color: "#A855F7", bg: "rgba(168,85,247,0.07)", border: "rgba(168,85,247,0.15)", gradient: "linear-gradient(135deg,#A855F7,#C084FC)" },
  { color: "#0D9488", bg: "rgba(13,148,136,0.07)", border: "rgba(13,148,136,0.15)", gradient: "linear-gradient(135deg,#0D9488,#14B8A6)" },
  { color: "#F59E0B", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.15)", gradient: "linear-gradient(135deg,#F59E0B,#FCD34D)" },
  { color: "#3B82F6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.15)", gradient: "linear-gradient(135deg,#3B82F6,#60A5FA)" },
];
function accentFor(idx: number) { return ACCENTS[idx % ACCENTS.length]; }

/* ── Share / QR Modal ─────────────────────────────────────────────────────── */
function ShareModal({ event, onClose }: { event: StoredEvent; onClose: () => void }) {
  const [copied, setCopied] = useState<"url" | "code" | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const url = eventUrl(event.code);

  const copy = (text: string, type: "url" | "code") => {
    void navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(type === "code" ? "Code copied!" : "Link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${event.code}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded!");
  };

  const shareVia = (channel: "whatsapp" | "email" | "native") => {
    const text = `Find your photos from "${event.name}" — use event code ${event.code} at ${url}`;
    if (channel === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    else if (channel === "email") window.open(`mailto:?subject=Find your photos from ${event.name}&body=${encodeURIComponent(text)}`, "_blank");
    else if (channel === "native" && navigator.share) void navigator.share({ title: `Photos from ${event.name}`, text, url });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: "rgba(15,23,42,0.4)" }}
          onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden z-10 bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.15)", boxShadow: "0 24px 64px rgba(15,23,42,0.14)" }}
        >
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7, #0D9488)" }} />
          <div className="flex items-center justify-between px-6 pt-5 pb-4"
            style={{ borderBottom: "1px solid rgba(255,45,120,0.08)" }}>
            <div>
              <h2 className="font-bold text-xl text-deep">Share Event</h2>
              <p className="text-slate-400 text-sm mt-0.5 truncate max-w-[260px]">{event.name}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              style={{ border: "1px solid rgba(255,45,120,0.1)" }}>
              <X size={17} />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-400 mb-4 text-center">
                Guests scan this QR code to instantly find their photos
              </p>
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-2xl scale-110" style={{ background: "rgba(255,45,120,0.1)" }} />
                <div className="relative bg-white rounded-3xl p-5"
                  style={{ border: "1px solid rgba(255,45,120,0.15)", boxShadow: "0 8px 32px rgba(255,45,120,0.08)" }}>
                  <div ref={canvasRef} className="hidden">
                    <QRCodeCanvas value={url} size={300} level="H" includeMargin
                      imageSettings={{ src: "/logo.jpg", height: 40, width: 40, excavate: true }} />
                  </div>
                  <QRCodeSVG value={url} size={180} level="H" includeMargin={false}
                    fgColor="#1A0A12" bgColor="#ffffff"
                    imageSettings={{ src: "/logo.jpg", height: 28, width: 28, excavate: true }} />
                </div>
                <div className="mt-3 text-center">
                  <span className="font-mono font-black text-2xl tracking-[0.2em] gradient-text-static">{event.code}</span>
                  <p className="text-slate-400 text-xs mt-0.5">Event Code</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={downloadQR}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                style={{ border: "1px solid rgba(255,45,120,0.15)", background: "rgba(255,45,120,0.04)" }}>
                <Download size={14} /> Download QR Code
              </motion.button>
            </div>

            {/* Shareable URL */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Shareable Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 min-w-0"
                  style={{ background: "#F8FAFC", border: "1px solid rgba(255,45,120,0.1)" }}>
                  <Link2 size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 truncate font-mono">{url}</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => copy(url, "url")}
                  className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                  style={copied === "url"
                    ? { background: "#22c55e", color: "#fff" }
                    : { background: "rgba(168,85,247,0.08)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.2)" }}>
                  {copied === "url" ? <Check size={15} /> : <Copy size={15} />}
                </motion.button>
              </div>
              <a href={url} target="_blank" rel="noreferrer"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-primary hover:underline">
                <ExternalLink size={11} /> Open in new tab
              </a>
            </div>

            {/* Event Code */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Event Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-center rounded-2xl py-3"
                  style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.15)" }}>
                  <span className="font-mono font-black text-2xl tracking-[0.25em] text-primary">{event.code}</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => copy(event.code, "code")}
                  className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                  style={copied === "code"
                    ? { background: "#22c55e", color: "#fff" }
                    : { background: "rgba(255,45,120,0.08)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                  {copied === "code" ? <Check size={15} /> : <Copy size={15} />}
                </motion.button>
              </div>
            </div>

            {/* Share via */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Share via</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "WhatsApp", icon: <MessageCircle size={17} />, accent: "#25D366", bg: "rgba(37,211,102,0.07)", border: "rgba(37,211,102,0.2)", action: () => shareVia("whatsapp") },
                  { label: "Email",    icon: <Mail size={17} />,           accent: "#3b82f6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.2)", action: () => shareVia("email") },
                  { label: "Share",    icon: <Share2 size={17} />,         accent: "#FF2D78", bg: "rgba(255,45,120,0.07)", border: "rgba(255,45,120,0.2)", action: () => shareVia("native") },
                ].map(s => (
                  <motion.button key={s.label}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                    onClick={s.action}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl text-xs font-semibold transition-colors"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.accent }}>
                    {s.icon} {s.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function EventsPage() {
  const [events, setEvents]         = useState<StoredEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [shareEvent, setShareEvent] = useState<StoredEvent | null>(null);
  const [form, setForm]             = useState({ name: "", date: "" });
  const [creating, setCreating]     = useState(false);
  const [search, setSearch]         = useState("");
  const [createError, setCreateError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    fetch("/api/events?limit=100", { credentials: "same-origin" })
      .then(async res => {
        const json = await res.json() as { events?: StoredEvent[]; message?: string };
        if (!res.ok) throw new Error(json.message || "Failed to load events");
        setEvents(json.events ?? []);
      })
      .catch(err => {
        console.error("[fetchEvents]", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Auto-focus name field when modal opens
  useEffect(() => {
    if (createOpen) {
      setCreateError("");
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [createOpen]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setCreateError("Event name is required"); return; }
    if (!form.date)        { setCreateError("Event date is required");  return; }
    setCreateError("");
    setCreating(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), date: form.date }),
      });

      let json: { message?: string; _id?: string; triggerAdminRefresh?: boolean } = {};
      try { json = await res.json() as typeof json; } catch { /* not JSON */ }

      if (!res.ok) {
        const msg = json.message || `Server error (${res.status})`;
        if (res.status === 401) {
          setCreateError("Session expired — please log out and log in again.");
        } else if (res.status === 403) {
          setCreateError("Your account doesn't have permission to create events. Make sure you registered as a Photographer.");
        } else {
          setCreateError(msg);
        }
        return;
      }

      toast.success("Event created!");
      
      // Trigger admin events refresh
      if (json.triggerAdminRefresh) {
        localStorage.setItem('new-event-created', Date.now().toString());
      }
      
      setCreateOpen(false);
      setForm({ name: "", date: "" });
      fetchEvents();
    } catch {
      setCreateError("Network error — check your connection and try again.");
    } finally {
      setCreating(false);
    }
  };

  const deleteEvent = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its photos? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Event deleted");
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch { toast.error("Failed to delete event"); }
  };

  const filtered = events.filter(ev =>
    !search || ev.name.toLowerCase().includes(search.toLowerCase()) || ev.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-deep">Events</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {loading ? "Loading…" : `${events.length} event${events.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-white"
            style={{ border: "1px solid rgba(255,45,120,0.12)" }}>
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events…"
              className="bg-transparent text-sm text-deep placeholder-slate-400 outline-none w-36"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>
          <Button onClick={() => { setCreateOpen(true); setCreateError(""); }}>
            <Plus size={15} /> New Event
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-16 text-center bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 4px 24px rgba(255,45,120,0.05)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
            <CalendarDays size={28} className="text-slate-300" />
          </div>
          <h3 className="font-semibold text-lg text-deep mb-2">
            {search ? "No events match your search" : "No events yet"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {search ? "Try a different keyword or clear the search" : "Create your first event to start uploading and sharing photos"}
          </p>
          {!search && (
            <Button onClick={() => { setCreateOpen(true); setCreateError(""); }}>
              <Plus size={16} /> Create your first event
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ev, i) => {
            const accent = accentFor(i);
            return (
              <motion.div key={ev._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-3xl bg-white overflow-hidden"
                style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(255,45,120,0.12)" }}
              >
                <div className="h-1.5 w-full" style={{ background: accent.gradient }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                      <CalendarDays size={20} style={{ color: accent.color }} />
                    </div>
                    <div className="flex gap-1.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setShareEvent(ev)}
                        className="p-2 rounded-xl transition-colors"
                        style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}
                        title="QR Code & Share">
                        <QrCode size={14} style={{ color: "#A855F7" }} />
                      </motion.button>
                      <button
                        onClick={() => deleteEvent(ev._id, ev.name)}
                        className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete event">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-deep mb-0.5 truncate">{ev.name}</h3>
                  <p className="text-slate-400 text-xs mb-4">
                    {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 font-mono text-sm font-bold px-3 py-2 rounded-xl tracking-wider"
                      style={{ color: accent.color, background: accent.bg, border: `1px solid ${accent.border}` }}>
                      {ev.code}
                    </div>
                    <button
                      onClick={() => { void navigator.clipboard.writeText(ev.code); toast.success("Code copied!"); }}
                      className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary-pale transition-colors"
                      title="Copy code">
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
                    <span className="flex items-center gap-1.5">
                      <Images size={11} style={{ color: accent.color }} />
                      {ev.photoCount} photos
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Search size={11} style={{ color: "#A855F7" }} />
                      {ev.searchCount} searches
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={11} style={{ color: "#0D9488" }} />
                      {new Date(ev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/events/${ev._id}`} className="flex-1">
                      <Button variant="ghost" fullWidth size="sm"><Eye size={13} /> View</Button>
                    </Link>
                    <Button size="sm" onClick={() => setShareEvent(ev)} className="flex-shrink-0">
                      <Share2 size={13} /> Share
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Refresh button (visible when events exist) */}
      {!loading && events.length > 0 && (
        <div className="flex justify-center pt-2">
          <button onClick={fetchEvents}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-primary-pale">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(""); }} title="Create New Event">
        <form onSubmit={e => { void createEvent(e); }} className="space-y-4">
          <Input
            ref={nameRef}
            label="Event Name"
            placeholder="e.g. Priya & Rahul's Wedding"
            value={form.name}
            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setCreateError(""); }}
          />
          <Input
            label="Event Date"
            type="date"
            value={form.date}
            onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setCreateError(""); }}
          />

          {createError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm text-red-600"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{createError}</span>
            </motion.div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" fullWidth onClick={() => { setCreateOpen(false); setCreateError(""); }} type="button">
              Cancel
            </Button>
            <Button fullWidth type="submit" loading={creating} disabled={!form.name.trim() || !form.date}>
              {creating ? "Creating…" : "Create Event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share / QR Modal */}
      {shareEvent && <ShareModal event={shareEvent} onClose={() => setShareEvent(null)} />}
    </div>
  );
}
