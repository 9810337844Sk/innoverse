/**
 * POST /api/upload
 *
 * Accepts multipart/form-data:
 *   eventId   — Supabase event UUID
 *   eventCode — used in Cloudinary folder path
 *   eventName — human-readable fallback
 *   photos    — one or more image files (keep batches ≤ 3 from the client)
 *
 * Uploads all files to Cloudinary IN PARALLEL, inserts rows into Supabase,
 * and returns partial results — successfully uploaded photos are returned even
 * if some files in the batch fail.
 */
import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";
import type { DbEvent } from "@/lib/supabase";

export const maxDuration = 60;

type SavedPhoto = {
  _id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
};

type FailedPhoto = {
  name: string;
  error: string;
};

async function insertPhotoRow(input: {
  eventId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
}): Promise<{ id: string }> {
  const row = {
    event_id:             input.eventId,
    url:                  input.url,
    thumbnail_url:        input.thumbnailUrl,
    name:                 input.name,
    cloudinary_public_id: input.cloudinaryPublicId,
    saved_at:             new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("photos")
    .insert(row)
    .select("id")
    .single();

  if (!error) return data as { id: string };

  // If the error is a duplicate cloudinary_public_id, skip gracefully
  if (error.message.toLowerCase().includes("cloudinary_public_id")) {
    const { data: existing } = await supabase
      .from("photos")
      .select("id")
      .eq("event_id", input.eventId)
      .eq("cloudinary_public_id", input.cloudinaryPublicId)
      .single();
    if (existing) return existing as { id: string };
  }

  throw error;
}

async function uploadSingleFile(
  file: File,
  index: number,
  folder: string,
  eventId: string,
): Promise<SavedPhoto> {
  const bytes    = await file.arrayBuffer();
  const buffer   = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const publicId = `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}_${safeName.replace(/\.[^.]+$/, "")}`;

  const { url, thumbnailUrl, publicId: fullPublicId } =
    await uploadToCloudinary(buffer, publicId, folder);

  try {
    const row = await insertPhotoRow({
      eventId,
      url,
      thumbnailUrl,
      name: file.name,
      cloudinaryPublicId: fullPublicId,
    });

    return {
      _id:                row.id,
      url,
      thumbnailUrl,
      name:               file.name,
      cloudinaryPublicId: fullPublicId,
    };
  } catch (dbError) {
    // Rollback Cloudinary asset so we don't leave orphans
    await deleteFromCloudinary(fullPublicId).catch((e) =>
      console.warn("[upload] Cloudinary rollback failed:", e)
    );
    throw dbError;
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData  = await req.formData();
    const eventId   = formData.get("eventId")   as string | null;
    const eventCode = formData.get("eventCode") as string | null;
    const eventName = formData.get("eventName") as string | null;
    const files     = formData.getAll("photos") as File[];

    if (!eventId || !files.length) {
      return NextResponse.json(
        { error: "eventId and at least one photo are required" },
        { status: 400 },
      );
    }

    // Filter out non-file or empty entries
    const validFiles = files.filter((f) => f instanceof File && f.size > 0);
    if (!validFiles.length) {
      return NextResponse.json({ error: "No valid image files received" }, { status: 400 });
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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ── Cloudinary folder (per-photographer isolation) ──────────────────────
    const folderSlug = (eventCode ?? eventName ?? eventId)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toUpperCase();
    const folder = `photofly/photographers/${user.id}/events/${folderSlug}`;

    // ── Upload all files in parallel, collect partial results ───────────────
    const results = await Promise.allSettled(
      validFiles.map((file, i) => uploadSingleFile(file, i, folder, eventId)),
    );

    const saved: SavedPhoto[]  = [];
    const failed: FailedPhoto[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        saved.push(result.value);
      } else {
        const reason = result.reason;
        failed.push({
          name:  validFiles[i].name,
          error: reason instanceof Error ? reason.message : "Upload failed",
        });
        console.error(`[upload] File "${validFiles[i].name}" failed:`, reason);
      }
    });

    // ── Increment event photo_count for successfully saved photos ───────────
    if (saved.length > 0) {
      const { error: rpcErr } = await supabase
        .rpc("increment_photo_count", { p_event_id: eventId, p_amount: saved.length });
      if (rpcErr) {
        const { data: ev } = await supabase
          .from("events").select("photo_count").eq("id", eventId).single();
        await supabase
          .from("events")
          .update({ photo_count: ((ev as { photo_count?: number } | null)?.photo_count ?? 0) + saved.length })
          .eq("id", eventId);
      }
    }

    // Return 207 Multi-Status if there were partial failures so the client
    // knows some files succeeded and some didn't.
    const status = failed.length > 0 && saved.length === 0 ? 500
                 : failed.length > 0                        ? 207
                 : 200;

    return NextResponse.json({ photos: saved, failed, count: saved.length }, { status });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
