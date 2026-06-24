import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAuthToken, setAuthCookie } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

const ADMIN_USERNAME = "photofly9090";
const ADMIN_PASSWORD = "admin@Sunway11";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    console.log("[POST /api/admin/login] Login attempt for username:", username);

    // Check hardcoded admin credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.error("[POST /api/admin/login] Invalid credentials");
      return NextResponse.json(
        { message: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Get ANY admin user from Supabase (first admin found)
    const { data: adminUser, error } = await supabase
      .from("users")
      .select("id, name, email, role, plan, avatar, banned")
      .eq("role", "admin")
      .eq("banned", false)
      .limit(1)
      .single();

    if (error || !adminUser) {
      console.error("[POST /api/admin/login] No admin user found in database:", error);
      return NextResponse.json(
        { message: "No admin user found. Please create an admin user in Supabase." },
        { status: 500 }
      );
    }

    // Create auth token
    const token = createAuthToken(adminUser.id, adminUser.role);
    console.log("[POST /api/admin/login] Token created for admin:", adminUser.id);

    // Create response with user data
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        plan: adminUser.plan,
        avatar: adminUser.avatar,
      },
    });

    // Set auth cookie
    const isSecure = process.env.NODE_ENV === "production";
    setAuthCookie(response, token, isSecure);

    console.log("[POST /api/admin/login] Login successful for admin:", adminUser.email);
    return response;
  } catch (err) {
    console.error("[POST /api/admin/login] Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
