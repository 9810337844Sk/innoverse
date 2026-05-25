/**
 * API layer — all calls go through Next.js API routes which use
 * the Supabase service-role key server-side.
 * The browser never sees the service-role key.
 */

const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

function getAuthHeaders(): HeadersInit {
  return {};
}

async function request(method: string, url: string, data?: unknown): Promise<{ data: unknown }> {
  await delay();

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (url.includes("/auth/login")) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/auth/register")) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/auth/verify-register")) {
    const res = await fetch("/api/auth/verify-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────
  if (url.includes("/events")) {
    // GET single event
    if (method === "GET" && url.match(/\/events\/[^/?]+$/)) {
      const id = url.split("/").pop()!;
      const res = await fetch(`/api/events/${id}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok) throw { response: { data: json } };
      return { data: json };
    }

    // GET list
    if (method === "GET") {
      const limitMatch = url.match(/limit=(\d+)/);
      const limit = limitMatch ? limitMatch[1] : "50";
      const res = await fetch(`/api/events?limit=${limit}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok) throw { response: { data: json } };
      return { data: json };
    }

    // POST create
    if (method === "POST") {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw { response: { data: json } };
      return { data: json };
    }

    // PATCH update
    if (method === "PATCH" && url.match(/\/events\/[^/?]+$/)) {
      const id = url.split("/").pop()!;
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw { response: { data: json } };
      return { data: json };
    }

    // DELETE
    if (method === "DELETE") {
      const id = url.split("/").pop()!;
      const res = await fetch(`/api/events/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok) throw { response: { data: json } };
      return { data: json };
    }
  }

  // ── PHOTOS ────────────────────────────────────────────────────────────────
  if (url.includes("/photos/upload"))  return { data: { photos: [], count: 0 } };
  if (url.includes("/photos/index"))   return { data: { message: "Indexing started" } };
  if (url.includes("/photos") && method === "DELETE") return { data: { message: "Deleted" } };
  if (url.includes("/photos"))         return { data: { photos: [], total: 0 } };

  // ── SEARCH ────────────────────────────────────────────────────────────────
  if (url.includes("/search/face")) {
    return { data: { matches: [], eventName: "Demo Event", total: 0 } };
  }

  // ── STATS ─────────────────────────────────────────────────────────────────
  if (url.includes("/photographer/stats")) {
    const res = await fetch("/api/photographer/stats", { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/stats")) {
    const res = await fetch("/api/admin/stats", { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/users") && method === "GET") {
    const res = await fetch("/api/admin/users", { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/users") && method === "PATCH") {
    const id = url.split("/admin/users/")[1].split("/")[0];
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/users") && method === "DELETE") {
    const id = url.split("/admin/users/")[1];
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/events") && method === "PATCH") {
    const res = await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/admin/events")) {
    const res = await fetch("/api/admin/events", { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (url.includes("/payments")) return { data: { url: "#" } };

  return { data: {} };
}

const api = {
  get:    (url: string, _?: unknown)                    => request("GET",    url),
  post:   (url: string, data?: unknown, _?: unknown)    => request("POST",   url, data),
  patch:  (url: string, data?: unknown)                 => request("PATCH",  url, data),
  delete: (url: string)                                 => request("DELETE", url),
  put:    (url: string, data?: unknown)                 => request("PUT",    url, data),
};

export default api;
