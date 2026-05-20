/**
 * GET /api/events/public/[code]
 * Public endpoint — no auth required.
 * Used by the /find page so guests can look up an event by its code.
 * Only returns non-sensitive fields (name, date, code, id).
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
