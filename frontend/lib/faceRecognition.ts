/**
 * Browser-side face recognition — face-api.js (TensorFlow.js)
 *
 * v4 — major reliability fixes:
 *  ① Blob-fetch image loading  — avoids CORS canvas-taint (root cause of silent 0 results)
 *  ② Canvas resizer            — caps input at 640 px before detection (faster + less OOM)
 *  ③ Dual detector             — SsdMobilenetv1 → TinyFaceDetector fallback (catches more faces)
 *  ④ Better thresholds         — 0.6 initial / 0.72 relaxed (same person in different lighting)
 *  ⑤ Error-resilient models    — modelsLoaded resets on failure so the next call retries
 *  ⑥ 6 parallel workers        — saturates network without overwhelming TF.js GPU queue
 */

import * as faceapi from "face-api.js";

let modelsLoaded = false;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
  } catch (err) {
    modelsLoaded = false; // allow retry next call
    throw err;
  }
}

// ── Public types ──────────────────────────────────────────────────────────────

export type FaceMatch = {
  _id:        string;
  url:        string;
  name:       string;
  similarity: number;
  distance:   number;
  faceCount:  number;
};

export type StoredPhoto = {
  _id:           string;
  url:           string;
  thumbnailUrl?: string;
  name:          string;
  indexed:       boolean;
};

export type StoredDescriptor = {
  _id:           string;
  url:           string;
  thumbnailUrl?: string;
  name:          string;
  descriptors:   number[][];  // pre-computed 128-dim face-api.js vectors
};

// ── Image loading — blob-fetch avoids CORS canvas taint ───────────────────────

/**
 * Fetch image as a same-origin blob URL so the canvas is never tainted.
 * Falls back to crossOrigin img if fetch fails (e.g. Drive proxy images).
 */
async function fetchImage(
  primary: string,
  fallback?: string,
): Promise<HTMLImageElement> {
  const viaBlob = async (url: string): Promise<HTMLImageElement> => {
    const resp = await fetch(url, { mode: "cors", cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error(`Blob load failed: ${url}`));
      };
      img.src = blobUrl;
    });
  };

  const viaSrc = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Cannot load: ${url}`));
      img.src = url;
    });

  const urls = [primary, fallback].filter(Boolean) as string[];

  // Try blob-fetch first (CORS-safe canvas)
  for (const url of urls) {
    try { return await viaBlob(url); } catch { /* next */ }
  }
  // Fallback: direct src (may taint canvas, but better than nothing)
  for (const url of urls) {
    try { return await viaSrc(url); } catch { /* next */ }
  }
  throw new Error(`Cannot load image: ${primary}`);
}

// ── Canvas resizer — cap input size for speed and stability ───────────────────

function toCanvas(img: HTMLImageElement, maxPx = 640): HTMLCanvasElement {
  const w = img.naturalWidth  || img.width  || 640;
  const h = img.naturalHeight || img.height || 480;
  const scale = Math.min(1, maxPx / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width  = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// ── Face detection helpers ────────────────────────────────────────────────────

const SSD_OPTS  = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 });
const TINY_OPTS = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 });

/**
 * Extract ALL face descriptors from a photo (for group shots).
 * SsdMobilenetv1 → TinyFaceDetector fallback.
 */
async function getAllDescriptors(
  input: HTMLCanvasElement,
): Promise<Float32Array[]> {
  let dets = await faceapi.detectAllFaces(input, SSD_OPTS)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!dets.length) {
    dets = await faceapi.detectAllFaces(input, TINY_OPTS)
      .withFaceLandmarks()
      .withFaceDescriptors();
  }

  return dets.map(d => d.descriptor);
}

/**
 * Extract the best (highest-confidence) face descriptor from a selfie.
 * Returns null if no face detected.
 */
async function getBestDescriptor(
  input: HTMLCanvasElement,
): Promise<Float32Array | null> {
  let dets = await faceapi.detectAllFaces(input, SSD_OPTS)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!dets.length) {
    dets = await faceapi.detectAllFaces(input, TINY_OPTS)
      .withFaceLandmarks()
      .withFaceDescriptors();
  }

  if (!dets.length) return null;
  return dets.reduce((a, b) =>
    a.detection.score > b.detection.score ? a : b
  ).descriptor;
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function withConcurrency<T>(
  tasks:       Array<() => Promise<T | null>>,
  concurrency: number,
  onDone:      (done: number, total: number) => void,
): Promise<Array<T | null>> {
  const results: Array<T | null> = new Array(tasks.length).fill(null);
  let nextIdx = 0;
  let completed = 0;
  const total = tasks.length;

  async function worker() {
    while (nextIdx < total) {
      const i = nextIdx++;
      try {
        results[i] = await tasks[i]();
      } catch {
        results[i] = null;
      }
      onDone(++completed, total);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, total) }, worker),
  );
  return results;
}

// ── Single-photo comparison ───────────────────────────────────────────────────

async function processPhoto(
  photo:            StoredPhoto,
  selfieDescriptor: Float32Array,
  threshold:        number,
): Promise<FaceMatch | null> {
  const img = await fetchImage(
    photo.thumbnailUrl ?? photo.url,
    photo.thumbnailUrl ? photo.url : undefined,
  );
  const canvas = toCanvas(img, 640);
  const descriptors = await getAllDescriptors(canvas);
  if (!descriptors.length) return null;

  let bestDist = Infinity;
  for (const desc of descriptors) {
    const d = faceapi.euclideanDistance(selfieDescriptor, desc);
    if (d < bestDist) bestDist = d;
  }

  if (bestDist > threshold) return null;

  return {
    _id:        photo._id,
    url:        photo.url,
    name:       photo.name,
    similarity: parseFloat(Math.max(0, 1 - bestDist).toFixed(3)),
    distance:   parseFloat(bestDist.toFixed(3)),
    faceCount:  descriptors.length,
  };
}

// ── Public API — image-scan search (full fallback) ────────────────────────────

/**
 * Scan all event photos for the person in the selfie.
 * 6 parallel workers • blob-fetch images • dual detector • auto-relaxed threshold.
 */
export async function findMatchingPhotos(
  selfieFile:  File,
  eventPhotos: StoredPhoto[],
  threshold    = 0.6,
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<FaceMatch[]> {
  await loadModels();

  // Extract selfie descriptor
  onProgress?.(0, eventPhotos.length, "Analysing your selfie…");
  const selfieBlob = URL.createObjectURL(selfieFile);
  let selfieImg: HTMLImageElement;
  try {
    selfieImg = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = selfieBlob;
    });
  } finally {
    URL.revokeObjectURL(selfieBlob);
  }

  const selfieCanvas = toCanvas(selfieImg, 800); // slightly larger for selfie accuracy
  const selfieDescriptor = await getBestDescriptor(selfieCanvas);
  if (!selfieDescriptor) {
    throw new Error(
      "No face detected in your selfie. Use a clear, front-facing photo with good lighting.",
    );
  }

  // Parallel scan
  const total = eventPhotos.length;
  onProgress?.(0, total, `Scanning ${total} photos…`);

  const tasks = eventPhotos.map(photo => () =>
    processPhoto(photo, selfieDescriptor, threshold),
  );

  const raw = await withConcurrency<FaceMatch>(tasks, 6, (done, t) => {
    onProgress?.(done, t, `Scanning photos… (${done}/${t})`);
  });

  const matches = raw.filter((m): m is FaceMatch => m !== null);

  // Auto-relax threshold once if nothing found
  if (matches.length === 0 && threshold <= 0.6) {
    onProgress?.(0, total, "No matches — retrying with relaxed threshold…");
    return findMatchingPhotos(selfieFile, eventPhotos, 0.72, onProgress);
  }

  return matches.sort((a, b) => a.distance - b.distance);
}

// ── Public API — fast vector search (pre-stored descriptors) ──────────────────

/**
 * Instant search: compare selfie against pre-stored 128-dim descriptors.
 * No photo image downloads needed — pure vector math.
 */
export async function fastSearchFromDescriptors(
  selfieFile: File,
  stored:     StoredDescriptor[],
  threshold   = 0.6,
  _relaxed    = false,
): Promise<FaceMatch[]> {
  await loadModels();

  const selfieBlob = URL.createObjectURL(selfieFile);
  let selfieImg: HTMLImageElement;
  try {
    selfieImg = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = selfieBlob;
    });
  } finally {
    URL.revokeObjectURL(selfieBlob);
  }

  const selfieCanvas = toCanvas(selfieImg, 800);
  const selfieDescriptor = await getBestDescriptor(selfieCanvas);
  if (!selfieDescriptor) {
    throw new Error(
      "No face detected in your selfie. Use a clear, front-facing photo with good lighting.",
    );
  }

  const matches: FaceMatch[] = [];
  for (const photo of stored) {
    if (!photo.descriptors.length) continue;
    let best = Infinity;
    for (const raw of photo.descriptors) {
      const d = faceapi.euclideanDistance(selfieDescriptor, new Float32Array(raw));
      if (d < best) best = d;
    }
    if (best <= threshold) {
      matches.push({
        _id:        photo._id,
        url:        photo.url,
        name:       photo.name,
        similarity: parseFloat(Math.max(0, 1 - best).toFixed(3)),
        distance:   parseFloat(best.toFixed(3)),
        faceCount:  photo.descriptors.length,
      });
    }
  }

  if (matches.length === 0 && !_relaxed) {
    return fastSearchFromDescriptors(selfieFile, stored, 0.72, true);
  }

  return matches.sort((a, b) => a.distance - b.distance);
}

// ── Public API — offline batch indexing ───────────────────────────────────────

/**
 * Pre-compute 128-dim descriptors for all photos (offline storage).
 * Run once from the dashboard; results stored in Supabase faces_client column.
 * Subsequent searches use fastSearchFromDescriptors — no image downloads needed.
 */
export async function computeAllDescriptors(
  photos:      StoredPhoto[],
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<{ id: string; descriptors: number[][] }[]> {
  await loadModels();

  const tasks = photos.map(photo => async (): Promise<{ id: string; descriptors: number[][] } | null> => {
    try {
      const img = await fetchImage(
        photo.thumbnailUrl ?? photo.url,
        photo.thumbnailUrl ? photo.url : undefined,
      );
      const canvas = toCanvas(img, 640);
      const descs  = await getAllDescriptors(canvas);
      return { id: photo._id, descriptors: descs.map(d => Array.from(d)) };
    } catch {
      return { id: photo._id, descriptors: [] };
    }
  });

  const raw = await withConcurrency<{ id: string; descriptors: number[][] }>(
    tasks, 6,
    (done, total) => onProgress?.(done, total, `Offline indexing… (${done}/${total})`),
  );

  return raw.filter((r): r is { id: string; descriptors: number[][] } => r !== null);
}
