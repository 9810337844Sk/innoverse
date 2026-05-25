import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  if (!getUserFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("drive_tokens");
  return res;
}
