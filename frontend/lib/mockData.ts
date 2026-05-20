// ─── Dummy accounts ───────────────────────────────────────────────────────────
export const DUMMY_USERS = [
  { _id: "u1", name: "Alex Johnson", email: "photographer@demo.com", password: "demo1234", role: "photographer" },
  { _id: "u2", name: "Sarah Williams", email: "admin@demo.com",       password: "demo1234", role: "admin" },
  { _id: "u3", name: "Mike Chen",      email: "user@demo.com",        password: "demo1234", role: "user" },
];

// ─── Dummy events ─────────────────────────────────────────────────────────────
export const DUMMY_EVENTS: {
  _id: string; name: string; date: string; code: string;
  photographerId: string; photoCount: number; searchCount: number;
  downloadCount: number; createdAt: string;
}[] = [];

// ─── Dummy photos (using picsum for realistic images) ─────────────────────────
export const DUMMY_PHOTOS = Array.from({ length: 24 }, (_, i) => ({
  _id: `p${i + 1}`,
  eventId: "e1",
  url: `https://picsum.photos/seed/${i + 10}/600/400`,
  thumbnailUrl: `https://picsum.photos/seed/${i + 10}/300/200`,
  facesCount: Math.floor(Math.random() * 4) + 1,
  tags: i % 3 === 0 ? ["portrait"] : i % 3 === 1 ? ["group"] : ["candid"],
  indexed: i < 20,
}));

// ─── Dummy search results ─────────────────────────────────────────────────────
export const DUMMY_MATCHES = [2, 5, 9, 14, 18, 21].map((seed, i) => ({
  _id: `match${i}`,
  url: `https://picsum.photos/seed/${seed + 10}/600/400`,
  thumbnailUrl: `https://picsum.photos/seed/${seed + 10}/300/200`,
  similarity: 0.97 - i * 0.04,
  tags: ["portrait"],
}));

// ─── Dummy stats ──────────────────────────────────────────────────────────────
export const DUMMY_PHOTOGRAPHER_STATS = {
  totalPhotos: 6312,
  totalEvents: 5,
  totalSearches: 2394,
  totalDownloads: 1209,
};

export const DUMMY_ADMIN_STATS = {
  totalUsers: 1847,
  totalPhotographers: 234,
  totalEvents: 892,
  totalPhotos: 124500,
  totalRevenue: 18420,
  storageUsedGB: 374,
};

export const DUMMY_ALL_USERS = [
  { _id: "u1", name: "Alex Johnson",   email: "photographer@demo.com", role: "photographer", createdAt: "2025-06-01", banned: false },
  { _id: "u2", name: "Sarah Williams", email: "admin@demo.com",        role: "admin",        createdAt: "2025-01-01", banned: false },
  { _id: "u3", name: "Mike Chen",      email: "user@demo.com",         role: "user",         createdAt: "2026-01-15", banned: false },
  { _id: "u4", name: "Emma Davis",     email: "emma@example.com",      role: "photographer", createdAt: "2025-09-10", banned: false },
  { _id: "u5", name: "James Wilson",   email: "james@example.com",     role: "user",         createdAt: "2026-02-20", banned: true  },
  { _id: "u6", name: "Priya Sharma",   email: "priya@example.com",     role: "photographer", createdAt: "2025-11-05", banned: false },
  { _id: "u7", name: "Tom Baker",      email: "tom@example.com",       role: "user",         createdAt: "2026-03-01", banned: false },
  { _id: "u8", name: "Lisa Park",      email: "lisa@example.com",      role: "user",         createdAt: "2026-03-10", banned: false },
];
