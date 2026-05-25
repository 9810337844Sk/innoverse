import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "token";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export type TokenPayload = {
  id: string;
  role: string;
  iat: number;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Missing AUTH_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createAuthToken(id: string, role: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { id, role, iat: now, exp: now + SESSION_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    const raw = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!raw) return null;

    const [encoded, suppliedSignature] = raw.split(".");
    if (!encoded || !suppliedSignature) return null;

    const expected = Buffer.from(signature(encoded));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.id || !payload.role || !payload.exp || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: NextResponse, token: string, secure: boolean) {
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
