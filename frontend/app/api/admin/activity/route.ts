import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get photo activity (views/downloads) - limit to recent 10
    const { data: photoViews, error: viewsError } = await supabase
      .from("photos")
      .select(`
        id,
        filename,
        view_count,
        download_count,
        updated_at,
        events!inner(name)
      `)
      .gt("view_count", 0)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (viewsError) {
      console.error("[GET /api/admin/activity] Views error:", viewsError);
    }

    const views = (photoViews ?? []).map((v) => ({
      photo_id: v.id,
      photo_name: v.filename || "Unknown",
      view_count: v.view_count || 0,
      download_count: v.download_count || 0,
      last_viewed_at: v.updated_at,
      events: Array.isArray(v.events) ? v.events[0] : v.events,
    }));

    return NextResponse.json({ views });
  } catch (err) {
    console.error("[GET /api/admin/activity]", err);
    return NextResponse.json({ views: [] }, { status: 500 });
  }
}
