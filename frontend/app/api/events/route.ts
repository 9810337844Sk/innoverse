import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";
import type { DbEvent } from "@/lib/supabase";

function toStoredEvent(e: DbEvent) {
  const ext = e as unknown as Record<string, unknown>;
  return {
    _id:           e.id,
    name:          e.name,
    date:          e.date,
    code:          e.code,
    photographerId: e.photographer_id,
    photoCount:    e.photo_count,
    searchCount:   e.search_count,
    downloadCount: e.download_count,
    createdAt:     e.created_at,
    driveFolderUrl:  e.drive_folder_url  ?? "",
    driveFolderId:   e.drive_folder_id   ?? "",
    driveFolderName: e.drive_folder_name ?? "",
    driveSyncedAt:   e.drive_synced_at   ?? "",
    album: {
      enabled:      ext.album_enabled      ?? true,
      title:        ext.album_title        ?? e.name,
      subtitle:     ext.album_subtitle     ?? "A curated flipbook album your photographer can share with one beautiful link.",
      theme:        ext.album_theme        ?? "rose",
      coverPhotoId: ext.album_cover_photo_id ?? null,
    },
  };
}

function generateCode(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6).padStart(3, "X");
  const num  = Math.floor(Math.random() * 9000 + 1000);
  return `${base}${num}`;
}

// GET /api/events?limit=50
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized — please log in" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (user.role !== "admin") {
      query = query.eq("photographer_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GET /api/events] Supabase:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: (data as DbEvent[]).map(toStoredEvent) });
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ message: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events — create event
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized — session expired, please log in again" }, { status: 401 });
    }
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json(
        { message: `Your account role is "${user.role}". Only photographers can create events. Please register a new account as a Photographer.` },
        { status: 403 }
      );
    }

    let body: { name?: unknown; date?: unknown; photographerId?: unknown };
    try {
      body = await req.json() as typeof body;
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";

    if (!name) return NextResponse.json({ message: "Event name is required" }, { status: 400 });
    if (!date) return NextResponse.json({ message: "Event date is required" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: "Date must be in YYYY-MM-DD format" }, { status: 400 });
    }

    const photogId = user.role === "admin" && typeof body.photographerId === "string"
      ? body.photographerId
      : user.id;

    // Generate a unique event code (retry up to 5 times on collision)
    let code = generateCode(name);
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("events").select("id").eq("code", code).maybeSingle();
      if (!existing) break;
      code = generateCode(name);
    }

    const { data, error } = await supabase
      .from("events")
      .insert({ name, date, code, photographer_id: photogId })
      .select("*")
      .single();

    if (error) {
      console.error("[POST /api/events] Supabase insert error:", error);
      return NextResponse.json({ message: error.message ?? "Database error creating event" }, { status: 500 });
    }

    console.log("✓ Event created successfully:", { id: data.id, name: data.name, code: data.code });

    return NextResponse.json({
      ...toStoredEvent(data as DbEvent),
      triggerAdminRefresh: true  // Signal to trigger admin events refresh
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events] Unexpected:", err);
    const msg = err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
