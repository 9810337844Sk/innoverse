/**
 * GET /api/events/public/[code]
 * Public endpoint — no auth required.
 * Used by the /find page so guests can look up an event by its code.
 * Only returns non-sensitive fields (name, date, code, id).
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type LegacyEvent = {
  _id: string;
  name: string;
  date: string;
  code: string;
  photoCount?: number;
};

async function readLegacyEvent(code: string) {
  const candidates = [
    path.join(process.cwd(), "public", "data", "events.json"),
    path.join(process.cwd(), "frontend", "public", "data", "events.json"),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const events = JSON.parse(raw) as LegacyEvent[];
      const event = events.find(e => e.code?.toUpperCase() === code.toUpperCase());
      if (!event) continue;

      return {
        _id:        event._id,
        name:       event.name,
        date:       event.date,
        code:       event.code,
        photoCount: event.photoCount ?? 0,
      };
    } catch {
      // Try the next possible project root.
    }
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, name, date, code, photo_count, is_active")
      .eq("code", params.code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      const legacyEvent = await readLegacyEvent(params.code);
      if (legacyEvent) return NextResponse.json(legacyEvent);

      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id:        data.id,
      name:       data.name,
      date:       data.date,
      code:       data.code,
      photoCount: data.photo_count,
    });
  } catch (err) {
    console.error("[GET /api/events/public/[code]]", err);
    const legacyEvent = await readLegacyEvent(params.code);
    if (legacyEvent) return NextResponse.json(legacyEvent);

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
