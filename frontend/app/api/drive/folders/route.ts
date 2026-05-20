import { NextResponse } from "next/server";
import { google } from "googleapis";
import { readFile } from "fs/promises";
import path from "path";
import { getOAuthClient } from "@/lib/drive-auth";

async function getAuthedClient() {
  const tokensPath = path.join(process.cwd(), "public", "data", "drive_tokens.json");
  const raw = await readFile(tokensPath, "utf-8");
  const tokens = JSON.parse(raw);
  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);
  return oauth2;
}

// GET /api/drive/folders — list all folders in Drive
export async function GET() {
  try {
    const auth  = await getAuthedClient();
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id,name,createdTime,modifiedTime,parents)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
    });

    return NextResponse.json({ folders: res.data.files || [] });
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to list folders";
    if (msg.includes("invalid_grant") || msg.includes("No such file")) {
      return NextResponse.json({ error: "not_connected", folders: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, folders: [] }, { status: 500 });
  }
}
