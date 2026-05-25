/**
 * Server-side JSON database — shared across ALL devices on the network.
 * Stores events and photos in /public/data/*.json
 */
import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUserFromRequest } from "@/lib/serverAuth";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(file: string, data: unknown) {
  await ensureDir();
  await writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// GET /api/db?collection=events|photos&eventId=xxx
export async function GET(req: NextRequest) {
  if (!getUserFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");
  const eventId    = searchParams.get("eventId");

  if (collection === "events") {
    const events = await readJSON("events.json", []);
    return NextResponse.json({ events });
  }

  if (collection === "photos" && eventId) {
    const photos = await readJSON(`photos_${eventId}.json`, []);
    return NextResponse.json({ photos });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

// POST /api/db  body: { collection, action, data }
export async function POST(req: NextRequest) {
  if (!getUserFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    collection: string;
    action: "set" | "push" | "delete";
    data?: unknown;
    id?: string;
    eventId?: string;
  };

  const { collection, action, data, id, eventId } = body;

  // ── Events ──────────────────────────────────────────────────────────────
  if (collection === "events") {
    let events = await readJSON<Record<string, unknown>[]>("events.json", []);

    if (action === "set") {
      events = data as Record<string, unknown>[];
      await writeJSON("events.json", events);
      return NextResponse.json({ ok: true });
    }

    if (action === "push") {
      events = [data as Record<string, unknown>, ...events];
      await writeJSON("events.json", events);
      return NextResponse.json({ ok: true, event: data });
    }

    if (action === "delete" && id) {
      events = events.filter((e) => e._id !== id);
      await writeJSON("events.json", events);
      return NextResponse.json({ ok: true });
    }
  }

  // ── Photos ───────────────────────────────────────────────────────────────
  if (collection === "photos" && eventId) {
    let photos = await readJSON<Record<string, unknown>[]>(`photos_${eventId}.json`, []);

    if (action === "set") {
      photos = data as Record<string, unknown>[];
      await writeJSON(`photos_${eventId}.json`, photos);
      return NextResponse.json({ ok: true });
    }

    if (action === "push") {
      const newPhotos = data as Record<string, unknown>[];
      photos = [...photos, ...newPhotos];
      await writeJSON(`photos_${eventId}.json`, photos);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete" && id) {
      photos = photos.filter((p) => p._id !== id);
      await writeJSON(`photos_${eventId}.json`, photos);
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
