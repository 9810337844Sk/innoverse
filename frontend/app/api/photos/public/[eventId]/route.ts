/**
 * GET /api/photos/public/[eventId]
 * Public endpoint — no auth required.
 * Used by the /find page so guests can load event photos for face matching.
 * Only returns URL and thumbnail — no sensitive metadata.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DbPhoto } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Verify the event exists and is active before returning photos
    const { data: event, error: evErr } = await supabase
      .from("events")
      .select("id, is_active")
      .eq("id", params.eventId)
      .eq("is_active", true)
      .single();

    if (evErr || !event) {
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

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[GET /api/photos/public/[eventId]]", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
