import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readResetToken, validateResetSignature } from "@/lib/resetToken";
import { passwordValidationError } from "@/lib/passwordValidation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json() as { token?: string; password?: string };

    if (!token || !password) {
      return NextResponse.json({ message: "Token and new password are required" }, { status: 400 });
    }

    // 1. Decrypt + check expiry
    let email: string;
    let pSig:  string;
    try {
      ({ email, pSig } = readResetToken(token));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid or expired reset link";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    // 2. Validate new password strength
    const validationError = passwordValidationError(password, email);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    // 3. Look up current user (need current password_hash to verify single-use)
    const { data: user } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    // 4. Check single-use — if password already changed, pSig won't match
    if (!validateResetSignature(pSig, user.password_hash as string)) {
      return NextResponse.json({
        message: "This reset link has already been used. Please request a new one.",
      }, { status: 400 });
    }

    // 5. Hash new password via pgcrypto
    const { data: newHash, error: hashErr } = await supabase
      .rpc("hash_password", { p_password: password });

    if (hashErr || !newHash) {
      console.error("[reset-password] hash error", hashErr);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }

    // 6. Update password in Supabase
    const { error: updateErr } = await supabase
      .from("users")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[reset-password] update error", updateErr);
      return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated successfully. You can now sign in." });

  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
