/**
 * GET /api/photos/public/[eventId]
 * Public endpoint — no auth required.
 * Used by the /find page so guests can load event photos for face matching.
 * Only returns URL and thumbnail — no sensitive metadata.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DbPhoto } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type LegacyPhoto = {
  _id?: string;
  url?: string;
  thumbnailUrl?: string;
  name?: string;
  facesCount?: number;
  tags?: string[];
  indexed?: boolean;
  savedAt?: string;
};

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  created_at?: string;
};

function toEventFolder(photographerId: string, eventCode: string) {
  const folderSlug = eventCode.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase();
  return `photofly/photographers/${photographerId}/events/${folderSlug}`;
}

async function readCloudinaryPhotos(photographerId: string, eventCode: string) {
  const { cloudinary } = await import("@/lib/cloudinary");
  const folder = toEventFolder(photographerId, eventCode);
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: `${folder}/`,
      max_results: 500,
      next_cursor: nextCursor,
    });

    resources.push(...((result.resources ?? []) as CloudinaryResource[]));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources.map(resource => {
    const name = resource.public_id.split("/").pop() ?? resource.public_id;

    return {
      _id:          `cloudinary_${resource.public_id}`,
      url:          resource.secure_url,
      thumbnailUrl: cloudinary.url(resource.public_id, {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
        secure: true,
      }),
      name,
      facesCount:   0,
      tags:         [],
      indexed:      false,
      savedAt:      resource.created_at ?? new Date().toISOString(),
    };
  });
}

async function readLegacyPhotos(eventId: string) {
  const candidates = [
    path.join(process.cwd(), "public", "data", `photos_${eventId}.json`),
    path.join(process.cwd(), "frontend", "public", "data", `photos_${eventId}.json`),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const photos = JSON.parse(raw) as LegacyPhoto[];
      return photos.map((p, index) => ({
        _id:          p._id ?? `legacy_${eventId}_${index}`,
        url:          p.url ?? "",
        thumbnailUrl: p.thumbnailUrl ?? p.url ?? "",
        name:         p.name ?? "",
        facesCount:   p.facesCount ?? 0,
        tags:         p.tags ?? [],
        indexed:      p.indexed ?? false,
        savedAt:      p.savedAt ?? new Date().toISOString(),
      })).filter(p => p.url);
    } catch {
      // Try the next possible project root.
    }
  }

  return [];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Verify the event exists and is active before returning photos
    const { data: event, error: evErr } = await supabase
      .from("events")
      .select("id, is_active, code, photographer_id")
      .eq("id", params.eventId)
      .eq("is_active", true)
      .single();

    if (evErr || !event) {
      const legacyPhotos = await readLegacyPhotos(params.eventId);
      if (legacyPhotos.length) return NextResponse.json({ photos: legacyPhotos });

      return NextResponse.json({ photos: [] }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("photos")
      .select("id, url, thumbnail_url, name, faces_count, tags, indexed, saved_at")
      .eq("event_id", params.eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const photos = (data as DbPhoto[]).map(p => ({
      _id:          p.id,
      url:          p.url,
      thumbnailUrl: p.thumbnail_url ?? p.url,
      name:         p.name ?? "",
      facesCount:   p.faces_count,
      tags:         p.tags ?? [],
      indexed:      p.indexed,
      savedAt:      p.saved_at,
    }));

    if (photos.length) return NextResponse.json({ photos });

    const cloudinaryPhotos = await readCloudinaryPhotos(event.photographer_id, event.code);
    if (cloudinaryPhotos.length) return NextResponse.json({ photos: cloudinaryPhotos });

    return NextResponse.json({ photos: await readLegacyPhotos(params.eventId) });
  } catch (err) {
    console.error("[GET /api/photos/public/[eventId]]", err);
    const legacyPhotos = await readLegacyPhotos(params.eventId);
    return NextResponse.json({ photos: legacyPhotos }, { status: legacyPhotos.length ? 200 : 500 });
  }
}
