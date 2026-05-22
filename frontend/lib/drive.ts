import { google } from "googleapis";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { getOAuthClient } from "@/lib/drive-auth";

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
  proxyUrl: string;
};

export function parseDriveId(input: string | null) {
  if (!input) return "";
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) return value;

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

function decodeCookieTokens(value?: string) {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function readFileTokens() {
  const candidates = [
    path.join(process.cwd(), "public", "data", "drive_tokens.json"),
    path.join(process.cwd(), "frontend", "public", "data", "drive_tokens.json"),
    path.join("/tmp", "drive_tokens.json"),
  ];

  for (const filePath of candidates) {
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch {
      // Try next path.
    }
  }

  return null;
}

export async function getDriveAuth(req?: NextRequest) {
  const tokens = decodeCookieTokens(req?.cookies.get("drive_tokens")?.value) || await readFileTokens();
  if (!tokens) throw new Error("drive_tokens not found");

  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);
  return oauth2;
}

export async function getDriveClient(req?: NextRequest) {
  const auth = await getDriveAuth(req);
  return google.drive({ version: "v3", auth });
}

export async function listDriveImages(req: NextRequest, inputId: string, requestedFolderName = "") {
  const drive = await getDriveClient(req);
  let folderId = inputId;
  let folderName = requestedFolderName;

  const root = await drive.files.get({
    fileId: folderId,
    fields: "id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,shortcutDetails",
    supportsAllDrives: true,
  });

  if (root.data.mimeType === "application/vnd.google-apps.shortcut" && root.data.shortcutDetails?.targetId) {
    folderId = root.data.shortcutDetails.targetId;
    return listDriveImages(req, folderId, folderName);
  }

  folderName = folderName || root.data.name || "Google Drive Folder";

  if (root.data.mimeType?.startsWith("image/")) {
    const photo: DrivePhoto = {
      id: root.data.id!,
      name: root.data.name!,
      mimeType: root.data.mimeType!,
      thumbnailLink: root.data.thumbnailLink || "",
      webViewLink: root.data.webViewLink || "",
      webContentLink: root.data.webContentLink || "",
      size: root.data.size || "0",
      createdTime: root.data.createdTime || "",
      folderId,
      folderName,
      proxyUrl: `/api/drive/image?fileId=${root.data.id}`,
    };

    return { folderId, folderName, photos: [photo] };
  }

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

      for (const file of res.data.files || []) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          await scanFolder(file.id!, file.name || currentFolderName);
          continue;
        }

        if (file.mimeType === "application/vnd.google-apps.shortcut" && file.shortcutDetails?.targetId) {
          const target = await drive.files.get({
            fileId: file.shortcutDetails.targetId,
            fields: "id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime",
            supportsAllDrives: true,
          });

          if (target.data.mimeType === "application/vnd.google-apps.folder") {
            await scanFolder(target.data.id!, target.data.name || currentFolderName);
            continue;
          }

          if (target.data.mimeType?.startsWith("image/")) {
            photos.push({
              id: target.data.id!,
              name: target.data.name!,
              mimeType: target.data.mimeType!,
              thumbnailLink: target.data.thumbnailLink || "",
              webViewLink: target.data.webViewLink || "",
              webContentLink: target.data.webContentLink || "",
              size: target.data.size || "0",
              createdTime: target.data.createdTime || "",
              folderId: currentFolderId,
              folderName: currentFolderName,
              proxyUrl: `/api/drive/image?fileId=${target.data.id}`,
            });
          }
          continue;
        }

        if (file.mimeType?.startsWith("image/")) {
          photos.push({
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            thumbnailLink: file.thumbnailLink || "",
            webViewLink: file.webViewLink || "",
            webContentLink: file.webContentLink || "",
            size: file.size || "0",
            createdTime: file.createdTime || "",
            folderId: currentFolderId,
            folderName: currentFolderName,
            proxyUrl: `/api/drive/image?fileId=${file.id}`,
          });
        }
      }

      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);
  };

  await scanFolder(folderId, folderName);
  return { folderId, folderName, photos };
}

