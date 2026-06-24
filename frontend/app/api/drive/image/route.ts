/**
 * Proxy route — streams Google Drive images through our server.
 *
 * Two auth paths:
 *  1. Authenticated user (photographer)  → uses their drive_tokens cookie
 *  2. Guest + ?eventId=<uuid>            → looks up event.drive_refresh_token in Supabase,
 *                                          refreshes an access token, and streams the image.
 *     This lets guests see Drive photos during face search without any login.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/drive";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";
import { getOAuthClient } from "@/lib/drive-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const fileId  = req.nextUrl.searchParams.get("fileId");
  const eventId = req.nextUrl.searchParams.get("eventId");

  if (!fileId) return new NextResponse("fileId required", { status: 400 });

  const user = getUserFromRequest(req);

  // ── Path 1: authenticated photographer uses their own Drive session ─────────
  if (user) {
    try {
      const drive = await getDriveClient(req);
      const res = await drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" },
      );
      const buffer      = Buffer.from(res.data as ArrayBuffer);
      const contentType = (res.headers as Record<string, string>)["content-type"] || "image/jpeg";
      return new NextResponse(buffer, {
        headers: {
          "Content-Type":  contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      console.error("[drive/image] user path error:", err);
      return new NextResponse("Failed to fetch image", { status: 500 });
    }
  }

  // ── Path 2: guest access via event's stored refresh_token ───────────────────
  if (eventId) {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .select("drive_refresh_token")
        .eq("id", eventId)
        .single();

      if (error || !event?.drive_refresh_token) {
        return new NextResponse("Drive not configured for this event", { status: 403 });
      }

      const oauth2 = getOAuthClient();
      oauth2.setCredentials({ refresh_token: event.drive_refresh_token });
      const { credentials } = await oauth2.refreshAccessToken();
      const accessToken = credentials.access_token;
      if (!accessToken) throw new Error("Could not obtain Drive access token");

      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!driveRes.ok) {
        throw new Error(`Google Drive returned ${driveRes.status}`);
      }

      const buffer      = Buffer.from(await driveRes.arrayBuffer());
      const contentType = driveRes.headers.get("content-type") || "image/jpeg";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":  contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      console.error("[drive/image] guest path error:", err);
      return new NextResponse("Failed to fetch image", { status: 500 });
    }
  }

  return new NextResponse("Unauthorized", { status: 401 });
}
