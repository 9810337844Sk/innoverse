import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createResetToken } from "@/lib/resetToken";
import { sendPasswordResetEmail } from "@/lib/mailer";

export const runtime = "nodejs";

// Rate-limit: one request per email per 5 minutes (in-memory, single instance)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Valid email address required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate-limit: prevent email enumeration via timing or flood
    const lastSent = rateLimitMap.get(normalizedEmail) ?? 0;
    if (Date.now() - lastSent < RATE_LIMIT_MS) {
      // Return 200 regardless — don't reveal whether email exists
      return NextResponse.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Look up user — always respond 200 to prevent email enumeration
    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (user) {
      rateLimitMap.set(normalizedEmail, Date.now());

      const token    = createResetToken(normalizedEmail, user.password_hash as string);
      const appUrl   = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({
        to:       normalizedEmail,
        name:     user.name as string,
        resetUrl,
      });
    }

    return NextResponse.json({
      message: "If that email is registered, a reset link has been sent.",
    });

  } catch (err) {
    console.error("[forgot-password]", err);
    const msg = err instanceof Error && err.message.includes("SMTP")
      ? "Email service is not configured"
      : "Something went wrong. Please try again.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
