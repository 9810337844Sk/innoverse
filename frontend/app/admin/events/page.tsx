"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, CalendarDays, Images,
  Download, Eye, EyeOff, Camera, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

type EventRow = {
  _id: string;
  name: string;
  date: string;
  code: string;
  isActive: boolean;
  photoCount: number;
  searchCount: number;
  downloadCount: number;
  createdAt: string;
  photographer: { id: string; name: string; email: string } | null;
};

export default function AdminEventsPage() {
  const [events, setEvents]   = useState<EventRow[]>([]);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { 
    load(); 
    
    // Auto-refresh every 3 seconds for instant updates
    const interval = setInterval(() => {
      load();
    }, 3000);
    
    // Listen for storage events (new event created)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-event-created') {
        console.log('New event detected - refreshing!');
        load();
        localStorage.removeItem('new-event-created');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check localStorage periodically
    const storageCheck = setInterval(() => {
      if (localStorage.getItem('new-event-created')) {
        console.log('New event created!');
        load();
        localStorage.removeItem('new-event-created');
      }
    }, 500);
    
    return () => {
      clearInterval(interval);
      clearInterval(storageCheck);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/events");
      const eventsData = (response.data as { events: EventRow[] }).events;
      setEvents(eventsData);
      
      if (eventsData.length === 0) {
        toast.error("No events found in Supabase.");
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (ev: EventRow) => {
    setActionId(ev._id);
    try {
      await api.patch(`/admin/events/${ev._id}`, { is_active: !ev.isActive });

      setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, isActive: !e.isActive } : e));
      toast.success(ev.isActive ? `"${ev.name}" deactivated` : `"${ev.name}" activated`);
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.code.toLowerCase().includes(search.toLowerCase()) ||
                        (e.photographer?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "active" ? e.isActive : !e.isActive);
    return matchSearch && matchFilter;
  });

  const totalPhotos    = events.reduce((s, e) => s + (e.photoCount    ?? 0), 0);
  const totalSearches  = events.reduce((s, e) => s + (e.searchCount   ?? 0), 0);
  const totalDownloads = events.reduce((s, e) => s + (e.downloadCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-deep tracking-tight">Events</h1>
          <p className="text-slate-500 text-sm mt-1">
            {events.length} total · {events.filter(e => e.isActive).length} active
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-deep transition-colors"
          style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Images size={16} />,   label: "Total Photos",    value: totalPhotos,    color: "#FF2D78", bg: "rgba(255,45,120,0.06)" },
          { icon: <Search size={16} />,   label: "Total Searches",  value: totalSearches,  color: "#6366F1", bg: "rgba(99,102,241,0.06)" },
          { icon: <Download size={16} />, label: "Total Downloads", value: totalDownloads, color: "#0D9488", bg: "rgba(13,148,136,0.06)" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 flex items-center gap-4"
            style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.bg, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div className="text-xl font-black text-deep stat-number">{c.value.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all"
              style={filter === f
                ? { background: "linear-gradient(135deg,#FF2D78,#FF6B9D)", color: "white", boxShadow: "0 2px 12px rgba(255,45,120,0.25)" }
                : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }
              }>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search events, codes, photographers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white text-deep placeholder:text-slate-400 focus:outline-none"
            style={{ border: "1.5px solid rgba(255,45,120,0.15)" }}
            onFocus={e => (e.target.style.borderColor = "#FF2D78")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,45,120,0.15)")}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,45,120,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,45,120,0.08)", background: "#FAFBFC" }}>
                {["Event", "Code", "Photographer", "Photos", "Searches", "Downloads", "Date", "Status", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,45,120,0.05)" }}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded-lg skeleton" style={{ width: j === 0 ? 120 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-slate-400 text-sm">
                    No events found
                  </td>
                </tr>
              ) : filtered.map((ev, i) => {
                const busy = actionId === ev._id;
                return (
                  <motion.tr key={ev._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,45,120,0.05)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFBFC")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Event name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: ev.isActive ? "rgba(255,45,120,0.08)" : "rgba(148,163,184,0.1)" }}>
                          <CalendarDays size={14} style={{ color: ev.isActive ? "#FF2D78" : "#94A3B8" }} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-deep truncate max-w-[160px]">{ev.name}</div>
                          <div className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1" }}>
                        {ev.code}
                      </span>
                    </td>

                    {/* Photographer */}
                    <td className="px-4 py-4">
                      {ev.photographer ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#FF2D78,#FF6B9D)" }}>
                            {ev.photographer.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-deep truncate max-w-[120px]">{ev.photographer.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-4 text-sm font-semibold text-deep stat-number">{(ev.photoCount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 stat-number">{(ev.searchCount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 stat-number">{(ev.downloadCount ?? 0).toLocaleString()}</td>

                    {/* Created */}
                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={ev.isActive
                          ? { color: "#10B981", background: "rgba(16,185,129,0.1)" }
                          : { color: "#94A3B8", background: "rgba(148,163,184,0.1)" }
                        }>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ev.isActive ? "#10B981" : "#94A3B8" }} />
                        {ev.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(ev)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={ev.isActive
                          ? { background: "rgba(148,163,184,0.1)", color: "#64748B", border: "1px solid rgba(148,163,184,0.2)" }
                          : { background: "rgba(16,185,129,0.08)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }
                        }
                      >
                        {busy
                          ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : ev.isActive ? <EyeOff size={11} /> : <Eye size={11} />
                        }
                        {ev.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 text-xs text-slate-400"
            style={{ borderTop: "1px solid rgba(255,45,120,0.06)" }}>
            Showing {filtered.length} of {events.length} events
          </div>
        )}
      </div>
    </div>
  );
}
