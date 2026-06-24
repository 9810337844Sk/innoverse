import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/events/[id] - Update event (e.g., toggle is_active)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const eventId = params.id;
    const body = await req.json();
    
    // Only allow updating specific fields
    const allowedFields: Record<string, any> = {};
    if (body.is_active !== undefined) allowedFields.is_active = body.is_active;
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.description !== undefined) allowedFields.description = body.description;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    allowedFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(allowedFields)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      message: "Event updated successfully",
      event: {
        _id: data.id,
        name: data.name,
        date: data.date,
        code: data.code,
        isActive: data.is_active,
        photoCount: data.photo_count,
        searchCount: data.search_count,
        downloadCount: data.download_count,
        createdAt: data.created_at,
      }
    });
  } catch (err) {
    console.error("PATCH /api/admin/events/[id] error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update event" },
      { status: 500 }
    );
  }
}
