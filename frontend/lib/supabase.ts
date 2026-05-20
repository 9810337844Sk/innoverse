/**
 * Supabase client — server-side only (service role key).
 * Import this ONLY in Next.js API routes or server components.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase env vars. Check .env.local");
}

export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Type helpers ──────────────────────────────────────────────────────────────

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "user" | "photographer" | "admin";
  avatar: string | null;
  banned: boolean;
  plan: "free" | "pro" | "studio";
  created_at: string;
};

export type DbEvent = {
  id: string;
  name: string;
  date: string;
  code: string;
  photographer_id: string;
  description: string | null;
  cover_image: string | null;
  photo_count: number;
  search_count: number;
  download_count: number;
  is_active: boolean;
  drive_folder_url: string | null;
  drive_folder_id: string | null;
  drive_folder_name: string | null;
  drive_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPhoto = {
  id: string;
  event_id: string;
  url: string;
  name: string | null;
  thumbnail_url: string | null;
  cloudinary_public_id: string | null;
  faces_count: number;
  tags: string[];
  indexed: boolean;
  saved_at: string;
  created_at: string;
};

export type DbSearchLog = {
  id: string;
  event_id: string;
  user_id: string | null;
  selfie_url: string | null;
  match_count: number;
  ip_address: string | null;
  created_at: string;
};
