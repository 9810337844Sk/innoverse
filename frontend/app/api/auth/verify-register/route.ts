import { NextRequest, NextResponse } from "next/server";
import { readVerificationToken, hashOtp } from "@/lib/emailVerification";
import { createAuthToken, setAuthCookie } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("\n=== POST /api/auth/verify-register START ===");
    const { verificationToken, otp } = await req.json();
    console.log("Verification attempt with OTP:", otp?.substring(0, 2) + "****");

    if (!verificationToken || !otp) {
      console.error("Missing verification token or OTP");
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 });
    }

    const pendingUser = readVerificationToken(verificationToken);
    console.log("Pending user:", { email: pendingUser.email, role: pendingUser.role });
    
    if (hashOtp(otp, pendingUser.email) !== pendingUser.otpHash) {
      console.error("Invalid OTP provided");
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
    }
    console.log("✓ OTP verified");

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", pendingUser.email)
      .maybeSingle();

    if (existing) {
      console.error("Email already registered:", pendingUser.email);
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    console.log("Inserting user into Supabase...");
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name: pendingUser.name,
        email: pendingUser.email,
        password_hash: pendingUser.passwordHash,
        role: pendingUser.role,
        plan: "free",
      })
      .select("id, name, email, role, plan")
      .single();

    if (insertError || !newUser) {
      console.error("[verify-register] insert error", insertError);
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
      user: safeUser,
      triggerAdminRefresh: true  // Signal to client to notify admin panel
    }, { status: 201 });
    setAuthCookie(response, createAuthToken(newUser.id, newUser.role), req.nextUrl.protocol === "https:");
    
    console.log("=== POST /api/auth/verify-register END ===\n");
    return response;
  } catch (err) {
    console.error("[verify-register] EXCEPTION:", err);
    const message = err instanceof Error && err.message.includes("expired")
      ? "Verification code expired. Please request a new one."
      : "Invalid or expired verification request";
    return NextResponse.json({ message }, { status: 400 });
  }
}
