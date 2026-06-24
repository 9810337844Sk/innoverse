/**
 * POST /api/photos/index-callback
 *
 * Called by the AI service (ai-service/main.py) after it finishes
 * extracting face embeddings from a single photo.  Updates the photo
 * row in Supabase with the extracted faces (JSONB), tag list, and
 * marks it as indexed.
 *
 * Secured via an optional x-internal-secret header that must match
 * the INTERNAL_SECRET env var.  If the env var is not set, all
 * requests are accepted (dev-mode convenience).
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { FaceRecord } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Verify the request comes from our AI service
  const secret = req.headers.get("x-internal-secret");
  if (process.env.INTERNAL_SECRET && secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    photoId?: string;
    faces?: FaceRecord[];
    tags?: string[];
  };

  if (!body.photoId) {
    return NextResponse.json({ error: "photoId required" }, { status: 400 });
  }

  const faces = body.faces ?? [];
  const tags  = body.tags  ?? [];

  const { error } = await supabase
    .from("photos")
    .update({
      indexed:     true,
      faces_count: faces.length,
      faces,
      tags,
    })
    .eq("id", body.photoId);

  if (error) {
    console.error("[index-callback] Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
