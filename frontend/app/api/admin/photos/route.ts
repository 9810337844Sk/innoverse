import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, url, name, event_id, faces_count, indexed, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    // fetch event names
    const eventIds = Array.from(new Set((photos ?? []).map(p => p.event_id).filter(Boolean)));
    const { data: events } = eventIds.length
      ? await supabase.from("events").select("id, name").in("id", eventIds)
      : { data: [] };

    const evMap = Object.fromEntries((events ?? []).map(e => [e.id, e.name]));

    const enriched = (photos ?? []).map(p => ({
      id:         p.id,
      url:        p.url,
      name:       p.name,
      eventId:    p.event_id,
      eventName:  evMap[p.event_id] ?? "Unknown Event",
      facesCount: p.faces_count ?? 0,
      indexed:    p.indexed ?? false,
      createdAt:  p.created_at,
    }));

    return NextResponse.json({ photos: enriched });
  } catch (err) {
    console.error("[GET /api/admin/photos]", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
