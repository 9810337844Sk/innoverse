/**
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - eventId   : string  (Supabase event UUID)
 *   - eventCode : string  (used in Cloudinary folder name)
 *   - eventName : string  (human-readable, for fallback)
 *   - photos    : File[]  (one or more image files)
 *
 * Cloudinary folder structure (per-photographer isolation):
 *   photofly/photographers/<photographerId>/events/<eventCode>/
 *
 * This ensures one photographer can NEVER access another photographer's
 * Cloudinary assets — even if they somehow obtain a public_id.
 *
 * Returns: { photos: SavedPhoto[], count: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";
import type { DbEvent } from "@/lib/supabase";

export const maxDuration = 120; // 2 min for large batches

type SavedPhoto = {
  _id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
};

async function insertPhotoRow(input: {
  eventId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
}) {
  const row = {
    event_id:             input.eventId,
    url:                  input.url,
    thumbnail_url:        input.thumbnailUrl,
    name:                 input.name,
    cloudinary_public_id: input.cloudinaryPublicId,
    saved_at:             new Date().toISOString(),
  };

  const inserted = await supabase
    .from("photos")
    .insert(row)
    .select("id")
    .single();

  if (!inserted.error) return inserted.data;

  const message = inserted.error.message.toLowerCase();
  if (!message.includes("cloudinary_public_id")) throw inserted.error;

  const retry = await supabase
    .from("photos")
    .insert({
      event_id:      row.event_id,
      url:           row.url,
      thumbnail_url: row.thumbnail_url,
      name:          row.name,
      saved_at:      row.saved_at,
    })
    .select("id")
    .single();

  if (retry.error) throw retry.error;
  return retry.data;
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData  = await req.formData();
    const eventId   = formData.get("eventId")   as string | null;
    const eventCode = formData.get("eventCode") as string | null;
    const eventName = formData.get("eventName") as string | null;
    const files     = formData.getAll("photos") as File[];

    if (!eventId || !files.length) {
      return NextResponse.json({ error: "eventId and at least one photo are required" }, { status: 400 });
    }

    // ── Ownership check ─────────────────────────────────────────────────────
    const { data: eventRow, error: eventErr } = await supabase
      .from("events")
      .select("id, photographer_id")
      .eq("id", eventId)
      .single();

    if (eventErr || !eventRow) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (user.role !== "admin" && (eventRow as DbEvent).photographer_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied — this event belongs to another photographer" },
        { status: 403 }
      );
    }

    // ── Build per-photographer Cloudinary folder ────────────────────────────
    // photofly/photographers/<photographerId>/events/<eventCode>/
    const folderSlug = (eventCode ?? eventName ?? eventId)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toUpperCase();
    const folder = `photofly/photographers/${user.id}/events/${folderSlug}`;

    // ── Upload each file ────────────────────────────────────────────────────
    const saved: SavedPhoto[] = [];

    for (const file of files) {
      const bytes  = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const publicId = `${Date.now()}_${safeName.replace(/\.[^.]+$/, "")}`;

      const { url, thumbnailUrl, publicId: fullPublicId } =
        await uploadToCloudinary(buffer, publicId, folder);

      let row: { id: string };
      try {
        row = await insertPhotoRow({
          eventId,
          url,
          thumbnailUrl,
          name: file.name,
          cloudinaryPublicId: fullPublicId,
        });
      } catch (error) {
        await deleteFromCloudinary(fullPublicId).catch(e =>
          console.warn("[upload] Cloudinary rollback failed:", e)
        );
        throw error;
      }

      saved.push({
        _id:                row.id,
        url,
        thumbnailUrl,
        name:               file.name,
        cloudinaryPublicId: fullPublicId,
      });
    }

    // ── Increment event photo_count ─────────────────────────────────────────
    if (saved.length > 0) {
      await supabase.rpc("increment_photo_count", {
        p_event_id: eventId,
        p_amount:   saved.length,
      }).then(({ error }) => {
        if (error) {
          return supabase
            .from("events")
            .select("photo_count")
            .eq("id", eventId)
            .single()
            .then(({ data }) =>
              supabase
                .from("events")
                .update({ photo_count: (data?.photo_count ?? 0) + saved.length })
                .eq("id", eventId)
            );
        }
      });
    }

    return NextResponse.json({ photos: saved, count: saved.length });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
