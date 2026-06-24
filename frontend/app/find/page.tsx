"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import toast from "react-hot-toast";
import {
  ScanFace, Upload, Camera, Search, Download,
  X, ChevronRight, Brain, CheckCircle, AlertCircle,
  Sparkles, Zap, Server, ArrowLeft, Cpu,
} from "lucide-react";
import Image from "next/image";
import { getEventByCode, getPhotos } from "@/lib/db";
import type { FaceMatch } from "@/lib/faceRecognition";

type Step = "code" | "selfie" | "results";

const STEP_META = [
  { key: "code",    label: "Event Code",  num: 1 },
  { key: "selfie",  label: "Your Selfie", num: 2 },
  { key: "results", label: "Your Photos", num: 3 },
] as const;

type SearchMode = "server" | "fast" | "client";

interface ServerMatch {
  _id?: string;
  id?: string;
  url: string;
  thumbnailUrl?: string;
  name?: string;
  facesCount?: number;
  similarity: number;
}

let aiHealthAvailable: boolean | null = null;

async function canUseServerAi(): Promise<boolean> {
  if (aiHealthAvailable !== null) return aiHealthAvailable;

  const aiBase = (process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000").replace(/\/+$/, "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);

  try {
    const res = await fetch(`${aiBase}/health`, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });
    aiHealthAvailable = res.ok;
  } catch {
    aiHealthAvailable = false;
  } finally {
    clearTimeout(timer);
  }

  return aiHealthAvailable;
}

export default function FindPage() {
  const [step, setStep]                   = useState<Step>("code");
  const [eventCode, setEventCode]         = useState("");
  const [eventName, setEventName]         = useState("");
  const [eventId, setEventId]             = useState("");
  const [selfieFile, setSelfieFile]       = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [useCamera, setUseCamera]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [progress, setProgress]           = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [searchMode, setSearchMode]       = useState<SearchMode | null>(null);
  const [results, setResults]             = useState<FaceMatch[]>([]);
  const [lightbox, setLightbox]           = useState<FaceMatch | null>(null);
  const [error, setError]                 = useState("");
  const webcamRef = useRef<Webcam>(null);

  // Read ?code= from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) setEventCode(code.trim().toUpperCase());
    }
  }, []);

  // Pre-warm face-api models in background once user validates event code
  const preloadModels = useCallback(() => {
    import("@/lib/faceRecognition").then(m => m.loadModels()).catch(() => {});
  }, []);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setUseCamera(false);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1,
  });

  const capturePhoto = () => {
    const src = webcamRef.current?.getScreenshot();
    if (!src) return;
    fetch(src).then(r => r.blob()).then(blob => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelfieFile(file);
      setSelfiePreview(src);
      setUseCamera(false);
    });
  };

  const handleCodeContinue = async () => {
    const normalizedCode = eventCode.trim().toUpperCase();
    if (!normalizedCode) { toast.error("Enter an event code"); return; }
    setLoading(true);
    try {
      const event = await getEventByCode(normalizedCode);
      if (!event) { toast.error("Event not found. Check the code and try again."); return; }
      const photos = await getPhotos(event._id);
      if (photos.length === 0) {
        toast.error("No photos yet — ask your photographer to upload and save photos.");
        return;
      }
      setEventName(event.name);
      setEventId(event._id);
      setStep("selfie");
      preloadModels(); // warm up client-side models in background
    } catch {
      toast.error("Could not connect. Try again.");
    } finally { setLoading(false); }
  };

  /* ── Server-side search via backend → Python AI service (Facenet512 + FAISS) ── */
  const runServerSearch = async (): Promise<{ matches: FaceMatch[]; reason?: string } | null> => {
    if (!selfieFile) return null;

    if (!(await canUseServerAi())) return null;

    const normalizedCode = eventCode.trim().toUpperCase();
    setProgressLabel("Sending to AI server…");
    setProgress(20);

    const form = new FormData();
    form.append("selfie",    selfieFile);
    form.append("eventCode", normalizedCode);

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 28_000);

    try {
      setProgressLabel("AI face matching (Facenet512)…");
      setProgress(55);

      const res = await fetch("/api/search/face", {
        method: "POST",
        body:   form,
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      const data = await res.json() as { matches?: ServerMatch[]; error?: string; message?: string };

      // 503 = AI service down → fall back to client-side
      if (res.status === 503 || data.error === "server_unavailable") return null;
      // Other non-ok responses (404 event not found, etc.) → also fall back
      if (!res.ok || data.error) return null;

      const matches: FaceMatch[] = (data.matches || []).map(m => ({
        _id:        m._id ?? m.id ?? "",
        url:        m.url,
        name:       m.name ?? m._id ?? "photo",
        similarity: m.similarity,
        distance:   parseFloat((1 - m.similarity).toFixed(3)),
        faceCount:  m.facesCount ?? 1,
      }));

      return {
        matches: matches.sort((a, b) => b.similarity - a.similarity),
        reason:  data.message, // e.g. "No indexed photos yet — ask photographer to index first"
      };

    } catch {
      clearTimeout(timer);
      return null; // timeout or network error → fallback
    }
  };

  /* ── Offline / client-side search ────────────────────────────────────────
   *
   * Priority:
   *  1. Fast vector search (pre-stored 128-dim descriptors, no image downloads)
   *  2. Slow image scan (face-api.js processes each photo thumbnail)
   */
  const runClientSearch = async (): Promise<FaceMatch[]> => {
    const { loadModels, fastSearchFromDescriptors, findMatchingPhotos } =
      await import("@/lib/faceRecognition");

    setLoadingModels(true);
    setProgressLabel("Loading AI models…");
    setProgress(5);
    await loadModels();
    setLoadingModels(false);

    // ── 1. Fast path: pre-stored 128-dim descriptors (instant, no image downloads) ──
    if (eventId) {
      try {
        setSearchMode("fast");
        setProgressLabel("Checking offline index…");
        setProgress(15);

        const dr = await fetch(`/api/photos/descriptors/${eventId}`);
        if (dr.ok) {
          const { photos: stored, count } = await dr.json() as {
            photos: import("@/lib/faceRecognition").StoredDescriptor[];
            count:  number;
          };
          if (count > 0) {
            setProgressLabel(`Vector-matching ${count} pre-indexed photos…`);
            setProgress(50);
            const matches = await fastSearchFromDescriptors(selfieFile!, stored);
            setProgress(100);
            return matches;
          }
        }
      } catch { /* fall through to image scan */ }
    }

    // ── 2. Slow path: download + process every photo thumbnail ──
    setSearchMode("client");
    const event = await getEventByCode(eventCode.trim().toUpperCase());
    if (!event) throw new Error("Event not found");
    const eventPhotos = await getPhotos(event._id);
    if (eventPhotos.length === 0) throw new Error("No photos found for this event.");

    setProgressLabel(`Scanning ${eventPhotos.length} photos…`);
    return findMatchingPhotos(selfieFile!, eventPhotos, 0.5,
      (done, total, label) => {
        setProgress(total > 0 ? Math.round((done / total) * 100) : 0);
        setProgressLabel(label);
      }
    );
  };

  const handleSearch = async () => {
    if (!selfieFile) { toast.error("Upload a selfie first"); return; }
    setError(""); setLoading(true); setProgress(0); setSearchMode(null);

    try {
      // 1 ─── Try server-side AI (Facenet512 + FAISS, ~1-3s)
      setSearchMode("server");
      const serverMatches = await runServerSearch();

      // Server found matches — done
      if (serverMatches !== null && serverMatches.matches.length > 0) {
        setProgress(100);
        setResults(serverMatches.matches);
        setStep("results");
        toast.success(`Found ${serverMatches.matches.length} photo${serverMatches.matches.length > 1 ? "s" : ""} of you!`);
        return;
      }

      // 2 ─── Fall back to client-side (fast vector search → full image scan)
      // Covers: AI service down, or photos indexed only via browser offline mode
      setSearchMode("client");
      setProgress(0);
      const clientMatches = await runClientSearch();
      setResults(clientMatches);
      setStep("results");
      if (clientMatches.length > 0) {
        toast.success(`Found ${clientMatches.length} photo${clientMatches.length > 1 ? "s" : ""} of you!`);
      } else {
        const reason = serverMatches?.reason ?? "No matches found. Try a clearer selfie.";
        toast(reason, { icon: "🔍", duration: 5000 });
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Face recognition failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingModels(false);
      setProgress(0);
      setProgressLabel("");
      setSearchMode(null);
    }
  };

  const downloadPhoto = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  };

  const downloadAllAsZip = async () => {
    const JSZip = (await import("jszip")).default;
    const zip   = new JSZip();
    const folder = zip.folder("my-photos");
    toast("Preparing ZIP…", { icon: "📦" });
    await Promise.all(results.map(async (photo, i) => {
      try {
        const res  = await fetch(photo.url);
        const blob = await res.blob();
        folder?.file(`photo_${i + 1}.${blob.type.split("/")[1] || "jpg"}`, blob);
      } catch { /* skip */ }
    }));
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "my-photos.zip";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("ZIP downloaded!");
  };

  const trackPhoto = (photo: FaceMatch, action: "view" | "download") => {
    if (!photo._id || !eventId) return;
    fetch("/api/photos/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo._id, eventId, action, photoName: photo.name }),
    }).catch(() => {});
  };

  const reset = () => {
    setStep("code"); setResults([]); setSelfiePreview(null);
    setSelfieFile(null); setError(""); setEventCode(""); setEventName("");
    setEventId(""); setSearchMode(null);
  };

  const stepIndex = STEP_META.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen relative overflow-hidden aurora-bg">
      <div className="animated-grid absolute inset-0 pointer-events-none opacity-50" />
      <div className="absolute top-20 right-16 w-80 h-80 rounded-full opacity-[0.07] animate-blob blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 70%)" }} />
      <div className="absolute bottom-20 left-16 w-72 h-72 rounded-full opacity-[0.06] animate-blob blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#FF2D78 0%,transparent 70%)", animationDelay: "4s" }} />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-3"
            style={{ color: "#FF2D78", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}>
            <Sparkles size={12} /> AI Face Recognition
          </span>
          <h1 className="font-black text-3xl sm:text-4xl text-deep tracking-tight">Find Your Photos</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Upload a selfie and instantly find every photo of you using AI
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEP_META.map((s, i) => {
            const done   = stepIndex > i;
            const active = stepIndex === i;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={active ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                    style={active
                      ? { background: "linear-gradient(135deg,#FF2D78,#A855F7)", color: "white", boxShadow: "0 0 16px rgba(255,45,120,0.4)" }
                      : done
                      ? { background: "rgba(255,45,120,0.12)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.3)" }
                      : { background: "rgba(255,45,120,0.05)", color: "#CBD5E1", border: "1px solid rgba(255,45,120,0.1)" }
                    }>
                    {done ? <CheckCircle size={14} /> : s.num}
                  </motion.div>
                  <span className={`text-sm font-medium hidden sm:block transition-colors ${active ? "text-deep" : done ? "text-slate-500" : "text-slate-300"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-8 sm:w-12 h-px mx-2 sm:mx-3 flex-shrink-0"
                    style={{ background: done ? "rgba(255,45,120,0.3)" : "rgba(255,45,120,0.1)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Event Code ── */}
            {step === "code" && (
              <motion.div key="code"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8"
                style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 8px 40px rgba(255,45,120,0.08)" }}>

                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 8px 24px rgba(255,45,120,0.3)" }}>
                    <Search size={24} className="text-white" />
                  </div>
                  <h2 className="font-black text-2xl text-deep tracking-tight mb-1">Enter Event Code</h2>
                  <p className="text-slate-500 text-sm">Get the code from your photographer</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Event Code</label>
                    <input
                      value={eventCode}
                      onChange={e => setEventCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleCodeContinue()}
                      placeholder="e.g. SACHIN2026"
                      className="w-full text-center text-xl font-black tracking-widest rounded-2xl px-4 py-4 focus:outline-none transition-all"
                      style={{ background: "#FFF5F8", border: "1.5px solid rgba(255,45,120,0.2)", color: "#1A0A12", letterSpacing: "0.15em" }}
                      onFocus={e => { e.target.style.borderColor = "#FF2D78"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,45,120,0.2)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  <button onClick={handleCodeContinue} disabled={loading || !eventCode.trim()}
                    className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 20px rgba(255,45,120,0.3)" }}>
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Checking…</>
                      : <>Continue <ChevronRight size={18} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Selfie ── */}
            {step === "selfie" && (
              <motion.div key="selfie"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8"
                style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 8px 40px rgba(255,45,120,0.08)" }}>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "linear-gradient(135deg,#A855F7,#0D9488)", boxShadow: "0 8px 24px rgba(168,85,247,0.3)" }}>
                    <ScanFace size={24} className="text-white" />
                  </div>
                  <h2 className="font-black text-2xl text-deep tracking-tight mb-1">Upload Your Selfie</h2>
                  {eventName && (
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mt-1"
                      style={{ background: "rgba(13,148,136,0.08)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.2)" }}>
                      📸 {eventName}
                    </span>
                  )}
                  <p className="text-slate-500 text-sm mt-2">Use a clear, front-facing photo for best results</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {selfiePreview ? (
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Image src={selfiePreview} alt="Selfie" width={160} height={160}
                        className="w-40 h-40 rounded-2xl object-cover"
                        style={{ boxShadow: "0 0 0 4px rgba(168,85,247,0.25), 0 8px 24px rgba(168,85,247,0.15)" }} unoptimized />
                      <button onClick={() => { setSelfiePreview(null); setSelfieFile(null); }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg"
                        style={{ background: "#EF4444" }}>
                        <X size={13} />
                      </button>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                        style={{ background: "linear-gradient(135deg,#A855F7,#0D9488)" }}>
                        <CheckCircle size={10} /> Ready
                      </div>
                    </div>
                  </div>
                ) : useCamera ? (
                  <div className="mb-6">
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                      className="w-full rounded-2xl" mirrored
                      style={{ border: "1.5px solid rgba(255,45,120,0.15)" }} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={capturePhoto}
                        className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}>
                        <Camera size={16} /> Capture
                      </button>
                      <button onClick={() => setUseCamera(false)}
                        className="flex-1 py-3 rounded-2xl font-semibold text-slate-600"
                        style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    <div {...getRootProps()}
                      className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
                      style={{
                        border: `2px dashed ${isDragActive ? "#FF2D78" : "rgba(255,45,120,0.25)"}`,
                        background: isDragActive ? "rgba(255,45,120,0.04)" : "#FAFBFC",
                      }}>
                      <input {...getInputProps()} />
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: "rgba(255,45,120,0.08)" }}>
                        <Upload size={22} style={{ color: "#FF2D78" }} />
                      </div>
                      <p className="font-semibold text-deep text-sm">Drop your selfie here</p>
                      <p className="text-slate-400 text-xs mt-1">or click to browse · JPG, PNG, WEBP</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,45,120,0.1)" }} />
                      <span className="text-xs text-slate-400 font-medium">or</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,45,120,0.1)" }} />
                    </div>
                    <button onClick={() => setUseCamera(true)}
                      className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ background: "rgba(255,45,120,0.06)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                      <Camera size={16} /> Use Camera
                    </button>
                  </div>
                )}

                {/* Progress */}
                {loading && (
                  <div className="mb-5 p-4 rounded-2xl" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    {/* Mode badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-600">
                        {searchMode === "server"
                          ? <><Server size={12} style={{ color: "#0D9488" }} className="animate-pulse" /> Server AI (Facenet512)</>
                          : searchMode === "fast"
                          ? <><Cpu size={12} style={{ color: "#8B5CF6" }} className="animate-pulse" /> Fast Vector Search</>
                          : <><Brain size={12} style={{ color: "#A855F7" }} className="animate-pulse" /> Browser AI</>}
                        <span className="text-slate-400 ml-1">— {progressLabel}</span>
                      </span>
                      <span className="font-bold text-xs" style={{ color: "#A855F7" }}>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(168,85,247,0.12)" }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: searchMode === "server"
                          ? "linear-gradient(90deg,#0D9488,#A855F7)"
                          : searchMode === "fast"
                          ? "linear-gradient(90deg,#8B5CF6,#6366F1)"
                          : "linear-gradient(90deg,#FF2D78,#A855F7,#0D9488)" }}
                        animate={{ width: `${progress || 5}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }} />
                    </div>
                    {loadingModels && (
                      <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center gap-1.5">
                        <Zap size={11} className="text-amber-400" />
                        Loading AI models (~5s first time)…
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setStep("code"); setError(""); }} disabled={loading}
                    className="px-5 py-3 rounded-2xl font-semibold text-sm text-slate-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button onClick={handleSearch} disabled={loading || !selfiePreview}
                    className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 20px rgba(255,45,120,0.3)" }}>
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{progressLabel || "Searching…"}</>
                      : <><ScanFace size={17} /> Find My Photos</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Results ── */}
            {step === "results" && (
              <motion.div key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full">

                {/* Results header */}
                <div className="bg-white rounded-3xl p-5 mb-4 flex items-center justify-between"
                  style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 4px 20px rgba(255,45,120,0.06)" }}>
                  <div>
                    <h2 className="font-black text-xl text-deep tracking-tight">Your Photos</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {results.length > 0
                        ? <><span className="font-bold" style={{ color: "#FF2D78" }}>{results.length}</span> match{results.length > 1 ? "es" : ""} in <span className="font-semibold text-deep">{eventName || eventCode}</span></>
                        : <>No matches in <span className="font-semibold text-deep">{eventName || eventCode}</span></>}
                    </p>
                  </div>
                  <button onClick={reset}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: "rgba(255,45,120,0.06)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}>
                    New Search
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center"
                    style={{ border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 4px 20px rgba(255,45,120,0.06)" }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(255,45,120,0.06)" }}>
                      <ScanFace size={28} style={{ color: "#FF2D78" }} />
                    </div>
                    <h3 className="font-bold text-lg text-deep mb-2">No matches found</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                      Try a clearer, front-facing selfie with good lighting.
                    </p>
                    <button onClick={() => setStep("selfie")}
                      className="px-6 py-3 rounded-2xl font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 16px rgba(255,45,120,0.3)" }}>
                      Try Different Selfie
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {results.map((photo, i) => (
                        <motion.div key={photo._id}
                          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(i * 0.04, 0.3) }}
                          className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer"
                          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                          onClick={() => { setLightbox(photo); trackPhoto(photo, "view"); }}>
                          <Image src={photo.url} alt="Your photo" fill unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-2.5"
                            style={{ background: "linear-gradient(to top,rgba(0,0,0,0.5),transparent)" }}>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-lg"
                                style={{ background: "rgba(255,45,120,0.85)", backdropFilter: "blur(4px)" }}>
                                {Math.round(photo.similarity * 100)}%
                              </span>
                              <button onClick={e => { e.stopPropagation(); downloadPhoto(photo.url, photo.name); trackPhoto(photo, "download"); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                                <Download size={13} />
                              </button>
                            </div>
                          </div>
                          <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${photo.similarity > 0.8 ? "bg-green-400" : photo.similarity > 0.65 ? "bg-yellow-400" : "bg-orange-400"}`} />
                          {(photo.faceCount ?? 0) > 1 && (
                            <div className="absolute top-2 right-2 text-xs bg-white/90 text-slate-700 px-1.5 py-0.5 rounded-lg shadow-sm">
                              👥 {photo.faceCount}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <button onClick={downloadAllAsZip}
                      className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)", boxShadow: "0 4px 20px rgba(255,45,120,0.3)" }}>
                      <Download size={17} /> Download All as ZIP ({results.length})
                    </button>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(12px)" }}
            onClick={() => setLightbox(null)}>
            <button className="absolute top-5 right-5 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <X size={18} />
            </button>
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
              className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
                <Image src={lightbox.url} alt="Photo" fill unoptimized className="object-contain" />
              </div>
              <div className="flex items-center justify-between mt-4 px-1">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {Math.round(lightbox.similarity * 100)}% match
                    <span className="text-white/40 text-xs ml-2">distance: {lightbox.distance}</span>
                  </p>
                  <p className="text-white/40 text-xs font-mono truncate max-w-xs mt-0.5">{lightbox.name}</p>
                </div>
                <button onClick={() => { downloadPhoto(lightbox.url, lightbox.name); trackPhoto(lightbox, "download"); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg,#FF2D78,#A855F7)" }}>
                  <Download size={14} /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
