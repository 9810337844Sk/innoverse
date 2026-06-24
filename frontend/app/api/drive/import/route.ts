import { NextRequest, NextResponse } from "next/server";
import { listDriveImages, parseDriveId } from "@/lib/drive";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";
import type { DbEvent, DbPhoto } from "@/lib/supabase";

export const maxDuration = 60; // Vercel Pro cap — large folders may need multiple syncs

type StoredPhoto = {
  _id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
  facesCount: number;
  tags: string[];
  indexed: boolean;
  savedAt: string;
};

function toStoredPhoto(p: DbPhoto): StoredPhoto {
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

function getRefreshToken(req: NextRequest): string | null {
  try {
    const val = req.cookies.get("drive_tokens")?.value;
    if (!val) return null;
    const tokens = JSON.parse(Buffer.from(val, "base64url").toString("utf8")) as {
      refresh_token?: string;
    };
    return tokens.refresh_token ?? null;
  } catch {
    return null;
  }
}

async function verifyEvent(eventId: string, userId: string, role: string) {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, code, photographer_id")
    .eq("id", eventId)
    .single();

  if (error || !data) return { error: "Event not found", status: 404 as const };
  if (role !== "admin" && (data as DbEvent).photographer_id !== userId) {
    return { error: "Access denied", status: 403 as const };
  }

  return { event: data as DbEvent };
}

async function upsertDrivePhoto(input: {
  eventId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  driveKey: string;
}): Promise<StoredPhoto> {
  const { data: existing } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", input.eventId)
    .eq("cloudinary_public_id", input.driveKey)
    .maybeSingle();

  if (existing) return toStoredPhoto(existing as DbPhoto);

  const { data: inserted, error } = await supabase
    .from("photos")
    .insert({
      event_id:             input.eventId,
      url:                  input.url,
      thumbnail_url:        input.thumbnailUrl,
      name:                 input.name,
      cloudinary_public_id: input.driveKey,
      saved_at:             new Date().toISOString(),
      tags:                 ["drive"],
    })
    .select("*")
    .single();

  if (error) throw error;
  return toStoredPhoto(inserted as DbPhoto);
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as {
      eventId?: string;
      eventCode?: string;
      eventName?: string;
      folderUrl?: string;
      folderId?: string;
    };

    if (!body.eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const inputId = body.folderId || parseDriveId(body.folderUrl || "");
    if (!inputId) {
      return NextResponse.json(
        { error: "Paste a valid Google Drive folder or image URL" },
        { status: 400 },
      );
    }

    const { event, error, status } = await verifyEvent(body.eventId, user.id, user.role);
    if (error) return NextResponse.json({ error }, { status });

    const { folderId, folderName, photos: drivePhotos } = await listDriveImages(req, inputId);
    if (!drivePhotos.length) {
      return NextResponse.json({
        photos: [], total: 0, folderId, folderName,
        message: "No images found in this Drive URL",
      });
    }

    const refreshToken = getRefreshToken(req);
    const saved: StoredPhoto[] = [];

    for (const photo of drivePhotos) {
      const driveKey  = `drive:${photo.id}`;
      const proxyUrl  = `/api/drive/image?fileId=${photo.id}&eventId=${body.eventId}`;
      const thumbUrl  = photo.thumbnailLink || proxyUrl;

      saved.push(await upsertDrivePhoto({
        eventId:      body.eventId,
        url:          proxyUrl,
        thumbnailUrl: thumbUrl,
        name:         photo.name,
        driveKey,
      }));
    }

    const { count } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", body.eventId);

    await supabase
      .from("events")
      .update({
        drive_folder_url:    body.folderUrl || inputId,
        drive_folder_id:     folderId,
        drive_folder_name:   folderName,
        drive_synced_at:     new Date().toISOString(),
        photo_count:         count ?? saved.length,
        ...(refreshToken ? { drive_refresh_token: refreshToken } : {}),
      })
      .eq("id", body.eventId);

    void event; // used for auth check, not needed beyond that
    return NextResponse.json({ photos: saved, total: saved.length, folderId, folderName });
  } catch (err) {
    console.error("[POST /api/drive/import]", err);
    const msg = err instanceof Error ? err.message : "Drive import failed";
    if (msg.includes("drive_tokens") || msg.includes("invalid_grant")) {
      return NextResponse.json({ error: "not_connected", photos: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, photos: [] }, { status: 500 });
  }
}
