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
    /\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /[?&]folders=([a-zA-Z0-9_-]+)/,
    /[?&]q=([a-zA-Z0-9_-]{20,})/,
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
        fields: "id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,shortcutDetails",
        supportsAllDrives: true,
      });
      if (folder.data.mimeType === "application/vnd.google-apps.shortcut" && folder.data.shortcutDetails?.targetId) {
        return NextResponse.redirect(new URL(`/api/drive/scan?folderId=${folder.data.shortcutDetails.targetId}`, req.url));
      }
      folderName = folder.data.name || "Google Drive Folder";

      if (folder.data.mimeType?.startsWith("image/")) {
        const photo: DrivePhoto = {
          id:              folder.data.id!,
          name:            folder.data.name!,
          mimeType:        folder.data.mimeType!,
          thumbnailLink:   folder.data.thumbnailLink || "",
          webViewLink:     folder.data.webViewLink || "",
          webContentLink:  folder.data.webContentLink || "",
          size:            folder.data.size || "0",
          createdTime:     folder.data.createdTime || "",
          folderId,
          folderName,
          proxyUrl:        `/api/drive/image?fileId=${folder.data.id}`,
        };

        return NextResponse.json({ photos: [photo], total: 1, folderId, folderName });
      }
    }

    // List all images in the folder, including nested folders.
    const photos: DrivePhoto[] = [];

    const scanFolder = async (currentFolderId: string, currentFolderName: string): Promise<void> => {
      let pageToken: string | undefined;

      do {
        const res = await drive.files.list({
          q: `'${currentFolderId}' in parents and (mimeType contains 'image/' or mimeType='application/vnd.google-apps.folder' or mimeType='application/vnd.google-apps.shortcut') and trashed=false`,
          fields: "nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,shortcutDetails)",
          pageSize: 200,
          pageToken,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        for (const f of res.data.files || []) {
          if (f.mimeType === "application/vnd.google-apps.folder") {
            await scanFolder(f.id!, f.name || currentFolderName);
            continue;
          }

          if (f.mimeType === "application/vnd.google-apps.shortcut" && f.shortcutDetails?.targetId) {
            const target = await drive.files.get({
              fileId: f.shortcutDetails.targetId,
              fields: "id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime",
              supportsAllDrives: true,
            });

            if (target.data.mimeType === "application/vnd.google-apps.folder") {
              await scanFolder(target.data.id!, target.data.name || currentFolderName);
              continue;
            }

            if (target.data.mimeType?.startsWith("image/")) {
              photos.push({
                id:              target.data.id!,
                name:            target.data.name!,
                mimeType:        target.data.mimeType!,
                thumbnailLink:   target.data.thumbnailLink || "",
                webViewLink:     target.data.webViewLink || "",
                webContentLink:  target.data.webContentLink || "",
                size:            target.data.size || "0",
                createdTime:     target.data.createdTime || "",
                folderId:        currentFolderId,
                folderName:      currentFolderName,
                proxyUrl:        `/api/drive/image?fileId=${target.data.id}`,
              });
            }
            continue;
          }

          if (f.mimeType?.startsWith("image/")) {
            photos.push({
              id:              f.id!,
              name:            f.name!,
              mimeType:        f.mimeType!,
              thumbnailLink:   f.thumbnailLink || "",
              webViewLink:     f.webViewLink   || "",
              webContentLink:  f.webContentLink || "",
              size:            f.size          || "0",
              createdTime:     f.createdTime   || "",
              folderId:        currentFolderId,
              folderName:      currentFolderName,
              proxyUrl:        `/api/drive/image?fileId=${f.id}`,
            });
          }
        }

        pageToken = res.data.nextPageToken || undefined;
      } while (pageToken);
    };

    await scanFolder(folderId, folderName);

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
