import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { data } = await supabase
    .from("users")
    .select("id, name, email, role, avatar, plan, banned")
    .eq("id", session.id)
    .maybeSingle();

  if (!data || (data as { banned: boolean }).banned) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: data });
}
