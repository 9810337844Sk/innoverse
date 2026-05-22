import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { listDriveImages, parseDriveId } from "@/lib/drive";

// GET /api/drive/scan?folderId=xxx&folderUrl=xxx&folderName=xxx
export async function GET(req: NextRequest) {
  const folderId = req.nextUrl.searchParams.get("folderId") || parseDriveId(req.nextUrl.searchParams.get("folderUrl"));
  const requestedFolderName = req.nextUrl.searchParams.get("folderName") || "";

  if (!folderId) {
    return NextResponse.json({ error: "Paste a valid Google Drive folder or image URL", photos: [] }, { status: 400 });
  }

  try {
    const { folderName, photos } = await listDriveImages(req, folderId, requestedFolderName);

    try {
      const dataDir = path.join(process.cwd(), "public", "data");
      await mkdir(dataDir, { recursive: true });
      await writeFile(
        path.join(dataDir, `drive_scan_${folderId}.json`),
        JSON.stringify({ folderId, folderName, photos, scannedAt: new Date().toISOString() }, null, 2)
      );
    } catch {
      // Vercel's filesystem is ephemeral/read-only in places; scanning should still work.
    }

    return NextResponse.json({ photos, total: photos.length, folderId, folderName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Scan failed";
    if (msg.includes("invalid_grant") || msg.includes("drive_tokens") || msg.includes("not found")) {
      return NextResponse.json({ error: "not_connected", photos: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, photos: [] }, { status: 500 });
  }
}

