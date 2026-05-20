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

function generateCode(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const num  = Math.floor(Math.random() * 900 + 100);
  return `${base}${num}`;
}

// GET /api/events?limit=50
// ── Each photographer only sees their OWN events ──────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");

    // Admin sees all; photographer sees only their own
    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (user.role !== "admin") {
      query = query.eq("photographer_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ events: (data as DbEvent[]).map(toStoredEvent) });
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ message: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events — create event scoped to the logged-in photographer
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, date } = body as { name: string; date: string };

    if (!name || !date) {
      return NextResponse.json({ message: "Name and date are required" }, { status: 400 });
    }

    // Always assign to the logged-in photographer (admin can override via body)
    const photogId = user.role === "admin" && body.photographerId
      ? body.photographerId
      : user.id;

    // Generate unique code
    let code = generateCode(name);
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      if (!existing) break;
      code = generateCode(name);
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        name,
        date,
        code,
        photographer_id: photogId,
        album_title: name,
        album_subtitle: "A curated flipbook album your photographer can share with one beautiful link.",
        album_theme: "rose",
        album_enabled: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(toStoredEvent(data as DbEvent), { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ message: "Failed to create event" }, { status: 500 });
  }
}
