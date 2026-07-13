import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/drive-auth";
import { getUserFromRequest } from "@/lib/serverAuth";

// GET /api/drive/callback?code=xxx — exchange code for tokens
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !["photographer", "admin"].includes(user.role)) {
    return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("drive_oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard/events?drive=error&reason=no_code", req.url));
  }

  try {
    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken(code);
    const tokenCookie = Buffer.from(JSON.stringify(tokens)).toString("base64url");

    const res = NextResponse.redirect(new URL("/dashboard/events?drive=connected", req.url));
    res.cookies.set("drive_tokens", tokenCookie, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    res.cookies.delete("drive_oauth_state");
    return res;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/events?drive=error", req.url));
  }
}
