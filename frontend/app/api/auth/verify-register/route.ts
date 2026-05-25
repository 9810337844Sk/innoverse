import { NextRequest, NextResponse } from "next/server";
import { readVerificationToken, hashOtp } from "@/lib/emailVerification";
import { createAuthToken, setAuthCookie } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { verificationToken, otp } = await req.json();

    if (!verificationToken || !otp) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 });
    }

    const pendingUser = readVerificationToken(verificationToken);
    if (hashOtp(otp, pendingUser.email) !== pendingUser.otpHash) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", pendingUser.email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

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

    const safeUser = {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan,
      avatar: null,
    };

    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    setAuthCookie(response, createAuthToken(newUser.id, newUser.role), req.nextUrl.protocol === "https:");
    return response;
  } catch (err) {
    console.error("[verify-register]", err);
    const message = err instanceof Error && err.message.includes("expired")
      ? "Verification code expired. Please request a new one."
      : "Invalid or expired verification request";
    return NextResponse.json({ message }, { status: 400 });
  }
}
