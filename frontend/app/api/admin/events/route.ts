import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching completely

/**
 * GET /api/admin/events - Get all events with photographer details
 */
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get fresh Supabase client
    const supabase = getSupabaseClient();

    // Fetch events
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventsError) throw eventsError;

    // Fetch photographer details
    const photographerIds = Array.from(
      new Set(eventsData?.map(e => e.photographer_id).filter(Boolean) ?? [])
    );
    
    let photographers: any[] = [];
    if (photographerIds.length > 0) {
      const { data: photographersData } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", photographerIds);
      photographers = photographersData ?? [];
    }

    const pgMap = Object.fromEntries(photographers.map(p => [p.id, p]));

    const enriched = (eventsData ?? []).map(e => ({
      _id: e.id,
      name: e.name,
      date: e.date,
      code: e.code,
      isActive: e.is_active,
      photoCount: e.photo_count,
      searchCount: e.search_count,
      downloadCount: e.download_count,
      createdAt: e.created_at,
      photographer: pgMap[e.photographer_id] ?? null,
    }));

    return NextResponse.json({ events: enriched, total: enriched.length });
  } catch (err) {
    console.error("GET /api/admin/events error:", err);
    return NextResponse.json(
      { 
        message: err instanceof Error ? err.message : "Failed to load events",
        events: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
