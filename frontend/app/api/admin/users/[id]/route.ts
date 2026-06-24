import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/users/[id] - Update user (role, plan, banned status)
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

    const userId = params.id;
    const body = await req.json();
    
    // Only allow updating specific fields
    const allowedFields: Record<string, any> = {};
    if (body.role !== undefined) allowedFields.role = body.role;
    if (body.plan !== undefined) allowedFields.plan = body.plan;
    if (body.banned !== undefined) allowedFields.banned = body.banned;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update(allowedFields)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      message: "User updated successfully",
      user: {
        _id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        banned: data.banned,
        plan: data.plan,
        createdAt: data.created_at,
      }
    });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = params.id;

    // Don't allow deleting admin users
    const { data: targetUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (targetUser?.role === "admin") {
      return NextResponse.json({ message: "Cannot delete admin users" }, { status: 403 });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
