import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const validRoles = ["user", "photographer"];
    const userRole = validRoles.includes(role) ? role : "user";

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // Hash password using pgcrypto via raw SQL
    const { data: hashResult, error: hashError } = await supabase
      .rpc("hash_password", { p_password: password });

    if (hashError || !hashResult) {
      console.error("[register] hash error", hashError);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: hashResult as string,
        role: userRole,
        plan: "free",
      })
      .select("id, name, email, role, plan")
      .single();

    if (insertError || !newUser) {
      console.error("[register] insert error", insertError);
      return NextResponse.json({ message: "Failed to create account" }, { status: 500 });
    }

    const safeUser = {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan,
    };

    const token = Buffer.from(
      JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 7 * 86400000 })
    ).toString("base64");

    return NextResponse.json({ user: safeUser, token }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
