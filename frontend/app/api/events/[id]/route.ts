import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";
import type { DbEvent } from "@/lib/supabase";

function toStoredEvent(e: DbEvent) {
  return {
    _id: e.id,
    name: e.name,
    date: e.date,
    code: e.code,
    photographerId: e.photographer_id,
    photoCount: e.photo_count,
    searchCount: e.search_count,
    downloadCount: e.download_count,
    createdAt: e.created_at,
    driveFolderUrl: e.drive_folder_url ?? "",
    driveFolderId: e.drive_folder_id ?? "",
    driveFolderName: e.drive_folder_name ?? "",
    driveSyncedAt: e.drive_synced_at ?? "",
    album: {
      enabled: (e as unknown as Record<string, unknown>).album_enabled,
      title: (e as unknown as Record<string, unknown>).album_title ?? e.name,
      subtitle: (e as unknown as Record<string, unknown>).album_subtitle ?? "A curated flipbook album your photographer can share with one beautiful link.",
      theme: (e as unknown as Record<string, unknown>).album_theme ?? "rose",
      coverPhotoId: (e as unknown as Record<string, unknown>).album_cover_photo_id ?? null,
    },
  };
}

/** Fetch event and verify the caller owns it (or is admin). */
async function getOwnedEvent(id: string, userId: string, role: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return { error: "Event not found", status: 404 as const };

  if (role !== "admin" && (data as DbEvent).photographer_id !== userId) {
    return { error: "Access denied", status: 403 as const };
  }

  return { event: data as DbEvent };
}

// GET /api/events/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { event, error, status } = await getOwnedEvent(params.id, user.id, user.role);
    if (error) return NextResponse.json({ message: error }, { status });

    return NextResponse.json(toStoredEvent(event!));
  } catch (err) {
    console.error("[GET /api/events/[id]]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PATCH /api/events/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { error: ownerErr, status: ownerStatus } = await getOwnedEvent(params.id, user.id, user.role);
    if (ownerErr) return NextResponse.json({ message: ownerErr }, { status: ownerStatus });

    const body = await req.json();

    // Map frontend camelCase fields to DB snake_case
    const updates: Record<string, unknown> = {};
    if (body.name            !== undefined) updates.name              = body.name;
    if (body.date            !== undefined) updates.date              = body.date;
    if (body.photoCount      !== undefined) updates.photo_count       = body.photoCount;
    if (body.searchCount     !== undefined) updates.search_count      = body.searchCount;
    if (body.downloadCount   !== undefined) updates.download_count    = body.downloadCount;
    if (body.driveFolderUrl  !== undefined) updates.drive_folder_url  = body.driveFolderUrl;
    if (body.driveFolderId   !== undefined) updates.drive_folder_id   = body.driveFolderId;
    if (body.driveFolderName !== undefined) updates.drive_folder_name = body.driveFolderName;
    if (body.driveSyncedAt   !== undefined) updates.drive_synced_at   = body.driveSyncedAt;
    if (body.album) {
      if (body.album.enabled      !== undefined) updates.album_enabled        = body.album.enabled;
      if (body.album.title        !== undefined) updates.album_title          = body.album.title;
      if (body.album.subtitle     !== undefined) updates.album_subtitle       = body.album.subtitle;
      if (body.album.theme        !== undefined) updates.album_theme          = body.album.theme;
      if (body.album.coverPhotoId !== undefined) updates.album_cover_photo_id = body.album.coverPhotoId;
    }

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error || !data) return NextResponse.json({ message: "Event not found" }, { status: 404 });

    return NextResponse.json(toStoredEvent(data as DbEvent));
  } catch (err) {
    console.error("[PATCH /api/events/[id]]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { error: ownerErr, status: ownerStatus } = await getOwnedEvent(params.id, user.id, user.role);
    if (ownerErr) return NextResponse.json({ message: ownerErr }, { status: ownerStatus });

    const { error } = await supabase.from("events").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
