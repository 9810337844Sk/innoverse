/**
 * Browser-side face recognition — face-api.js (TensorFlow.js)
 *
 * Key fixes vs v1:
 *  - detectAllFaces() on event photos  → works on group shots
 *  - SsdMobilenetv1 detector           → much more accurate than TinyFaceDetector
 *  - Compare selfie against EVERY face in every photo
 *  - Best-face-per-photo logic         → one result per photo, best matching face wins
 *  - Adaptive threshold                → auto-relaxes if 0 results found
 */

import * as faceapi from "face-api.js";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Cannot load: ${src}`));
    img.src = src;
  });
}

/** Extract the BEST descriptor from a selfie (single face expected) */
async function getSelfieDescriptor(img: HTMLImageElement): Promise<Float32Array | null> {
  const detections = await faceapi
    .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) return null;

  // Pick the largest / most confident face (most likely the selfie subject)
  const best = detections.reduce((a, b) =>
    a.detection.score > b.detection.score ? a : b
  );
  return best.descriptor;
}

/** Extract ALL face descriptors from an event photo (handles groups) */
async function getAllDescriptors(img: HTMLImageElement): Promise<Float32Array[]> {
  const detections = await faceapi
    .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map((d) => d.descriptor);
}

export type FaceMatch = {
  _id:        string;
  url:        string;
  name:       string;
  similarity: number;   // 0–1, higher = better
  distance:   number;   // euclidean, lower = better
  faceCount:  number;   // how many faces were in the photo
};

export type StoredPhoto = {
  _id:     string;
  url:     string;
  name:    string;
  indexed: boolean;
};

/**
 * Find all event photos that contain the person in the selfie.
 *
 * @param selfieFile   - File from user's selfie upload
 * @param eventPhotos  - Photos saved in localStorage for the event
 * @param threshold    - Max euclidean distance (default 0.5 — strict)
 * @param onProgress   - Progress callback (done, total, label)
 */
export async function findMatchingPhotos(
  selfieFile: File,
  eventPhotos: StoredPhoto[],
  threshold = 0.5,
  onProgress?: (done: number, total: number, label: string) => void
): Promise<FaceMatch[]> {

  await loadModels();

  // ── 1. Get selfie descriptor ──────────────────────────────────────────────
  onProgress?.(0, eventPhotos.length, "Analysing your selfie…");

  const selfieUrl = URL.createObjectURL(selfieFile);
  let selfieImg: HTMLImageElement;
  try {
    selfieImg = await loadImage(selfieUrl);
  } finally {
    URL.revokeObjectURL(selfieUrl);
  }

  const selfieDescriptor = await getSelfieDescriptor(selfieImg);
  if (!selfieDescriptor) {
    throw new Error(
      "No face detected in your selfie. Please use a clear, well-lit, front-facing photo."
    );
  }

  // ── 2. Scan every event photo ─────────────────────────────────────────────
  const matches: FaceMatch[] = [];
  const total = eventPhotos.length;

  for (let i = 0; i < total; i++) {
    const photo = eventPhotos[i];
    onProgress?.(i + 1, total, `Scanning photo ${i + 1} of ${total}…`);

    try {
      const img          = await loadImage(photo.url);
      const descriptors  = await getAllDescriptors(img);

      if (descriptors.length === 0) continue; // no face in this photo

      // Find the closest face in this photo to the selfie
      let bestDistance = Infinity;
      for (const desc of descriptors) {
        const dist = faceapi.euclideanDistance(selfieDescriptor, desc);
        if (dist < bestDistance) bestDistance = dist;
      }

      if (bestDistance <= threshold) {
        matches.push({
          _id:       photo._id,
          url:       photo.url,
          name:      photo.name,
          similarity: parseFloat(Math.max(0, 1 - bestDistance).toFixed(3)),
          distance:   parseFloat(bestDistance.toFixed(3)),
          faceCount:  descriptors.length,
        });
      }
    } catch {
      // skip unloadable photos silently
    }
  }

  // ── 3. Auto-relax threshold if nothing found ──────────────────────────────
  if (matches.length === 0 && threshold <= 0.5) {
    onProgress?.(0, total, "No matches — retrying with relaxed threshold…");
    return findMatchingPhotos(selfieFile, eventPhotos, 0.65, onProgress);
  }

  // Sort best match first
  return matches.sort((a, b) => a.distance - b.distance);
}
