/**
 * Proxy route — streams Google Drive images through our server.
 * Needed because Drive images have auth tokens in URLs that expire,
 * and CORS blocks direct browser access.
 */
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { readFile } from "fs/promises";
import path from "path";
import { getOAuthClient } from "@/lib/drive-auth";

async function getAuthedClient() {
  const tokensPath = path.join(process.cwd(), "public", "data", "drive_tokens.json");
  const raw = await readFile(tokensPath, "utf-8");
  const tokens = JSON.parse(raw);
  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);
  return oauth2;
}

// GET /api/drive/image?fileId=xxx
export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return new NextResponse("fileId required", { status: 400 });

  try {
    const auth  = await getAuthedClient();
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "arraybuffer" }
    );

    const buffer      = Buffer.from(res.data as ArrayBuffer);
    const contentType = res.headers["content-type"] || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Drive image proxy error:", err);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
