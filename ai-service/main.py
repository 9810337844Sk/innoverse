import os
import io
import asyncio
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import httpx
from dotenv import load_dotenv

from face_engine import FaceEngine
from db import get_db

load_dotenv()

app = FastAPI(title="PhotoFly AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

face_engine = FaceEngine()

# ─── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model": face_engine.model_name}


# ─── Index photos for an event ─────────────────────────────────────────────────

@app.post("/index")
async def index_event(payload: dict, background_tasks: BackgroundTasks):
    """
    Receives list of photos and indexes their face embeddings.
    Called by Node.js backend asynchronously.
    """
    event_id = payload["event_id"]
    photos = payload["photos"]  # [{id, url}]
    background_tasks.add_task(process_index, event_id, photos)
    return {"message": f"Indexing {len(photos)} photos in background", "event_id": event_id}


async def process_index(event_id: str, photos: list):
    """Background task: download each photo, extract faces, store embeddings."""
    db = await get_db()
    backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")

    async with httpx.AsyncClient(timeout=30) as client:
        for photo in photos:
            try:
                # Download image
                resp = await client.get(photo["url"])
                img = Image.open(io.BytesIO(resp.content)).convert("RGB")
                img_array = np.array(img)

                # Extract faces and embeddings
                faces = face_engine.extract_faces(img_array)

                # Callback to Node.js backend
                await client.post(f"{backend_url}/api/photos/index-callback", json={
                    "photoId": photo["id"],
                    "faces": faces,
                    "tags": face_engine.generate_tags(img_array, faces),
                })
            except Exception as e:
                print(f"Error indexing photo {photo['id']}: {e}")


# ─── Search faces ──────────────────────────────────────────────────────────────

@app.post("/search")
async def search_faces(
    selfie: UploadFile = File(...),
    event_id: str = Form(...),
    threshold: float = Form(0.6),
):
    """
    Given a selfie and event_id, find all matching photos using FAISS.
    """
    try:
        # Read selfie
        contents = await selfie.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = np.array(img)

        # Extract selfie embedding
        selfie_embedding = face_engine.get_embedding(img_array)
        if selfie_embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in selfie. Please use a clear front-facing photo.")

        # Load event embeddings from DB
        db = await get_db()
        photos = await db["photos"].find(
            {"eventId": event_id, "indexed": True, "facesCount": {"$gt": 0}},
            {"_id": 1, "faces": 1}
        ).to_list(length=10000)

        if not photos:
            return {"matches": [], "message": "No indexed photos found for this event"}

        # Build FAISS index for this event
        matches = face_engine.search_faiss(selfie_embedding, photos, threshold)

        return {"matches": matches, "total": len(matches)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
