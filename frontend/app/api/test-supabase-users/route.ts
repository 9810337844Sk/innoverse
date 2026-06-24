import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Direct Supabase query to check user count
 * GET /api/test-supabase-users
 */
export async function GET() {
  try {
    console.log("\n=== DIRECT SUPABASE USER COUNT TEST ===");
    
    const { data, error, count } = await supabase
      .from("users")
      .select("id, name, email, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Total users in Supabase: ${count}`);
    console.log("Users:", data?.map(u => ({ email: u.email, role: u.role })));

    return NextResponse.json({
      success: true,
      totalCount: count,
      fetchedCount: data?.length || 0,
      users: data,
    });
  } catch (err) {
    console.error("Exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
