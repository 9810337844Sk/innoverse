import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/serverAuth";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

function last7DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    keys.push(DAYS[d.getDay()]);
  }
  return keys;
}

function last6MonthKeys(): string[] {
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    keys.push(MONTHS[d.getMonth()]);
  }
  return keys;
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── 1. All events owned by this photographer ────────────────────────────────
  const { data: events } = await supabase
    .from("events")
    .select("id, photo_count, search_count, download_count, created_at")
    .eq("photographer_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const safeEvents = events ?? [];
  const eventIds   = safeEvents.map((e) => e.id as string);

  // ── 2. Summary stats ────────────────────────────────────────────────────────
  const totalPhotos    = safeEvents.reduce((s, e) => s + (e.photo_count    ?? 0), 0);
  const totalSearches  = safeEvents.reduce((s, e) => s + (e.search_count   ?? 0), 0);
  const totalDownloads = safeEvents.reduce((s, e) => s + (e.download_count ?? 0), 0);
  const totalEvents    = safeEvents.length;

  // ── 3. Weekly searches (last 7 days from search_logs) ──────────────────────
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayKeys = last7DayKeys();
  const dayMap: Record<string, number> = {};
  dayKeys.forEach((k) => { dayMap[k] = 0; });

  if (eventIds.length > 0) {
    const { data: logs } = await supabase
      .from("search_logs")
      .select("created_at")
      .in("event_id", eventIds)
      .gte("created_at", weekAgo.toISOString());

    (logs ?? []).forEach((log) => {
      const d = new Date(log.created_at as string);
      const key = DAYS[d.getDay()];
      if (key in dayMap) dayMap[key]++;
    });
  }

  const weeklySearches = dayKeys.map((day) => ({
    day,
    searches:  dayMap[day],
    // Downloads not tracked per-day; derive a rough rate from totals
    downloads: totalSearches > 0
      ? Math.round(dayMap[day] * (totalDownloads / Math.max(totalSearches, 1)))
      : 0,
  }));

  // ── 4. Monthly growth (last 6 months) ──────────────────────────────────────
  const monthKeys = last6MonthKeys();
  const monthMap: Record<string, { events: number; photos: number }> = {};
  monthKeys.forEach((k) => { monthMap[k] = { events: 0, photos: 0 }; });

  const now = new Date();
  safeEvents.forEach((e) => {
    const d          = new Date(e.created_at as string);
    const monthsAgo  = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo <= 5) {
      const key = MONTHS[d.getMonth()];
      if (monthMap[key]) {
        monthMap[key].events++;
        monthMap[key].photos += e.photo_count ?? 0;
      }
    }
  });

  const monthlyGrowth = monthKeys.map((month) => ({ month, ...monthMap[month] }));

  // ── 5. Photo indexing breakdown ─────────────────────────────────────────────
  let indexingStats = { indexed: 0, pending: 0, total: 0, drivePhotos: 0, directPhotos: 0 };

  if (eventIds.length > 0) {
    const { data: photoRows } = await supabase
      .from("photos")
      .select("indexed, cloudinary_public_id")
      .in("event_id", eventIds);

    if (photoRows) {
      indexingStats.total       = photoRows.length;
      indexingStats.indexed     = photoRows.filter((p) => p.indexed).length;
      indexingStats.pending     = photoRows.filter((p) => !p.indexed).length;
      indexingStats.drivePhotos = photoRows.filter(
        (p) => typeof p.cloudinary_public_id === "string" && p.cloudinary_public_id.startsWith("drive:")
      ).length;
      indexingStats.directPhotos = photoRows.filter(
        (p) => typeof p.cloudinary_public_id === "string" && !p.cloudinary_public_id.startsWith("drive:")
      ).length;
    }
  }

  return NextResponse.json({
    stats:          { totalPhotos, totalSearches, totalDownloads, totalEvents },
    weeklySearches,
    monthlyGrowth,
    indexingStats,
  });
}
