import os
import io
import json
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import httpx
from dotenv import load_dotenv

from face_engine import FaceEngine

load_dotenv()

face_engine = FaceEngine()


# ── Startup: warm up DeepFace model so first request is fast ─────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔥 Warming up DeepFace model…")
    try:
        dummy = np.zeros((160, 160, 3), dtype=np.uint8)
        face_engine.get_embedding(dummy)
        print("✅ Model warm-up done")
    except Exception as e:
        print(f"⚠️  Warm-up skipped: {e}")
    yield


app = FastAPI(title="PhotoFly AI Service", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model": face_engine.model_name}


# ── Index photos for an event ─────────────────────────────────────────────────

@app.post("/index")
async def index_event(payload: dict, background_tasks: BackgroundTasks):
    """
    Receives list of photos and indexes their face embeddings.
    Called by Next.js /api/photos/index/[eventId] asynchronously.

    payload:
        event_id    — Supabase event UUID
        photos      — [{id, url, name?}]
        callback_url — where to POST results (default: APP_URL/api/photos/index-callback)
    """
    event_id     = payload.get("event_id")
    photos       = payload.get("photos", [])
    callback_url = payload.get("callback_url")

    if not event_id:
        raise HTTPException(status_code=400, detail="event_id required")

    # Evict stale cache so next search rebuilds with the new photos
    face_engine.invalidate_cache(event_id)

    background_tasks.add_task(process_index, event_id, photos, callback_url)
    return {"message": f"Indexing {len(photos)} photos in background", "event_id": event_id}


async def process_index(event_id: str, photos: list, callback_url: str | None = None):
    """Background task: download each photo, extract faces, POST results to callback."""
    app_url  = os.getenv("APP_URL", "http://localhost:3000")
    cb       = callback_url or f"{app_url}/api/photos/index-callback"
    secret   = os.getenv("INTERNAL_SECRET", "")
    cb_headers = {"x-internal-secret": secret} if secret else {}

    async with httpx.AsyncClient(timeout=60) as client:
        for photo in photos:
            try:
                resp = await client.get(photo["url"])
                resp.raise_for_status()
                img       = Image.open(io.BytesIO(resp.content)).convert("RGB")
                img_array = np.array(img)

                faces = face_engine.extract_faces(img_array)
                tags  = face_engine.generate_tags(img_array, faces)

                await client.post(cb, json={
                    "photoId": photo["id"],
                    "faces":   faces,
                    "tags":    tags,
                }, headers=cb_headers)
            except Exception as e:
                print(f"Error indexing photo {photo.get('id')}: {e}")

    # Evict cache so next search picks up newly indexed photos
    face_engine.invalidate_cache(event_id)
    print(f"✅ Indexed {len(photos)} photos for event {event_id}")


# ── Search faces ──────────────────────────────────────────────────────────────

@app.post("/search")
async def search_faces(
    selfie:    UploadFile = File(...),
    event_id:  str        = Form(...),
    threshold: float      = Form(0.6),
    photos:    str        = Form(...),
):
    """
    Given a selfie and a JSON list of indexed photos (with embeddings), find matches.

    photos — JSON string:
        [{
            "id": "<supabase-uuid>",
            "url": "...",
            "thumbnailUrl": "...",
            "facesCount": 2,
            "faces": [{"faceId": "face_0", "embedding": [...512 floats...], "bbox": {...}}]
        }]

    Called by Next.js /api/search/face which fetches photos from Supabase first.
    """
    try:
        contents  = await selfie.read()
        img       = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = np.array(img)

        selfie_embedding = face_engine.get_embedding(img_array)
        if selfie_embedding is None:
            raise HTTPException(
                status_code=400,
                detail="No face detected in selfie. Use a clear, front-facing photo.",
            )

        photos_list: list = json.loads(photos) if isinstance(photos, str) else photos

        if not photos_list:
            return {"matches": [], "total": 0, "message": "No indexed photos for this event yet"}

        # Normalise to the shape face_engine.search_faiss expects
        normalised = [
            {
                "_id":          p["id"],
                "url":          p.get("url", ""),
                "thumbnailUrl": p.get("thumbnailUrl"),
                "facesCount":   p.get("facesCount", len(p.get("faces", []))),
                "faces":        p.get("faces", []),
            }
            for p in photos_list
        ]

        raw_matches = face_engine.search_faiss(
            selfie_embedding, normalised, threshold, event_id=event_id
        )

        photo_index = {p["_id"]: p for p in normalised}
        matches = []
        for m in raw_matches:
            p = photo_index.get(m["photo_id"])
            if p:
                matches.append({
                    "_id":          p["_id"],
                    "url":          p.get("url", ""),
                    "thumbnailUrl": p.get("thumbnailUrl"),
                    "facesCount":   p.get("facesCount", 1),
                    "similarity":   m["similarity"],
                })

        return {"matches": matches, "total": len(matches)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
