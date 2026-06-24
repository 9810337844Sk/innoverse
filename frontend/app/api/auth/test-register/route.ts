import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAuthToken, setAuthCookie } from "@/lib/serverAuth";

export const runtime = "nodejs";

/**
 * TEST-ONLY REGISTRATION ENDPOINT
 * Bypasses email verification for testing purposes
 * Use this when email service is not configured
 * 
 * POST /api/auth/test-register
 * Body: { name, email, password, role }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("\n=== POST /api/auth/test-register START ===");
    const { name, email, password, role } = await req.json();
    console.log("Request body:", { name, email: email?.toLowerCase(), role });

    if (!name || !email || !password) {
      console.error("Missing required fields");
      return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 });
    }

    const validRoles = ["user", "photographer", "admin"];
    const userRole = validRoles.includes(role) ? role : "photographer";
    console.log("Using role:", userRole);

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Checking if email exists:", normalizedEmail);
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      console.error("Email already registered:", normalizedEmail);
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }
    console.log("✓ Email available");

    // Hash password using pgcrypto via raw SQL
    console.log("Hashing password...");
    const { data: hashResult, error: hashError } = await supabase
      .rpc("hash_password", { p_password: password });

    if (hashError || !hashResult) {
      console.error("[test-register] hash error", hashError);
      return NextResponse.json({ message: "Server error hashing password" }, { status: 500 });
    }
    console.log("✓ Password hashed");

    // Insert user directly (skip email verification)
    console.log("Inserting user into Supabase...");
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: hashResult as string,
        role: userRole,
        plan: "free",
        banned: false,
      })
      .select("id, name, email, role, plan")
      .single();

    if (insertError || !newUser) {
      console.error("[test-register] insert error", insertError);
      return NextResponse.json({ message: "Failed to create account" }, { status: 500 });
    }

    console.log("✓ User created successfully:", { id: newUser.id, email: newUser.email, role: newUser.role });

    const safeUser = {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan,
      avatar: null,
    };

    const response = NextResponse.json({ 
      message: "Account created successfully (test mode - no email verification)",
      user: safeUser,
      triggerAdminRefresh: true  // Signal to client to notify admin panel
    }, { status: 201 });
    
    setAuthCookie(response, createAuthToken(newUser.id, newUser.role), req.nextUrl.protocol === "https:");
    
    console.log("=== POST /api/auth/test-register END ===\n");
    return response;
  } catch (err) {
    console.error("[test-register] EXCEPTION:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
