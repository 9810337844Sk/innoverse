import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getOAuthClient } from "@/lib/drive-auth";

function parseDriveFolderId(input: string | null) {
  if (!input) return "";
  const value = input.trim();
  const directMatch = value.match(/^[a-zA-Z0-9_-]{20,}$/);
  if (directMatch) return value;

  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /[?&]folders=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

async function getAuthedClient() {
  const tokensPath = path.join(process.cwd(), "public", "data", "drive_tokens.json");
  const raw = await readFile(tokensPath, "utf-8");
  const tokens = JSON.parse(raw);
  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);
  return oauth2;
}

export type DrivePhoto = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
  webViewLink: string;
  webContentLink: string;
  size: string;
  createdTime: string;
  folderId: string;
  folderName: string;
  // Served via our proxy to avoid CORS
  proxyUrl: string;
};

// GET /api/drive/scan?folderId=xxx&folderUrl=xxx&folderName=xxx
export async function GET(req: NextRequest) {
  const folderId   = req.nextUrl.searchParams.get("folderId") || parseDriveFolderId(req.nextUrl.searchParams.get("folderUrl"));
  let folderName = req.nextUrl.searchParams.get("folderName") || "";

  if (!folderId) {
    return NextResponse.json({ error: "folderId required" }, { status: 400 });
  }

  try {
    const auth  = await getAuthedClient();
    const drive = google.drive({ version: "v3", auth });

    if (!folderName) {
      const folder = await drive.files.get({
        fileId: folderId,
        fields: "id,name",
      });
      folderName = folder.data.name || "Google Drive Folder";
    }

    // List all images in the folder (recursive via pageToken)
    const photos: DrivePhoto[] = [];
    let pageToken: string | undefined;

    do {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
        fields: "nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime)",
        pageSize: 200,
        pageToken,
      });

      for (const f of res.data.files || []) {
        photos.push({
          id:              f.id!,
          name:            f.name!,
          mimeType:        f.mimeType!,
          thumbnailLink:   f.thumbnailLink || "",
          webViewLink:     f.webViewLink   || "",
          webContentLink:  f.webContentLink || "",
          size:            f.size          || "0",
          createdTime:     f.createdTime   || "",
          folderId,
          folderName,
          proxyUrl:        `/api/drive/image?fileId=${f.id}`,
        });
      }

      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    // Cache scan results server-side
    const dataDir = path.join(process.cwd(), "public", "data");
    await mkdir(dataDir, { recursive: true });
    await writeFile(
      path.join(dataDir, `drive_scan_${folderId}.json`),
      JSON.stringify({ folderId, folderName, photos, scannedAt: new Date().toISOString() }, null, 2)
    );

    return NextResponse.json({ photos, total: photos.length, folderId, folderName });
  } catch (err: unknown) {
    const msg = (err as Error).message || "Scan failed";
    if (msg.includes("invalid_grant") || msg.includes("No such file") || msg.includes("drive_tokens")) {
      return NextResponse.json({ error: "not_connected", photos: [] }, { status: 401 });
    }
    return NextResponse.json({ error: msg, photos: [] }, { status: 500 });
  }
}
