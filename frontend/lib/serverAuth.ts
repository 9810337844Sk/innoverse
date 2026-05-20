/**
 * Server-side helper — decode the base64 token from the Authorization header
 * or the `token` cookie and return the user id + role.
 * Token format: base64(JSON.stringify({ id, role, exp }))
 */
import { NextRequest } from "next/server";

type TokenPayload = { id: string; role: string; exp: number };

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  try {
    // Try Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");
    const raw = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("token")?.value;

    if (!raw) return null;

    const payload = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as TokenPayload;

    // Check expiry
    if (payload.exp && payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
