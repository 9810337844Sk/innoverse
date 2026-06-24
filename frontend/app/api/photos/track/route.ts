import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      photoId?: string;
      eventId?: string;
      action?: string;
      photoName?: string;
    };
    const { photoId, eventId, action, photoName } = body;

    if (!photoId || !eventId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (action !== "view" && action !== "download") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabase.rpc("increment_photo_view", {
      p_photo_id:   photoId,
      p_event_id:   eventId,
      p_photo_name: photoName ?? "",
      p_action:     action,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
