/**
 * POST /api/photos/index/[eventId]
 *
 * Fetches all unindexed photos for the event from Supabase, builds
 * download URLs the AI service can reach (direct googleapis.com URLs
 * for Drive photos, plain Supabase/Cloudinary URLs for others), and
 * sends the job to ai-service /index.
 *
 * The AI service downloads each photo, extracts face embeddings, and
 * POSTs results back to /api/photos/index-callback — which writes the
 * faces JSONB + indexed flag to Supabase.
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";
import type { DbEvent, DbPhoto } from "@/lib/supabase";
import { getOAuthClient } from "@/lib/drive-auth";

export const runtime  = "nodejs";
export const maxDuration = 60;

async function getDriveAccessToken(
  req: NextRequest,
  eventId: string,
): Promise<string | null> {
  // 1. Try the photographer's current session cookie
  try {
    const cookieVal = req.cookies.get("drive_tokens")?.value;
    if (cookieVal) {
      const tokens = JSON.parse(Buffer.from(cookieVal, "base64url").toString("utf8"));
      const oauth2 = getOAuthClient();
      oauth2.setCredentials(tokens);
      const { credentials } = await oauth2.refreshAccessToken();
      if (credentials.access_token) return credentials.access_token;
    }
  } catch { /* fall through to stored token */ }

  // 2. Fall back to the refresh_token saved at Drive-import time
  try {
    const { data: event } = await supabase
      .from("events")
      .select("drive_refresh_token")
      .eq("id", eventId)
      .single();

    if (event?.drive_refresh_token) {
      const oauth2 = getOAuthClient();
      oauth2.setCredentials({ refresh_token: event.drive_refresh_token });
      const { credentials } = await oauth2.refreshAccessToken();
      return credentials.access_token ?? null;
    }
  } catch { /* no token available */ }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = params;

  // Verify event ownership
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id, photographer_id, code")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (user.role !== "admin" && (event as DbEvent).photographer_id !== user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Fetch unindexed photos
  const { data: photos, error: photosErr } = await supabase
    .from("photos")
    .select("id, url, thumbnail_url, cloudinary_public_id, name")
    .eq("event_id", eventId)
    .eq("indexed", false);

  if (photosErr) {
    return NextResponse.json({ error: photosErr.message }, { status: 500 });
  }
  if (!photos?.length) {
    return NextResponse.json({ queued: 0, message: "All photos are already indexed" });
  }

  // Get a Drive access token so the AI can download Drive photos directly
  const accessToken = await getDriveAccessToken(req, eventId);

  const aiPhotos = (photos as DbPhoto[]).map((p) => {
    let downloadUrl = p.url;
    if (p.cloudinary_public_id?.startsWith("drive:") && accessToken) {
      const fileId = p.cloudinary_public_id.replace("drive:", "");
      downloadUrl  = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
    }
    return { id: p.id, url: downloadUrl, name: p.name };
  });

  const aiBase  = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");
  const appUrl  = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const cbUrl   = `${appUrl}/api/photos/index-callback`;
  const secret  = process.env.INTERNAL_SECRET || "";

  try {
    const aiRes = await fetch(`${aiBase}/index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-internal-secret": secret } : {}),
      },
      body: JSON.stringify({
        event_id:     eventId,
        photos:       aiPhotos,
        callback_url: cbUrl,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text().catch(() => aiRes.statusText);
      return NextResponse.json({ error: `AI service error: ${txt}` }, { status: 502 });
    }

    return NextResponse.json({
      queued:  aiPhotos.length,
      message: `Indexing ${aiPhotos.length} photos in background`,
    });
  } catch (err) {
    console.error("[photos/index] AI service unreachable:", err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
