/**
 * GET  /api/photos/[eventId]  — list all photos for an event
 * POST /api/photos/[eventId]  — delete or update a photo
 *
 * Ownership: a photographer can only access photos from their own events.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import type { DbPhoto, DbEvent } from "@/lib/supabase";

function toStoredPhoto(p: DbPhoto) {
  return {
    _id:                p.id,
    url:                p.url,
    thumbnailUrl:       p.thumbnail_url ?? p.url,
    name:               p.name ?? "",
    cloudinaryPublicId: p.cloudinary_public_id ?? "",
    facesCount:         p.faces_count,
    tags:               p.tags ?? [],
    indexed:            p.indexed,
    savedAt:            p.saved_at,
  };
}

/** Verify the caller owns the event (or is admin). Returns the event or an error. */
async function verifyEventOwnership(eventId: string, userId: string, role: string) {
  const { data, error } = await supabase
    .from("events")
    .select("id, photographer_id")
    .eq("id", eventId)
    .single();

  if (error || !data) return { error: "Event not found", status: 404 as const };

  if (role !== "admin" && (data as DbEvent).photographer_id !== userId) {
    return { error: "Access denied — this event belongs to another photographer", status: 403 as const };
  }

  return { ok: true };
}

// GET /api/photos/[eventId]
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ photos: [] }, { status: 401 });

    const { error: ownerErr, status: ownerStatus } = await verifyEventOwnership(
      params.eventId, user.id, user.role
    );
    if (ownerErr) return NextResponse.json({ message: ownerErr }, { status: ownerStatus });

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", params.eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ photos: (data as DbPhoto[]).map(toStoredPhoto) });
  } catch (err) {
    console.error("[GET /api/photos/[eventId]]", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}

// POST /api/photos/[eventId]  body: { action: "delete"|"update"|"upsert", photoId, patch?, photo? }
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error: ownerErr, status: ownerStatus } = await verifyEventOwnership(
      params.eventId, user.id, user.role
    );
    if (ownerErr) return NextResponse.json({ message: ownerErr }, { status: ownerStatus });

    const body = await req.json() as {
      action: string;
      photoId: string;
      patch?: Record<string, unknown>;
      photo?: {
        url?: string;
        thumbnailUrl?: string;
        name?: string;
        facesCount?: number;
        tags?: string[];
        indexed?: boolean;
        savedAt?: string;
      };
    };

    if (body.action === "upsert" && body.photo?.url) {
      const photo = body.photo;
      const existing = await supabase
        .from("photos")
        .select("id")
        .eq("event_id", params.eventId)
        .eq("url", photo.url)
        .maybeSingle();

      if (existing.error) throw existing.error;

      if (existing.data?.id) {
        const { data, error } = await supabase
          .from("photos")
          .update({
            thumbnail_url: photo.thumbnailUrl ?? photo.url,
            name:          photo.name ?? "",
            faces_count:   photo.facesCount ?? 0,
            tags:          photo.tags ?? [],
            indexed:       photo.indexed ?? false,
            saved_at:      photo.savedAt ?? new Date().toISOString(),
          })
          .eq("id", existing.data.id)
          .select("*")
          .single();

        if (error) throw error;
        return NextResponse.json({ photo: toStoredPhoto(data as DbPhoto) });
      }

      const { data, error } = await supabase
        .from("photos")
        .insert({
          event_id:      params.eventId,
          url:           photo.url,
          thumbnail_url: photo.thumbnailUrl ?? photo.url,
          name:          photo.name ?? "",
          faces_count:   photo.facesCount ?? 0,
          tags:          photo.tags ?? [],
          indexed:       photo.indexed ?? false,
          saved_at:      photo.savedAt ?? new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;

      await supabase.rpc("increment_photo_count", {
        p_event_id: params.eventId,
        p_amount:   1,
      });

      return NextResponse.json({ photo: toStoredPhoto(data as DbPhoto) });
    }

    if (body.action === "update" && body.photoId) {
      const patch = body.patch as { faces_count?: number; tags?: string[]; indexed?: boolean };
      const { error } = await supabase
        .from("photos")
        .update(patch)
        .eq("id", body.photoId)
        .eq("event_id", params.eventId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete" && body.photoId) {
      // Fetch the photo to get its Cloudinary public_id
      const { data: photo } = await supabase
        .from("photos")
        .select("cloudinary_public_id")
        .eq("id", body.photoId)
        .eq("event_id", params.eventId)   // extra safety: must belong to this event
        .single();

      // Delete from Cloudinary (best-effort)
      if (photo?.cloudinary_public_id) {
        await deleteFromCloudinary(photo.cloudinary_public_id).catch(e =>
          console.warn("[delete] Cloudinary removal failed:", e)
        );
      }

      // Delete from Supabase
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", body.photoId)
        .eq("event_id", params.eventId);

      if (error) throw error;

      // Decrement photo_count on the event
      await supabase
        .from("events")
        .select("photo_count")
        .eq("id", params.eventId)
        .single()
        .then(({ data }) =>
          supabase
            .from("events")
            .update({ photo_count: Math.max((data?.photo_count ?? 1) - 1, 0) })
            .eq("id", params.eventId)
        );

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/photos/[eventId]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
