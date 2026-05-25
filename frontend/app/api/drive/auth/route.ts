import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient, isGoogleOAuthConfigured } from "@/lib/drive-auth";
import { getUserFromRequest } from "@/lib/serverAuth";

// GET /api/drive/auth — redirect to Google consent screen
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !["photographer", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local" },
      { status: 503 }
    );
  }

  const oauth2 = getOAuthClient();
  const state = randomBytes(24).toString("base64url");
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state,
  });

  const response = NextResponse.redirect(url);
  response.cookies.set("drive_oauth_state", state, {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
