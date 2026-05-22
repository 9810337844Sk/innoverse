import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getOAuthClient } from "@/lib/drive-auth";

// GET /api/drive/callback?code=xxx — exchange code for tokens
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/drive?error=no_code", req.url));
  }

  try {
    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken(code);
    const tokenCookie = Buffer.from(JSON.stringify(tokens)).toString("base64url");

    try {
      const dataDir = path.join(process.cwd(), "public", "data");
      await mkdir(dataDir, { recursive: true });
      await writeFile(path.join(dataDir, "drive_tokens.json"), JSON.stringify(tokens, null, 2));
      await writeFile(path.join("/tmp", "drive_tokens.json"), JSON.stringify(tokens, null, 2)).catch(() => undefined);
    } catch {
      // Cookie storage is the durable path for Vercel/browser sessions.
    }

    const res = NextResponse.redirect(new URL("/dashboard/events?drive=connected", req.url));
    res.cookies.set("drive_tokens", tokenCookie, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/events?drive=error", req.url));
  }
}
