"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Images, Upload, Trash2, Search, Filter, X,
  CheckSquare, Square, ZoomIn, ChevronLeft, ChevronRight,
  CalendarDays, Tag, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";

type Event = { _id: string; name: string; date: string; code: string; photoCount: number };
type Photo = {
  _id: string; url: string; name?: string; thumbnailUrl?: string;
  facesCount: number; tags: string[]; indexed: boolean;
};

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  portrait: { bg: "rgba(255,45,120,0.08)",  color: "#FF2D78" },
  group:    { bg: "rgba(168,85,247,0.08)",  color: "#A855F7" },
  candid:   { bg: "rgba(13,148,136,0.08)",  color: "#0D9488" },
  outdoor:  { bg: "rgba(245,158,11,0.08)",  color: "#D97706" },
  indoor:   { bg: "rgba(59,130,246,0.08)",  color: "#3B82F6" },
};

function tagStyle(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? { bg: "rgba(100,116,139,0.08)", color: "#64748b" };
}

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
function Lightbox({
  photos, index, onClose, onPrev, onNext,
}: {
  photos: Photo[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const photo = photos[index];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 w-11 h-11 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={photo._id}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-4xl max-h-[80vh] w-full mx-16"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.name ?? "Photo"}
          width={900}
          height={600}
          className="rounded-2xl object-contain w-full max-h-[75vh]"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
        />
        {/* Meta */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex gap-2 flex-wrap">
            {photo.tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: tagStyle(t).bg, color: tagStyle(t).color }}>
                {t}
              </span>
            ))}
          </div>
          <span className="text-white/40 text-xs">{index + 1} / {photos.length}</span>
        </div>
      </motion.div>

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 w-11 h-11 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </motion.div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function PhotosPage() {
  const [events, setEvents]         = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [search, setSearch]         = useState("");
  const [tagFilter, setTagFilter]   = useState<string>("all");
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // Load events
  useEffect(() => {
    api.get("/events")
      .then(r => {
        const evs = (r as { data: { events: Event[] } }).data.events;
        setEvents(evs);
        if (evs.length > 0) setSelectedEvent(evs[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  // Load photos when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    setLoadingPhotos(true);
    setSelected(new Set());
    // Fetch photos for this event from Supabase via API
    fetch(`/api/photos/${selectedEvent._id}`)
      .then(r => r.json())
      .then((j: { photos: Photo[] }) => setPhotos(j.photos ?? []))
      .catch(() => setPhotos([]))
      .finally(() => setLoadingPhotos(false));
  }, [selectedEvent]);

  // Filtered photos
  const filtered = photos.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTag = tagFilter === "all" || p.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const allTags = Array.from(new Set(photos.flatMap(p => p.tags)));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p._id)));
  };

  const deleteSelected = async () => {
    if (!selectedEvent || selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} photo(s)?`)) return;
    setDeleting(true);
    try {
      for (const id of Array.from(selected)) {
        await fetch(`/api/photos/${selectedEvent._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", photoId: id }),
        });
      }
      setPhotos(prev => prev.filter(p => !selected.has(p._id)));
      setSelected(new Set());
      toast.success(`Deleted ${selected.size} photo(s)`);
    } catch {
      toast.error("Failed to delete some photos");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-2xl text-deep">Photos</h1>
          <p className="text-slate-500 text-sm mt-1">
            {selectedEvent
              ? `${photos.length} photos in "${selectedEvent.name}"`
              : "Select an event to view photos"}
          </p>
        </div>
        {selected.size > 0 && (
          <Button variant="danger" onClick={deleteSelected} loading={deleting}>
            <Trash2 size={14} /> Delete {selected.size} selected
          </Button>
        )}
      </div>

      {/* Event selector */}
      {loadingEvents ? (
        <div className="flex gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton h-10 w-36 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl p-12 text-center bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
            <CalendarDays size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No events yet</p>
          <p className="text-slate-400 text-sm">Create an event first, then upload photos to it.</p>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {events.map(ev => (
            <button
              key={ev._id}
              onClick={() => setSelectedEvent(ev)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all"
              style={selectedEvent?._id === ev._id
                ? { background: "linear-gradient(135deg,#FF2D78,#FF6B9D)", color: "#fff", boxShadow: "0 4px 16px rgba(255,45,120,0.25)" }
                : { background: "#fff", color: "#64748b", border: "1px solid rgba(255,45,120,0.12)" }}
            >
              <CalendarDays size={13} />
              {ev.name}
              <span className="text-xs opacity-70">({ev.photoCount})</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      {selectedEvent && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-2xl px-4 py-2.5 bg-white"
            style={{ border: "1px solid rgba(255,45,120,0.12)" }}>
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or tag…"
              className="bg-transparent flex-1 text-sm text-deep placeholder-slate-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-slate-400" />
              {["all", ...allTags].map(tag => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={tagFilter === tag
                    ? { background: tagStyle(tag).bg, color: tagStyle(tag).color, border: `1px solid ${tagStyle(tag).color}30` }
                    : { background: "#F8FAFC", color: "#64748b", border: "1px solid rgba(255,45,120,0.08)" }}
                >
                  {tag === "all" ? "All" : <><Tag size={10} /> {tag}</>}
                </button>
              ))}
            </div>
          )}

          {/* Select all */}
          {filtered.length > 0 && (
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors ml-auto"
            >
              {selected.size === filtered.length
                ? <CheckSquare size={14} style={{ color: "#FF2D78" }} />
                : <Square size={14} />}
              {selected.size === filtered.length ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>
      )}

      {/* Photo grid */}
      {selectedEvent && (
        loadingPhotos ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl p-16 text-center bg-white"
            style={{ border: "1px solid rgba(255,45,120,0.1)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
              <Images size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">
              {photos.length === 0 ? "No photos uploaded yet" : "No photos match your filter"}
            </p>
            <p className="text-slate-400 text-sm">
              {photos.length === 0
                ? "Go to the event detail page to upload photos."
                : "Try clearing your search or tag filter."}
            </p>
            {photos.length === 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <AlertCircle size={13} />
                Upload photos from the Events → View page
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((photo, i) => {
              const isSelected = selected.has(photo._id);
              return (
                <motion.div
                  key={photo._id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-100"
                  style={{
                    aspectRatio: "1",
                    border: isSelected
                      ? "2px solid #FF2D78"
                      : "2px solid transparent",
                    boxShadow: isSelected ? "0 0 0 3px rgba(255,45,120,0.15)" : "none",
                  }}
                  onClick={() => setLightboxIdx(i)}
                >
                  <Image
                    src={photo.thumbnailUrl ?? photo.url}
                    alt={photo.name ?? "Photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Select checkbox */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleSelect(photo._id); }}
                    className="absolute top-2 left-2 z-10 transition-opacity"
                    style={{ opacity: isSelected ? 1 : 0 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.opacity = "0"; }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: isSelected ? "#FF2D78" : "rgba(255,255,255,0.9)",
                        border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.8)",
                      }}>
                      {isSelected && <CheckSquare size={14} className="text-white" />}
                    </div>
                  </button>

                  {/* Tags */}
                  {photo.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                          style={{ background: "rgba(255,255,255,0.92)", color: tagStyle(t).color }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Indexed badge */}
                  {photo.indexed && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(13,148,136,0.9)" }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {/* Stats bar */}
      {selectedEvent && photos.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-slate-500 pt-2"
          style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}>
          <span className="flex items-center gap-1.5">
            <Images size={13} style={{ color: "#FF2D78" }} />
            {photos.length} total
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#0D9488" }} />
            {photos.filter(p => p.indexed).length} indexed
          </span>
          {selected.size > 0 && (
            <span className="flex items-center gap-1.5 ml-auto font-medium" style={{ color: "#FF2D78" }}>
              <CheckSquare size={13} /> {selected.size} selected
            </span>
          )}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={filtered}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))}
            onNext={() => setLightboxIdx(i => (i !== null && i < filtered.length - 1 ? i + 1 : i))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
