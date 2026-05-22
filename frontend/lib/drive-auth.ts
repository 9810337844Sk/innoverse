import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/drive/callback`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/drive/callback`
      : "http://localhost:3000/api/drive/callback");

export function getOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function isGoogleOAuthConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}
