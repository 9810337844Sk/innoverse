import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

// PATCH /api/admin/users/[id]  — ban/unban
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.banned !== undefined) updates.banned = body.banned;
    if (body.role   !== undefined) updates.role   = body.role;
    if (body.plan   !== undefined) updates.plan   = body.plan;

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Done" });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
