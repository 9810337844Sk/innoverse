/**
 * GET /api/photos/descriptors/[eventId]
 *
 * Returns photos that have pre-computed 128-dim face-api.js descriptors
 * stored in faces_client (populated by the offline indexing flow).
 *
 * Used by the find page for instant vector-based face search without
 * loading any photo images client-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  const { eventId } = params;

  const { data, error } = await supabase
    .from("photos")
    .select("id, url, thumbnail_url, name, faces_client")
    .eq("event_id", eventId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Only return photos that have at least one stored face descriptor
  const withDescriptors = (data || []).filter(
    (p) => Array.isArray(p.faces_client) && p.faces_client.length > 0,
  );

  const photos = withDescriptors.map((p) => ({
    _id:          p.id,
    url:          p.url,
    thumbnailUrl: p.thumbnail_url ?? undefined,
    name:         p.name ?? p.id,
    descriptors:  p.faces_client as number[][],
  }));

  return NextResponse.json({ photos, count: photos.length });
}
