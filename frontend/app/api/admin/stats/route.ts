import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [usersRes, eventsRes, photosRes, searchRes, bannedRes] = await Promise.all([
      supabase.from("users").select("id, role, plan, created_at", { count: "exact" }),
      supabase.from("events").select("id, photo_count, search_count, download_count, created_at, is_active", { count: "exact" }),
      supabase.from("photos").select("id, created_at", { count: "exact" }),
      supabase.from("search_logs").select("id, created_at", { count: "exact" }),
      supabase.from("users").select("id", { count: "exact" }).eq("banned", true),
    ]);

    const users      = usersRes.data  ?? [];
    const events     = eventsRes.data ?? [];
    const totalUsers         = usersRes.count  ?? 0;
    const totalEvents        = eventsRes.count ?? 0;
    const totalPhotos        = photosRes.count ?? 0;
    const totalSearches      = searchRes.count ?? 0;
    const totalBanned        = bannedRes.count ?? 0;
    const totalPhotographers = users.filter(u => u.role === "photographer").length;
    const totalGuests        = users.filter(u => u.role === "user").length;
    const totalAdmins        = users.filter(u => u.role === "admin").length;
    const activeEvents       = events.filter(e => e.is_active).length;

    // plan breakdown
    const planBreakdown = {
      free:   users.filter(u => u.plan === "free").length,
      pro:    users.filter(u => u.plan === "pro").length,
      studio: users.filter(u => u.plan === "studio").length,
    };

    // total downloads & searches from events
    const totalDownloads = events.reduce((s, e) => s + (e.download_count ?? 0), 0);
    const totalEventSearches = events.reduce((s, e) => s + (e.search_count ?? 0), 0);

    // registrations per month (last 6 months)
    const now = new Date();
    const monthlyRegistrations = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = users.filter(u => {
        const c = new Date(u.created_at);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      return { month: label, users: count };
    });

    // photos uploaded per month (last 6 months)
    const photos = photosRes.data ?? [];
    const monthlyPhotos = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = photos.filter(p => {
        const c = new Date(p.created_at);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      return { month: label, photos: count };
    });

    return NextResponse.json({
      totalUsers,
      totalPhotographers,
      totalGuests,
      totalAdmins,
      totalBanned,
      totalEvents,
      activeEvents,
      totalPhotos,
      totalSearches: totalSearches || totalEventSearches,
      totalDownloads,
      planBreakdown,
      monthlyRegistrations,
      monthlyPhotos,
      storageUsedGB: parseFloat((totalPhotos * 0.003).toFixed(2)),
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { totalUsers: 0, totalPhotographers: 0, totalGuests: 0, totalAdmins: 0, totalBanned: 0,
        totalEvents: 0, activeEvents: 0, totalPhotos: 0, totalSearches: 0, totalDownloads: 0,
        planBreakdown: { free: 0, pro: 0, studio: 0 }, monthlyRegistrations: [], monthlyPhotos: [],
        storageUsedGB: 0 },
      { status: 500 }
    );
  }
}
