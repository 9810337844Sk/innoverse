import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);

    // Build query — filter by photographer if we know who's logged in
    let query = supabase
      .from("events")
      .select("photo_count, search_count, download_count");

    if (user?.id) {
      query = query.eq("photographer_id", user.id);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    // Real photo count from the photos table for this photographer's events
    let realPhotoCount = 0;
    if (user?.id) {
      // Get event IDs for this photographer
      const { data: evIds } = await supabase
        .from("events")
        .select("id")
        .eq("photographer_id", user.id);

      if (evIds && evIds.length > 0) {
        const ids = evIds.map(e => e.id);
        const { count } = await supabase
          .from("photos")
          .select("id", { count: "exact", head: true })
          .in("event_id", ids);
        realPhotoCount = count ?? 0;
      }
    }

    const totalSearches  = events.reduce((s, e) => s + (e.search_count   ?? 0), 0);
    const totalDownloads = events.reduce((s, e) => s + (e.download_count ?? 0), 0);
    const totalEvents    = events.length;
    // Use real photo count if available, otherwise fall back to sum of photo_count columns
    const totalPhotos    = realPhotoCount > 0
      ? realPhotoCount
      : events.reduce((s, e) => s + (e.photo_count ?? 0), 0);

    return NextResponse.json({ totalPhotos, totalEvents, totalSearches, totalDownloads });
  } catch (err) {
    console.error("[GET /api/photographer/stats]", err);
    return NextResponse.json(
      { totalPhotos: 0, totalEvents: 0, totalSearches: 0, totalDownloads: 0 },
      { status: 500 }
    );
  }
}
