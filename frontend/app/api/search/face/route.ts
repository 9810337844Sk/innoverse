/**
 * POST /api/search/face
 *
 * End-to-end face search — no Express backend, no MongoDB.
 *
 * Flow:
 *  1. Resolve event by code from Supabase
 *  2. Fetch indexed photos WITH face embeddings from Supabase
 *  3. Forward selfie + photos JSON to ai-service /search
 *  4. Return matches + log to search_logs
 *
 * Falls back to { error: "server_unavailable" } (503) when the AI
 * service is unreachable so the client can fall back to client-side
 * face-api.js.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DbEvent, DbPhoto } from "@/lib/supabase";

export const runtime     = "nodejs";
export const maxDuration = 35;

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const selfie    = formData.get("selfie")    as File   | null;
    const eventCode = formData.get("eventCode") as string | null;

    if (!selfie || !eventCode) {
      return NextResponse.json(
        { error: "bad_request", message: "selfie and eventCode are required" },
        { status: 400 },
      );
    }

    // ── 1. Resolve event ────────────────────────────────────────────────────
    const { data: events, error: eventErr } = await supabase
      .from("events")
      .select("id, name, is_active")
      .eq("code", eventCode.trim().toUpperCase())
      .eq("is_active", true)
      .limit(1);

    if (eventErr || !events?.length) {
      return NextResponse.json(
        { error: "not_found", message: "Event not found or inactive" },
        { status: 404 },
      );
    }

    const event = events[0] as DbEvent;

    // ── 2. Fetch indexed photos with embeddings ─────────────────────────────
    const { data: photos, error: photosErr } = await supabase
      .from("photos")
      .select("id, url, thumbnail_url, faces_count, faces")
      .eq("event_id", event.id)
      .eq("indexed", true);

    if (photosErr) {
      return NextResponse.json({ error: "db_error", message: photosErr.message }, { status: 500 });
    }

    if (!photos?.length) {
      return NextResponse.json({
        matches:   [],
        total:     0,
        eventName: event.name,
        message:   "No indexed photos yet — ask the photographer to run face indexing first",
      });
    }

    // Build the photos payload for the AI service
    const photosPayload = (photos as DbPhoto[]).map((p) => ({
      id:           p.id,
      url:          p.url,
      thumbnailUrl: p.thumbnail_url ?? p.url,
      facesCount:   p.faces_count,
      faces:        p.faces ?? [],
    }));

    // If every photo was indexed offline (no server-side 512-dim embeddings),
    // skip the AI service call entirely and let the client use faces_client.
    const photosWithServerEmbeddings = photosPayload.filter(p => p.faces.length > 0);
    if (photosWithServerEmbeddings.length === 0) {
      return NextResponse.json({
        matches:   [],
        total:     0,
        eventName: event.name,
        message:   "Photos are indexed via browser — using offline descriptors for search",
      });
    }

    // ── 3. Forward to AI service ────────────────────────────────────────────
    const aiBase = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");

    const aiForm = new FormData();
    const buf    = await selfie.arrayBuffer();
    aiForm.append("selfie",    new Blob([buf], { type: selfie.type }), "selfie.jpg");
    aiForm.append("event_id",  event.id);
    aiForm.append("threshold", "0.6");
    aiForm.append("photos",    JSON.stringify(photosPayload));

    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), 30_000);

    let aiRes: Response;
    try {
      aiRes = await fetch(`${aiBase}/search`, {
        method: "POST",
        body:   aiForm,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!aiRes.ok) {
      const body = await aiRes.json().catch(() => ({ message: "AI search failed" })) as Record<string, unknown>;
      return NextResponse.json(body, { status: aiRes.status });
    }

    const result = await aiRes.json() as {
      matches: Array<{
        _id: string;
        url: string;
        thumbnailUrl?: string;
        facesCount: number;
        similarity: number;
      }>;
      total: number;
    };

    // ── 4. Log the search ───────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
             ?? req.headers.get("x-real-ip")
             ?? null;

    void supabase.from("search_logs").insert({
      event_id:    event.id,
      match_count: result.total,
      ip_address:  ip,
    });

    void supabase.rpc("increment_event_counter", {
      p_event_id: event.id,
      p_field:    "search_count",
    });

    return NextResponse.json({
      matches:   result.matches,
      total:     result.total,
      eventName: event.name,
    });

  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.error("[search/face]", isAbort ? "timeout" : err);
    return NextResponse.json(
      {
        error:   "server_unavailable",
        message: isAbort
          ? "AI search timed out — falling back to client search"
          : "AI service unavailable — falling back to client search",
      },
      { status: 503 },
    );
  }
}
