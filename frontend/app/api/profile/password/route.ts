import { NextRequest, NextResponse } from "next/server";
import { createAuthToken, getUserFromRequest, setAuthCookie } from "@/lib/serverAuth";
import { passwordValidationError } from "@/lib/passwordValidation";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = getUserFromRequest(req);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json() as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new passwords are required" }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ message: "New password must be different from your current password" }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabase
      .from("users")
      .select("email, role, banned")
      .eq("id", session.id)
      .single();
    if (accountError || !account || account.banned) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const validationError = passwordValidationError(newPassword, account.email);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const { data: authenticated } = await supabase.rpc("check_password", {
      p_email: account.email,
      p_password: currentPassword,
    });
    const validUser = Array.isArray(authenticated) ? authenticated[0] : authenticated;
    if (!validUser?.id || validUser.id !== session.id) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    const { data: passwordHash, error: hashError } = await supabase.rpc("hash_password", {
      p_password: newPassword,
    });
    if (hashError || !passwordHash) throw hashError || new Error("Password hashing failed");

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", session.id);
    if (updateError) throw updateError;

    const response = NextResponse.json({ message: "Password changed successfully" });
    setAuthCookie(response, createAuthToken(session.id, account.role), req.nextUrl.protocol === "https:");
    return response;
  } catch (err) {
    console.error("[POST /api/profile/password]", err);
    return NextResponse.json({ message: "Unable to change password" }, { status: 500 });
  }
}
