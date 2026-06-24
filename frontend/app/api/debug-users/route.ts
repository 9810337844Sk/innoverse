import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint - creates FRESH Supabase client to check user count
 * GET /api/debug-users
 */
export async function GET() {
  try {
    console.log("\n=== DEBUG: Creating FRESH Supabase client ===");
    
    // Create a completely fresh client
    const freshClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      }
    );

    console.log("Querying with fresh client...");
    const { data, error, count } = await freshClient
      .from("users")
      .select("id, name, email, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fresh client error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Fresh client result: ${count} users`);
    console.log("Emails:", data?.map(u => u.email));

    return NextResponse.json({
      success: true,
      method: "fresh-client",
      totalCount: count,
      users: data?.map(u => ({ email: u.email, role: u.role, created_at: u.created_at })),
    });
  } catch (err) {
    console.error("Exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
