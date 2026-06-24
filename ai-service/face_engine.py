import time
import threading
import numpy as np
import faiss
from deepface import DeepFace
import cv2


# Per-event FAISS index cache: event_id → {index, photo_map, expires_at}
_index_cache: dict = {}
_cache_lock = threading.Lock()
_CACHE_TTL = 1800  # 30 minutes


class FaceEngine:
    """
    Face recognition engine: DeepFace (Facenet512) + FAISS with per-event caching.

    Detector priority: retinaface → mtcnn → opencv
    Embeddings are L2-normalized so FAISS IndexFlatIP == cosine similarity.
    """

    DETECTOR_FALLBACKS = ["retinaface", "mtcnn", "opencv"]

    def __init__(self, model_name: str = "Facenet512"):
        self.model_name = model_name
        self.embedding_dim = 512 if "512" in model_name else 128
        print(f"✅ FaceEngine ready: {model_name}, dim={self.embedding_dim}")

    def _represent(self, img_array: np.ndarray, enforce: bool) -> list:
        """Run DeepFace.represent with detector fallbacks."""
        for detector in self.DETECTOR_FALLBACKS:
            try:
                return DeepFace.represent(
                    img_path=img_array,
                    model_name=self.model_name,
                    detector_backend=detector,
                    enforce_detection=enforce,
                    align=True,
                )
            except Exception as e:
                last_err = e
                continue
        raise last_err  # all detectors failed

    def _normalize(self, emb: list) -> np.ndarray:
        v = np.array(emb, dtype=np.float32)
        norm = np.linalg.norm(v)
        return v / norm if norm > 0 else v

    def get_embedding(self, img_array: np.ndarray) -> np.ndarray | None:
        """Extract best-face embedding from a selfie."""
        try:
            results = self._represent(img_array, enforce=True)
            if results:
                return self._normalize(results[0]["embedding"])
        except Exception as e:
            print(f"Embedding error: {e}")
        return None

    def extract_faces(self, img_array: np.ndarray) -> list:
        """Extract all faces from an event photo (handles groups)."""
        faces = []
        try:
            results = self._represent(img_array, enforce=False)
            for i, r in enumerate(results):
                emb = self._normalize(r["embedding"])
                region = r.get("facial_area", {})
                faces.append({
                    "faceId":    f"face_{i}",
                    "embedding": emb.tolist(),
                    "bbox": {
                        "x": region.get("x", 0),
                        "y": region.get("y", 0),
                        "w": region.get("w", 0),
                        "h": region.get("h", 0),
                    },
                })
        except Exception as e:
            print(f"Face extraction error: {e}")
        return faces

    # ── FAISS index cache ──────────────────────────────────────────────────────

    def _build_index(self, photos: list):
        """Build FAISS IndexFlatIP from photos list. Returns (index, photo_map)."""
        all_embeddings = []
        photo_map = []
        for photo in photos:
            for face in photo.get("faces", []):
                emb = face.get("embedding")
                if emb and len(emb) == self.embedding_dim:
                    all_embeddings.append(emb)
                    photo_map.append(str(photo["_id"]))

        if not all_embeddings:
            return None, []

        matrix = np.array(all_embeddings, dtype=np.float32)
        index = faiss.IndexFlatIP(self.embedding_dim)
        index.add(matrix)
        return index, photo_map

    def get_cached_index(self, event_id: str, photos: list):
        """Return (index, photo_map) from cache, rebuilding if stale."""
        now = time.monotonic()
        with _cache_lock:
            entry = _index_cache.get(event_id)
            if entry and entry["expires_at"] > now:
                return entry["index"], entry["photo_map"]

            # Rebuild
            index, photo_map = self._build_index(photos)
            if index is not None:
                _index_cache[event_id] = {
                    "index":      index,
                    "photo_map":  photo_map,
                    "expires_at": now + _CACHE_TTL,
                }
            return index, photo_map

    def invalidate_cache(self, event_id: str):
        """Evict a cached index (call after re-indexing an event)."""
        with _cache_lock:
            _index_cache.pop(event_id, None)

    # ── Search ─────────────────────────────────────────────────────────────────

    def search_faiss(
        self,
        query_embedding: np.ndarray,
        photos: list,
        threshold: float = 0.6,
        event_id: str | None = None,
    ) -> list:
        """
        Search indexed event photos for the query face embedding.
        Uses per-event FAISS cache when event_id is provided.
        """
        if event_id:
            index, photo_map = self.get_cached_index(event_id, photos)
        else:
            index, photo_map = self._build_index(photos)

        if index is None or not photo_map:
            return []

        query = query_embedding.reshape(1, -1)
        k = min(50, index.ntotal)
        similarities, indices = index.search(query, k)

        seen: set[str] = set()
        matches = []
        for sim, idx in zip(similarities[0], indices[0]):
            if sim >= threshold and idx >= 0:
                pid = photo_map[idx]
                if pid not in seen:
                    seen.add(pid)
                    matches.append({"photo_id": pid, "similarity": float(sim)})

        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches

    # ── Tagging ────────────────────────────────────────────────────────────────

    def generate_tags(self, img_array: np.ndarray, faces: list) -> list:
        tags = []
        if len(faces) == 0:
            tags.append("no-face")
        elif len(faces) == 1:
            tags.append("portrait")
        elif len(faces) >= 3:
            tags.append("group")

        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        brightness = float(np.mean(gray))
        if brightness > 150:
            tags.append("bright")
        elif brightness < 80:
            tags.append("dark")

        return tags
