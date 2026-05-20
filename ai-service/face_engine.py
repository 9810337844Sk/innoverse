import numpy as np
import faiss
from deepface import DeepFace
from PIL import Image
import cv2


class FaceEngine:
    """
    Face recognition engine using DeepFace (FaceNet) + FAISS for fast search.
    """

    def __init__(self, model_name: str = "Facenet512"):
        self.model_name = model_name
        self.detector = "retinaface"  # Best accuracy; fallback: "mtcnn"
        self.embedding_dim = 512 if "512" in model_name else 128
        print(f"✅ FaceEngine initialized: {model_name} + {self.detector}")

    def get_embedding(self, img_array: np.ndarray) -> np.ndarray | None:
        """Extract a single face embedding from an image (e.g. selfie)."""
        try:
            result = DeepFace.represent(
                img_path=img_array,
                model_name=self.model_name,
                detector_backend=self.detector,
                enforce_detection=True,
                align=True,
            )
            if result:
                emb = np.array(result[0]["embedding"], dtype=np.float32)
                # L2 normalize for cosine similarity via inner product
                emb = emb / np.linalg.norm(emb)
                return emb
        except Exception as e:
            print(f"Embedding error: {e}")
        return None

    def extract_faces(self, img_array: np.ndarray) -> list:
        """
        Extract all faces from an event photo.
        Returns list of {faceId, embedding, bbox}.
        """
        faces = []
        try:
            results = DeepFace.represent(
                img_path=img_array,
                model_name=self.model_name,
                detector_backend=self.detector,
                enforce_detection=False,
                align=True,
            )
            for i, r in enumerate(results):
                emb = np.array(r["embedding"], dtype=np.float32)
                emb = emb / np.linalg.norm(emb)
                region = r.get("facial_area", {})
                faces.append({
                    "faceId": f"face_{i}",
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

    def search_faiss(self, query_embedding: np.ndarray, photos: list, threshold: float = 0.6) -> list:
        """
        Build a FAISS index from event photo embeddings and search for matches.
        Uses inner product (cosine similarity since embeddings are L2-normalized).
        """
        # Collect all face embeddings with their photo IDs
        all_embeddings = []
        photo_map = []  # maps index -> photo_id

        for photo in photos:
            for face in photo.get("faces", []):
                emb = face.get("embedding")
                if emb and len(emb) == self.embedding_dim:
                    all_embeddings.append(emb)
                    photo_map.append(str(photo["_id"]))

        if not all_embeddings:
            return []

        # Build FAISS index
        embeddings_matrix = np.array(all_embeddings, dtype=np.float32)
        index = faiss.IndexFlatIP(self.embedding_dim)  # Inner product = cosine for normalized vecs
        index.add(embeddings_matrix)

        # Search
        query = query_embedding.reshape(1, -1)
        k = min(50, len(all_embeddings))
        similarities, indices = index.search(query, k)

        # Collect unique matching photos above threshold
        seen = set()
        matches = []
        for sim, idx in zip(similarities[0], indices[0]):
            if sim >= threshold and idx >= 0:
                photo_id = photo_map[idx]
                if photo_id not in seen:
                    seen.add(photo_id)
                    matches.append({"photo_id": photo_id, "similarity": float(sim)})

        # Sort by similarity descending
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches

    def generate_tags(self, img_array: np.ndarray, faces: list) -> list:
        """Generate simple AI tags for a photo."""
        tags = []
        if len(faces) == 0:
            tags.append("no-face")
        elif len(faces) == 1:
            tags.append("portrait")
        elif len(faces) >= 3:
            tags.append("group")

        # Check image brightness (outdoor/indoor heuristic)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        brightness = np.mean(gray)
        if brightness > 150:
            tags.append("bright")
        elif brightness < 80:
            tags.append("dark")

        return tags
