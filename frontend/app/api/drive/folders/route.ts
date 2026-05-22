import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/drive";

// GET /api/drive/folders - list all folders in Drive
export async function GET(req: NextRequest) {
  try {
    const drive = await getDriveClient(req);

    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id,name,createdTime,modifiedTime,parents)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return NextResponse.json({ folders: res.data.files || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to list folders";
    if (msg.includes("invalid_grant") || msg.includes("drive_tokens")) {
      return NextResponse.json({ error: "not_connected", folders: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, folders: [] }, { status: 500 });
  }
}

