"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Images, Download, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type PhotoRow = {
  id: string; url: string; name: string | null;
  eventId: string; eventName: string;
  facesCount: number; indexed: boolean; createdAt: string;
};

export default function AdminPhotosPage() {
  const [photos, setPhotos]   = useState<PhotoRow[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PhotoRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/photos");
      const json = await res.json() as { photos: PhotoRow[] };
      setPhotos(json.photos ?? []);
    } catch { toast.error("Failed to load photos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = photos.filter(p =>
    (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    p.eventName.toLowerCase().includes(search.toLowerCase())
  );

  const totalIndexed = photos.filter(p => p.indexed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-deep tracking-tight">Photos</h1>
          <p className="text-slate-500 text-sm mt-1">
            {photos.length.toLocaleString()} total · {totalIndexed.toLocaleString()} indexed
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-deep transition-colors"
          style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Photos",   value: photos.length,                                  color: "#FF2D78", bg: "rgba(255,45,120,0.06)" },
          { label: "Indexed",        value: totalIndexed,                                   color: "#10B981", bg: "rgba(16,185,129,0.06)" },
          { label: "Not Indexed",    value: photos.length - totalIndexed,                   color: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
          { label: "Unique Events",  value: new Set(photos.map(p => p.eventId)).size,       color: "#6366F1", bg: "rgba(99,102,241,0.06)" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ border: "1px solid rgba(239,68,68,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.bg }}>
              <Images size={16} style={{ color: c.color }} />
            </div>
            <div>
              <div className="text-xl font-black text-deep stat-number">{c.value.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input placeholder="Search by name or event…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white text-deep placeholder:text-slate-400 focus:outline-none"
          style={{ border: "1.5px solid rgba(239,68,68,0.15)" }}
          onFocus={e => (e.target.style.borderColor = "#EF4444")}
          onBlur={e => (e.target.style.borderColor = "rgba(239,68,68,0.15)")} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center"
          style={{ border: "1px solid rgba(239,68,68,0.08)" }}>
          <Images size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((photo, i) => (
            <motion.div key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              onClick={() => setPreview(photo)}>
              <Image src={photo.url} alt={photo.name ?? "photo"} fill unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-2"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }}>
                <div className="flex justify-end">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${photo.indexed ? "bg-green-500" : "bg-yellow-500"} text-white`}>
                    {photo.indexed ? "Indexed" : "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold truncate">{photo.eventName}</p>
                  <p className="text-white/60 text-[10px]">{photo.facesCount} face{photo.facesCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(12px)" }}
          onClick={() => setPreview(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
              <Image src={preview.url} alt={preview.name ?? "photo"} fill unoptimized className="object-contain" />
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <div>
                <p className="text-white font-semibold text-sm">{preview.name ?? "Untitled"}</p>
                <p className="text-white/50 text-xs mt-0.5">{preview.eventName} · {preview.facesCount} faces</p>
              </div>
              <div className="flex gap-2">
                <a href={preview.url} download target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#EF4444,#F97316)" }}>
                  <Download size={13} /> Download
                </a>
                <button onClick={() => setPreview(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
