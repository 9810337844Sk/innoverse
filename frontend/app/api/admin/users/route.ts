import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching completely

export async function GET(req: NextRequest) {
  try {
    console.log("\n=== GET /api/admin/users START ===");
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("Environment check:");
    console.log("- Supabase URL:", supabaseUrl ? "✓" : "✗");
    console.log("- Service Key:", serviceKey ? "✓" : "✗");
    
    const user = getUserFromRequest(req);
    console.log("User from request:", user ? { id: user.id, role: user.role } : "null");
    
    if (!user || user.role !== "admin") {
      console.error("Access denied - user:", user);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    console.log("Querying Supabase users table...");
    const supabase = getSupabaseClient();  // Get fresh client
    const { data, error, count } = await supabase
      .from("users")
      .select("id, name, email, role, banned, plan, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log(`✓ Successfully fetched ${data?.length} users (total count: ${count})`);
    console.log("All users:", data?.map(u => ({ email: u.email, role: u.role })));
    if (data && data.length > 0) {
      console.log("First user sample:", data[0]);
    }

    const users = (data ?? []).map(u => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      banned: u.banned,
      plan: u.plan,
      createdAt: u.created_at,
    }));

    console.log("=== GET /api/admin/users END ===\n");
    return NextResponse.json({ users, total: count ?? users.length });
  } catch (err) {
    console.error("=== GET /api/admin/users ERROR ===");
    console.error(err);
    return NextResponse.json({ 
      message: err instanceof Error ? err.message : "Internal server error",
      users: [], 
      total: 0 
    }, { status: 500 });
  }
}
