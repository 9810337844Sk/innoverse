/**
 * DB helper — talks to Next.js API routes backed by Supabase.
 * Works on ALL devices on the network.
 */

export type StoredEvent = {
  _id: string; name: string; date: string; code: string;
  photographerId: string; photoCount: number; searchCount: number;
  downloadCount: number; createdAt: string;
  driveFolderUrl?: string;
  driveFolderId?: string;
  driveFolderName?: string;
  driveSyncedAt?: string;
};

export type StoredPhoto = {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  cloudinaryPublicId?: string;
  facesCount: number;
  tags: string[];
  indexed: boolean;
  savedAt: string;
};

function normalizeEvent(event: StoredEvent): StoredEvent {
  return {
    ...event,
    driveFolderUrl:  event.driveFolderUrl  ?? "",
    driveFolderId:   event.driveFolderId   ?? "",
    driveFolderName: event.driveFolderName ?? "",
    driveSyncedAt:   event.driveSyncedAt   ?? "",
  };
}

function getAuthHeaders(): HeadersInit {
  return {};
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<StoredEvent[]> {
  const r = await fetch("/api/events?limit=200");
  const j = await r.json() as { events: StoredEvent[] };
  return (j.events || []).map(normalizeEvent);
}

export async function getEventByCode(code: string): Promise<StoredEvent | null> {
  try {
    // Use the public endpoint — no auth required (used by /find page for guests)
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return null;
    const r = await fetch(`/api/events/public/${encodeURIComponent(normalizedCode)}`);
    if (!r.ok) return null;
    const data = await r.json() as StoredEvent;
    return data._id ? normalizeEvent(data) : null;
  } catch {
    return null;
  }
}

export async function createEvent(event: StoredEvent): Promise<void> {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: event.name,
      date: event.date,
      photographerId: event.photographerId,
    }),
  });
}

export async function updateEvent(event: StoredEvent): Promise<void> {
  const normalized = normalizeEvent(event);
  await fetch(`/api/events/${normalized._id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalized),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await fetch(`/api/events/${id}`, { method: "DELETE" });
}

// ── Photos ────────────────────────────────────────────────────────────────────
// Photos are stored in Supabase and served via Cloudinary CDN URLs.

export async function getPhotos(eventId: string): Promise<StoredPhoto[]> {
  // Use the public endpoint — no auth required.
  // The /find page (guests) uses this. The dashboard uses the backend API directly.
  const r = await fetch(`/api/photos/public/${eventId}`);
  const j = await r.json() as { photos: StoredPhoto[] };
  return j.photos || [];
}

export async function savePhotos(eventId: string, photos: StoredPhoto[]): Promise<void> {
  // Photos are already persisted to Supabase at upload time.
  // This function is kept for compatibility — it updates indexed/tags/facesCount
  // for photos that have been face-indexed client-side.
  const drivePhotos = photos.filter(p => p._id.startsWith("drive_") || p.url.startsWith("/api/drive/image"));
  const updates = photos.filter(p => !drivePhotos.includes(p)).map(p => ({
    id:          p._id,
    faces_count: p.facesCount,
    tags:        p.tags,
    indexed:     p.indexed,
  }));

  await Promise.all([
    ...updates.map(u =>
      fetch(`/api/photos/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ action: "update", photoId: u.id, patch: u }),
      })
    ),
    ...drivePhotos.map(photo =>
        fetch(`/api/photos/${eventId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ action: "upsert", photo }),
        })
    ),
  ]);
}

export async function pushPhotos(_eventId: string, _photos: StoredPhoto[]): Promise<void> {
  // No-op: photos are inserted into Supabase directly by /api/upload.
}

export async function deletePhoto(eventId: string, photoId: string): Promise<void> {
  await fetch(`/api/photos/${eventId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ action: "delete", photoId }),
  });
}
