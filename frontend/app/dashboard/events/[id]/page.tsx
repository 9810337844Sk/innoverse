"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  Upload, Images, Trash2, Brain, CheckCircle,
  CloudUpload, X, ZoomIn, Download, Tag, Users,
  FolderOpen, Save, ChevronLeft, ExternalLink,
  RefreshCw, CalendarDays, Code2, Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PhotoGridSkeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { getPhotos, deletePhoto as deletePhotoFromDB, type StoredPhoto } from "@/lib/db";

type Photo = StoredPhoto;
type Event = {
  _id: string; name: string; code: string; date: string; photoCount: number;
  driveFolderUrl?: string; driveFolderId?: string;
  driveFolderName?: string; driveSyncedAt?: string;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent]           = useState<Event | null>(null);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [doneCount, setDoneCount]   = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [indexQueued, setIndexQueued]   = useState(0);
  const [indexTimer, setIndexTimer]     = useState(0);
  const [offlineIndexing, setOfflineIndexing] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState(0);
  const [offlineLabel, setOfflineLabel] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const [driveUrl, setDriveUrl]     = useState("");
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [lightbox, setLightbox]     = useState<Photo | null>(null);
  const [filter, setFilter]         = useState<"all"|"indexed"|"pending">("all");

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json() as Promise<Event>;
      })
      .then((loaded) => {
        setEvent(loaded);
        setDriveUrl(loaded.driveFolderUrl || "");
      })
      .catch(() => toast.error("Failed to load event"));
    getPhotos(id).then(setPhotos).finally(() => setLoading(false));
  }, [id]);

  // Cleanup intervals on unmount
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current)  clearInterval(pollRef.current);
  }, []);

  const safeFolderName = event?.name.replace(/[^a-zA-Z0-9 _-]/g,"").replace(/\s+/g,"_") ?? "";

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || !event) return;

    // Pre-filter: skip files > 10 MB client-side to avoid silent truncation
    const oversized = acceptedFiles.filter((f) => f.size > 10 * 1024 * 1024);
    const validFiles = acceptedFiles.filter((f) => f.size <= 10 * 1024 * 1024);
    if (oversized.length) {
      toast.error(`${oversized.length} file${oversized.length > 1 ? "s" : ""} skipped (>10 MB): ${oversized.map(f => f.name).join(", ")}`);
    }
    if (!validFiles.length) { setUploading(false); return; }

    setUploading(true); setProgress(0); setDoneCount(0); setTotalCount(validFiles.length);

    // Keep batches small (3 files) to stay well under Vercel's 4.5 MB body limit
    const BATCH = 3;
    const justUploaded: Photo[] = [];
    let totalFailed = 0;

    for (let i = 0; i < validFiles.length; i += BATCH) {
      const batch = validFiles.slice(i, i + BATCH);
      const form  = new FormData();
      form.append("eventId",   id);
      form.append("eventCode", event.code);
      form.append("eventName", event.name);
      batch.forEach((f) => form.append("photos", f));

      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });

        // 200 = all ok, 207 = partial success, anything else = full failure
        if (!res.ok && res.status !== 207) {
          const errJson = await res.json().catch(() => ({})) as { error?: string; message?: string };
          throw new Error(errJson.error || errJson.message || `Upload failed (${res.status})`);
        }

        const json = await res.json() as {
          photos: { _id: string; url: string; thumbnailUrl?: string; name: string; cloudinaryPublicId?: string }[];
          failed?: { name: string; error: string }[];
          count: number;
        };

        // Handle successfully uploaded files
        if (json.photos?.length) {
          const newPhotos: Photo[] = json.photos.map((p) => ({
            _id: p._id, url: p.url, thumbnailUrl: p.thumbnailUrl ?? p.url, name: p.name,
            cloudinaryPublicId: p.cloudinaryPublicId ?? "",
            facesCount: 0, tags: [], indexed: false, savedAt: new Date().toISOString(),
          }));
          justUploaded.push(...newPhotos);
          setPhotos((prev) => [...prev, ...newPhotos]);
        }

        // Warn about partial failures without aborting remaining batches
        if (json.failed?.length) {
          totalFailed += json.failed.length;
          json.failed.forEach((f) => toast.error(`âš ï¸ ${f.name}: ${f.error}`, { duration: 5000 }));
        }
      } catch (err) {
        const batchNum = Math.floor(i / BATCH) + 1;
        toast.error(`Batch ${batchNum} failed: ${err instanceof Error ? err.message : "Upload failed"}`);
      }

      const done = Math.min(i + BATCH, validFiles.length);
      setDoneCount(done); setProgress(Math.round((done / validFiles.length) * 100));
    }

    setUploading(false);
    if (justUploaded.length) {
      const failNote = totalFailed > 0 ? ` (${totalFailed} failed)` : "";
      toast.success(`âœ… ${justUploaded.length} photo${justUploaded.length > 1 ? "s" : ""} uploaded${failNote}!`);
    } else if (totalFailed > 0) {
      toast.error("All uploads failed. Check file types and try again.");
    }
  }, [event, id]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, accept: { "image/*": [] }, multiple: true,
  });

  const runOfflineIndex = async () => {
    const unindexed = photos.filter((p) => !p.indexed);
    if (!unindexed.length) { toast("All photos already have a browser index", { icon: "âœ…" }); return; }

    setOfflineIndexing(true);
    setOfflineProgress(0);
    setOfflineLabel("Preparing browser scanâ€¦");

    try {
      const { loadModels, computeAllDescriptors } = await import("@/lib/faceRecognition");
      await loadModels();

      const results = await computeAllDescriptors(unindexed, (done, total, label) => {
        setOfflineProgress(Math.round((done / total) * 100));
        setOfflineLabel(label);
      });

      setOfflineLabel("Saving to databaseâ€¦");
      const res = await fetch("/api/photos/client-index", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ eventId: id, photos: results }),
      });

      const json = await res.json() as { saved: number; failed: number; error?: string };
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired â€” please refresh the page and try again");
        throw new Error(json.error || "Failed to save indexing results");
      }
      if (json.saved === 0 && json.failed > 0) {
        throw new Error(`Database save failed for all ${json.failed} photos. Check your Supabase DB has the faces_client column (run the migration in Supabase SQL Editor).`);
      }

      const withFaces = results.filter((r) => r.descriptors.length > 0).length;
      const failNote  = json.failed > 0 ? ` (${json.failed} DB errors)` : "";
      toast.success(`âœ… Offline index done â€” ${withFaces} photo${withFaces === 1 ? "" : "s"} with faces, ${json.saved} saved${failNote}`);

      // Update local state so the stats bar shows the correct indexed count
      const processedSet = new Set(results.map(r => r.id));
      setPhotos(prev => prev.map(p => {
        if (!processedSet.has(p._id)) return p;
        const pr = results.find(r => r.id === p._id);
        return { ...p, indexed: true, facesCount: pr?.descriptors.length ?? p.facesCount };
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Offline indexing failed");
    } finally {
      setOfflineIndexing(false);
      setOfflineProgress(0);
      setOfflineLabel("");
    }
  };

  const deletePhoto = async (photoId: string) => {
    const updated = photos.filter(p => p._id !== photoId);
    setPhotos(updated);
    if (lightbox?._id === photoId) setLightbox(null);
    await deletePhotoFromDB(id, photoId);
    toast.success("Photo removed");
  };

  const downloadAll = () => {
    if (!photos.length) return;
    photos.forEach((p, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = p.url; a.download = p.name || `photo_${i + 1}.jpg`; a.click();
      }, i * 120);
    });
    toast.success(`Downloading ${photos.length} photosâ€¦`);
  };

  const syncDriveFolder = async () => {
    if (!event || !driveUrl.trim()) { toast.error("Paste a Google Drive folder URL first"); return; }
    setSyncingDrive(true);
    try {
      const res = await fetch("/api/drive/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          eventCode: event.code,
          eventName: event.name,
          folderUrl: driveUrl.trim(),
        }),
      });
      const json = await res.json() as {
        error?: string; folderId?: string; folderName?: string; total?: number;
        photos?: Photo[];
      };
      if (!res.ok) {
        if (json.error === "not_connected" || String(json.error).includes("drive_tokens"))
          throw new Error("Connect Google Drive first from /api/drive/auth, then scan again.");
        throw new Error(json.error || "Drive scan failed");
      }
      const drivePhotos: Photo[] = json.photos || [];
      const merged = new Map<string, Photo>();
      [...photos, ...drivePhotos].forEach((photo) => merged.set(photo._id, photo));
      const updatedPhotos = Array.from(merged.values());
      const updatedEvent: Event = {
        ...event, driveFolderUrl: driveUrl.trim(),
        driveFolderId: json.folderId || event.driveFolderId || "",
        driveFolderName: json.folderName || event.driveFolderName || "Google Drive Folder",
        driveSyncedAt: new Date().toISOString(), photoCount: updatedPhotos.length,
      };
      setPhotos(updatedPhotos);
      setEvent(updatedEvent);
      toast.success(`Drive imported: ${drivePhotos.length} photo${drivePhotos.length === 1 ? "" : "s"} saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Drive sync failed");
    } finally { setSyncingDrive(false); }
  };

  const filtered     = photos.filter((p) =>
    filter === "indexed" ? p.indexed : filter === "pending" ? !p.indexed : true
  );
  const indexedCount = photos.filter((p) => p.indexed).length;

  if (loading) return <div className="space-y-6"><PhotoGridSkeleton /></div>;

  return (
    <div className="space-y-6 max-w-6xl">

      {/* â”€â”€ Back + Header â”€â”€ */}
      <div>
        <Link href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary mb-4 transition-colors font-medium">
          <ChevronLeft size={15} /> All Events
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl text-deep">{event?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={13} />
                {event?.date ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
                style={{ color: "#A855F7", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                <Code2 size={11} /> {event?.code}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <FolderOpen size={12} />
                uploads/{safeFolderName}/
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <Button size="sm" onClick={open} disabled={uploading}>
              <CloudUpload size={14} /> Add Photos
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadAll} disabled={photos.length === 0}>
              <Download size={14} /> Download All
            </Button>
            <Button size="sm" variant="outline" onClick={runOfflineIndex}
              loading={offlineIndexing} disabled={photos.length === 0}>
              <Brain size={14} /> {offlineIndexing ? "Scanningâ€¦" : "Scan Faces"}
            </Button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Stats bar â”€â”€ */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Total",   value: photos.length,                accent: "#FF2D78", bg: "rgba(255,45,120,0.07)", border: "rgba(255,45,120,0.12)", icon: <Images size={14} /> },
            { label: "Indexed", value: indexedCount,                 accent: "#0D9488", bg: "rgba(13,148,136,0.07)", border: "rgba(13,148,136,0.12)", icon: <CheckCircle size={14} /> },
            { label: "Pending", value: photos.length - indexedCount, accent: "#F59E0B", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.12)", icon: <Brain size={14} /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3 bg-white"
              style={{ border: `1px solid ${s.border}`, boxShadow: `0 2px 12px ${s.bg}` }}>
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <div>
                <div className="font-bold text-lg sm:text-xl text-deep leading-none">{s.value}</div>
                <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ AI indexing countdown â”€â”€ */}
      <AnimatePresence>
        {indexTimer > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between px-5 py-3.5 rounded-2xl gap-3"
            style={{ background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.2)" }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Clock size={15} style={{ color: "#0D9488", flexShrink: 0 }} className="animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-teal-700 text-sm font-semibold">
                  Face scan in progress â€” {Math.floor(indexTimer / 60)}:{String(indexTimer % 60).padStart(2, "0")} remaining
                </p>
                <p className="text-teal-600 text-xs mt-0.5 opacity-75">
                  {indexQueued} photo{indexQueued === 1 ? "" : "s"} Ã— ~30s each Â· auto-refreshes every 30s
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-28">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(13,148,136,0.15)" }}>
                <motion.div className="h-full rounded-full bg-teal-500"
                  animate={{ width: `${100 - Math.round((indexTimer / (indexQueued * 30)) * 100)}%` }}
                  transition={{ duration: 1 }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Offline indexing progress â”€â”€ */}
      <AnimatePresence>
        {offlineIndexing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="px-5 py-4 rounded-2xl"
            style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                <Brain size={13} className="animate-pulse" /> Scanning Faces in Browser
              </span>
              <span className="text-xs font-bold text-violet-500">{offlineProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.12)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#8B5CF6,#6366F1)" }}
                animate={{ width: `${offlineProgress || 3}%` }}
                transition={{ duration: 0.3 }} />
            </div>
            <p className="text-violet-500 text-xs mt-2">{offlineLabel}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Google Drive section â”€â”€ */}
      <div className="rounded-3xl p-5 bg-white"
        style={{ border: "1px solid rgba(255,45,120,0.1)", boxShadow: "0 2px 16px rgba(255,45,120,0.05)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.12)" }}>
                <FolderOpen size={15} style={{ color: "#FF2D78" }} />
              </div>
              <h2 className="font-bold text-base text-deep">Google Drive Photo Source</h2>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Paste a Drive folder URL, scan it, and this event will use those photos for guest face search.
            </p>
            <Input
              label="Drive Folder URL"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button onClick={syncDriveFolder} loading={syncingDrive} disabled={!driveUrl.trim()}>
              <RefreshCw size={14} /> Set & Scan Drive
            </Button>
            <a href="/api/drive/auth" target="_blank" rel="noreferrer">
              <Button variant="ghost" type="button">
                <ExternalLink size={14} /> Connect Drive
              </Button>
            </a>
          </div>
        </div>

        {event?.driveFolderId && (
          <div className="mt-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-3"
            style={{ background: "rgba(255,45,120,0.03)", border: "1px solid rgba(255,45,120,0.08)" }}>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Folder</span>
              <span className="font-semibold text-sm text-deep">{event.driveFolderName || "Google Drive Folder"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Folder ID</span>
              <span className="font-mono text-xs text-slate-500">{event.driveFolderId}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Last Sync</span>
              <span className="text-sm text-slate-500">{event.driveSyncedAt ? new Date(event.driveSyncedAt).toLocaleString() : "Not synced yet"}</span>
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ Drop zone â”€â”€ */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer bg-white ${
          isDragActive ? "scale-[1.01]" : ""
        }`}
        style={{
          borderColor: isDragActive ? "#FF2D78" : "rgba(255,45,120,0.2)",
          background: isDragActive ? "rgba(255,45,120,0.04)" : "#FFFFFF",
          boxShadow: isDragActive ? "0 0 0 4px rgba(255,45,120,0.08)" : "none",
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.15)" }}>
              <CloudUpload size={26} style={{ color: "#FF2D78" }} className="animate-bounce" />
            </div>
            <p className="font-semibold text-base text-deep mb-1">
              Saving {doneCount} / {totalCount} photos...
            </p>
            <p className="text-slate-400 text-sm mb-5">{progress}% complete</p>
            <div className="max-w-sm mx-auto">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,45,120,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #FF2D78, #A855F7)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <motion.div
              animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: isDragActive ? "rgba(255,45,120,0.1)" : "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.15)" }}
            >
              <Upload size={26} style={{ color: isDragActive ? "#FF2D78" : "#94a3b8" }} />
            </motion.div>
            <p className="font-semibold text-base text-deep mb-1">
              {isDragActive ? "Drop photos here!" : "Drag & drop photos"}
            </p>
            <p className="text-slate-400 text-sm mb-5">
              JPG Â· PNG Â· WEBP Â· Bulk upload 1000+ images
            </p>
            <Button size="sm" onClick={() => open()}>
              <CloudUpload size={14} /> Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* â”€â”€ Filter tabs â”€â”€ */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2">
          {(["all", "indexed", "pending"] as const).map((f) => {
            const count = f === "all" ? photos.length : f === "indexed" ? indexedCount : photos.length - indexedCount;
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200"
                style={active
                  ? { background: "linear-gradient(135deg, #FF2D78, #A855F7)", color: "#fff", boxShadow: "0 4px 12px rgba(255,45,120,0.25)" }
                  : { background: "#fff", color: "#64748b", border: "1px solid rgba(255,45,120,0.12)" }}>
                {f} <span className="opacity-60 ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* â”€â”€ Photo grid â”€â”€ */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          <AnimatePresence>
            {filtered.map((photo, i) => (
              <motion.div key={photo._id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ delay: Math.min(i * 0.012, 0.25), duration: 0.18 }}
                className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden"
                style={{ background: "#F1F5F9" }}
              >
                <Image
                  src={photo.thumbnailUrl ?? photo.url} alt={photo.name || "Event photo"} fill unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Actions â€” always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100">
                  {/* On mobile: small persistent buttons at bottom */}
                  <div className="absolute bottom-1 left-1 right-1 flex gap-1 sm:hidden">
                    <button onClick={() => { setLightbox(photo); fetch("/api/photos/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({photoId:photo._id,eventId:id,action:"view",photoName:photo.name})}).catch(()=>{}); }}
                      className="flex-1 h-7 bg-white/90 rounded-lg flex items-center justify-center">
                      <ZoomIn size={12} style={{ color: "#1A0A12" }} />
                    </button>
                    <button onClick={() => deletePhoto(photo._id)}
                      className="flex-1 h-7 bg-red-500 rounded-lg flex items-center justify-center">
                      <Trash2 size={12} className="text-white" />
                    </button>
                  </div>
                  {/* Desktop hover buttons */}
                  <button onClick={() => { setLightbox(photo); fetch("/api/photos/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({photoId:photo._id,eventId:id,action:"view",photoName:photo.name})}).catch(()=>{}); }}
                    className="hidden sm:flex w-8 h-8 bg-white/90 rounded-xl items-center justify-center hover:bg-white transition-colors shadow-sm">
                    <ZoomIn size={14} style={{ color: "#1A0A12" }} />
                  </button>
                  <button onClick={() => deletePhoto(photo._id)}
                    className="hidden sm:flex w-8 h-8 bg-red-500 rounded-xl items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
                {/* Indexed badge */}
                {photo.indexed && (
                  <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: "#0D9488" }}>
                    <CheckCircle size={9} className="text-white" />
                  </div>
                )}
                {/* Face count */}
                {photo.facesCount > 0 && (
                  <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 flex items-center gap-0.5 text-[10px] bg-white/95 text-slate-700 px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg shadow-sm">
                    <Users size={9} /> {photo.facesCount}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl bg-white"
          style={{ border: "1px solid rgba(255,45,120,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
            <Images size={24} className="text-slate-300" />
          </div>
          <p className="font-medium text-slate-500">
            {filter !== "all" ? `No ${filter} photos` : "No photos yet â€” upload some above!"}
          </p>
        </div>
      )}

      {/* â”€â”€ Lightbox â”€â”€ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)" }}
            onClick={() => setLightbox(null)}>
            <button className="absolute top-5 right-5 w-10 h-10 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
              className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
                style={{ background: "#1e293b" }}>
                <Image src={lightbox.url} alt={lightbox.name} fill unoptimized className="object-contain" />
              </div>
              <div className="flex items-center justify-between mt-4 px-1 flex-wrap gap-3">
                <div className="flex items-center gap-3 text-sm text-white/60 flex-wrap">
                  <span className="font-mono text-xs truncate max-w-[200px]">{lightbox.name}</span>
                  {lightbox.indexed && (
                    <span className="flex items-center gap-1 text-teal-400">
                      <CheckCircle size={13} /> Indexed
                    </span>
                  )}
                  {lightbox.facesCount > 0 && (
                    <span className="flex items-center gap-1 text-white/60">
                      <Users size={13} /> {lightbox.facesCount} face{lightbox.facesCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {lightbox.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-primary">
                      <Tag size={13} /> {t}
                    </span>
                  ))}
                </div>
                <a href={lightbox.url} download={lightbox.name} target="_blank" rel="noreferrer"
                  onClick={() => fetch("/api/photos/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({photoId:lightbox._id,eventId:id,action:"download",photoName:lightbox.name})}).catch(()=>{})}>
                  <Button size="sm"><Download size={13} /> Download</Button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



