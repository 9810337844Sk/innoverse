import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await unlink(path.join(process.cwd(), "public", "data", "drive_tokens.json"));
  } catch { /* already gone */ }
  return NextResponse.json({ ok: true });
}
