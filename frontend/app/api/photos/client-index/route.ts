/**
 * POST /api/photos/client-index
 *
 * Saves pre-computed 128-dim face-api.js descriptors (from browser-side
 * offline indexing) to photos.faces_client in Supabase.
 *
 * Body: { eventId: string, photos: { id: string, descriptors: number[][] }[] }
 *
 * Once stored, /api/photos/descriptors/[eventId] serves these back so
 * the find page can do instant vector comparison without loading images.
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";
import type { DbEvent } from "@/lib/supabase";

export const runtime  = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    eventId: string;
    photos: { id: string; descriptors: number[][] }[];
  };

  if (!body.eventId || !Array.isArray(body.photos)) {
    return NextResponse.json({ error: "eventId and photos[] required" }, { status: 400 });
  }

  // Verify event ownership
  const { data: event } = await supabase
    .from("events")
    .select("photographer_id")
    .eq("id", body.eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (user.role !== "admin" && (event as DbEvent).photographer_id !== user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Batch update — run in parallel with a small concurrency cap
  const BATCH = 10;
  let saved = 0;
  let failed = 0;

  for (let i = 0; i < body.photos.length; i += BATCH) {
    const chunk = body.photos.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      chunk.map((p) =>
        supabase
          .from("photos")
          .update({
            faces_client: p.descriptors,
            indexed:      true,
            faces_count:  p.descriptors.length,
          })
          .eq("id", p.id)
          .eq("event_id", body.eventId),
      ),
    );
    results.forEach((r) => {
      if (r.status === "fulfilled" && !r.value.error) saved++;
      else failed++;
    });
  }

  return NextResponse.json({ saved, failed, total: body.photos.length });
}
