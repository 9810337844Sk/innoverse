import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string; email?: string; subject?: string; message?: string;
    };

    const name    = body.name?.trim()    ?? "";
    const email   = body.email?.trim()   ?? "";
    const subject = body.subject?.trim() || "General Enquiry";
    const message = body.message?.trim() ?? "";

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    await sendContactEmail({ name, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Failed to send message. Try WhatsApp instead." }, { status: 500 });
  }
}
