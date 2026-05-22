import { NextRequest, NextResponse } from "next/server";
import { getDriveClient, listDriveImages, parseDriveId } from "@/lib/drive";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";
import type { DbEvent, DbPhoto } from "@/lib/supabase";

export const maxDuration = 300;

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

async function insertPhoto(input: {
  eventId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  cloudinaryPublicId: string;
}) {
  const existing = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", input.eventId)
    .eq("cloudinary_public_id", input.cloudinaryPublicId)
    .maybeSingle();

  if (!existing.error && existing.data) return toStoredPhoto(existing.data as DbPhoto);

  const inserted = await supabase
    .from("photos")
    .insert({
      event_id:             input.eventId,
      url:                  input.url,
      thumbnail_url:        input.thumbnailUrl,
      name:                 input.name,
      cloudinary_public_id: input.cloudinaryPublicId,
      saved_at:             new Date().toISOString(),
      tags:                 ["drive"],
    })
    .select("*")
    .single();

  if (inserted.error) throw inserted.error;
  return toStoredPhoto(inserted.data as DbPhoto);
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
      return NextResponse.json({ error: "Paste a valid Google Drive folder or image URL" }, { status: 400 });
    }

    const { event, error, status } = await verifyEvent(body.eventId, user.id, user.role);
    if (error) return NextResponse.json({ error }, { status });

    const { folderId, folderName, photos: drivePhotos } = await listDriveImages(req, inputId);
    if (!drivePhotos.length) {
      return NextResponse.json({ photos: [], total: 0, folderId, folderName, message: "No images found in this Drive URL" });
    }

    const drive = await getDriveClient(req);
    const eventCode = body.eventCode || event!.code;
    const folderSlug = eventCode.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase();
    const cloudinaryFolder = `photofly/photographers/${event!.photographer_id}/events/${folderSlug}`;
    const saved: StoredPhoto[] = [];

    for (const photo of drivePhotos) {
      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const publicId = `drive_${photo.id}_${safeName.replace(/\.[^.]+$/, "")}`;
      const fullPublicId = `${cloudinaryFolder}/${publicId}`;

      const existing = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", body.eventId)
        .eq("cloudinary_public_id", fullPublicId)
        .maybeSingle();

      if (!existing.error && existing.data) {
        saved.push(toStoredPhoto(existing.data as DbPhoto));
        continue;
      }

      const file = await drive.files.get(
        { fileId: photo.id, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" }
      );

      const { url, thumbnailUrl, publicId: uploadedPublicId } = await uploadToCloudinary(
        Buffer.from(file.data as ArrayBuffer),
        publicId,
        cloudinaryFolder
      );

      try {
        saved.push(await insertPhoto({
          eventId: body.eventId,
          url,
          thumbnailUrl,
          name: photo.name,
          cloudinaryPublicId: uploadedPublicId,
        }));
      } catch (insertError) {
        await deleteFromCloudinary(uploadedPublicId).catch(() => undefined);
        throw insertError;
      }
    }

    const { count } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", body.eventId);

    await supabase
      .from("events")
      .update({
        drive_folder_url:  body.folderUrl || inputId,
        drive_folder_id:   folderId,
        drive_folder_name: folderName,
        drive_synced_at:   new Date().toISOString(),
        photo_count:       count ?? saved.length,
      })
      .eq("id", body.eventId);

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
