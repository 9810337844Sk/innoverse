import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DbEvent } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // fetch photographer names in one query
    const photographerIds = [...new Set((events as DbEvent[]).map(e => e.photographer_id).filter(Boolean))];
    const { data: photographers } = photographerIds.length
      ? await supabase.from("users").select("id, name, email").in("id", photographerIds)
      : { data: [] };

    const pgMap = Object.fromEntries((photographers ?? []).map(p => [p.id, p]));

    const enriched = (events as DbEvent[]).map(e => ({
      _id:           e.id,
      name:          e.name,
      date:          e.date,
      code:          e.code,
      isActive:      e.is_active,
      photoCount:    e.photo_count,
      searchCount:   e.search_count,
      downloadCount: e.download_count,
      createdAt:     e.created_at,
      photographer:  pgMap[e.photographer_id] ?? null,
    }));

    return NextResponse.json({ events: enriched });
  } catch (err) {
    console.error("[GET /api/admin/events]", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

// PATCH /api/admin/events — toggle isActive
export async function PATCH(req: NextRequest) {
  try {
    const { id, isActive } = await req.json();
    const { error } = await supabase.from("events").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error("[PATCH /api/admin/events]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
