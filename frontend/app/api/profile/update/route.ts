import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, email } = await req.json() as { name?: string; email?: string };

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const updates: Record<string, string> = { name: name.trim() };

    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", trimmedEmail)
        .neq("id", session.id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ message: "That email address is already in use" }, { status: 409 });
      }
      updates.email = trimmedEmail;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", session.id)
      .select("id, name, email, role, avatar, plan, banned")
      .single();

    if (error) {
      console.error("[POST /api/profile/update] Supabase error:", error);
      return NextResponse.json({ message: error.message ?? "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile updated!", user: data });
  } catch (err) {
    console.error("[POST /api/profile/update]", err);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
