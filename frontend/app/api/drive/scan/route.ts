import { NextRequest, NextResponse } from "next/server";
import { listDriveImages, parseDriveId } from "@/lib/drive";
import { getUserFromRequest } from "@/lib/serverAuth";

// GET /api/drive/scan?folderId=xxx&folderUrl=xxx&folderName=xxx
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !["photographer", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized", photos: [] }, { status: 401 });
  }

  const folderId = req.nextUrl.searchParams.get("folderId") || parseDriveId(req.nextUrl.searchParams.get("folderUrl"));
  const requestedFolderName = req.nextUrl.searchParams.get("folderName") || "";

  if (!folderId) {
    return NextResponse.json({ error: "Paste a valid Google Drive folder or image URL", photos: [] }, { status: 400 });
  }

  try {
    const { folderName, photos } = await listDriveImages(req, folderId, requestedFolderName);

    return NextResponse.json({ photos, total: photos.length, folderId, folderName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Scan failed";
    if (msg.includes("invalid_grant") || msg.includes("drive_tokens") || msg.includes("not found")) {
      return NextResponse.json({ error: "not_connected", photos: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, photos: [] }, { status: 500 });
  }
}
