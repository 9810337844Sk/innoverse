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

    // Save tokens to server-side file (shared across devices)
    const dataDir = path.join(process.cwd(), "public", "data");
    await mkdir(dataDir, { recursive: true });
    await writeFile(
      path.join(dataDir, "drive_tokens.json"),
      JSON.stringify(tokens, null, 2)
    );

    return NextResponse.redirect(new URL("/dashboard/events?drive=connected", req.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/events?drive=error", req.url));
  }
}
