import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createVerificationToken, generateOtp, hashOtp } from "@/lib/emailVerification";
import { sendOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

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

    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOtp();
    const verificationToken = createVerificationToken({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashResult as string,
      role: userRole,
      otpHash: hashOtp(otp, normalizedEmail),
    });

    await sendOtpEmail({ to: normalizedEmail, name: name.trim(), otp });

    return NextResponse.json({
      message: "Verification code sent to your email",
      verificationToken,
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("[register]", err);
    const message = err instanceof Error && err.message.includes("SMTP")
      ? "Email service is not configured"
      : "Server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
