import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { data, error, count } = await supabase
      .from("users")
      .select("id, name, email, role, banned, plan, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const users = (data ?? []).map(u => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      banned: u.banned,
      plan: u.plan,
      createdAt: u.created_at,
    }));

    return NextResponse.json({ users, total: count ?? users.length });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ users: [], total: 0 }, { status: 500 });
  }
}
