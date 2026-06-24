import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("=== Testing Supabase Connection ===");
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
    console.log("Service Key:", serviceKey ? "✓ Set" : "✗ Missing");
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!serviceKey,
      });
    }

    // Test fetching users
    console.log("Fetching users from Supabase...");
    const { data, error, count } = await supabase
      .from("users")
      .select("id, name, email, role, created_at", { count: "exact" })
      .limit(5);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    console.log("Successfully fetched", data?.length, "users");
    console.log("Total count:", count);

    return NextResponse.json({
      success: true,
      userCount: count,
      sampleUsers: data,
      message: "Supabase connection working!",
    });
  } catch (err) {
    console.error("Test error:", err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
