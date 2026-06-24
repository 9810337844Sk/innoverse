import { NextRequest, NextResponse } from "next/server";
import { createAuthToken, setAuthCookie } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  banned: boolean;
};

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetsAt: number }>();

function attemptKey(req: NextRequest, email: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  return `${ip}:${email}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string };

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const key = attemptKey(req, normalizedEmail);
    const previous = loginAttempts.get(key);
    if (previous && previous.resetsAt > Date.now() && previous.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }
    const failedAttempts = previous && previous.resetsAt > Date.now() ? previous.count : 0;

    // Use the check_password SQL function (defined in schema)
    const { data, error } = await supabase
      .rpc("check_password", {
        p_email: normalizedEmail,
        p_password: password,
      });

    if (error) {
      console.error("[login] password check error", error);
      loginAttempts.set(key, { count: failedAttempts + 1, resetsAt: Date.now() + ATTEMPT_WINDOW_MS });
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const user = Array.isArray(data) ? data[0] as LoginUser | undefined : data as LoginUser | null;

    if (!user?.id) {
      loginAttempts.set(key, { count: failedAttempts + 1, resetsAt: Date.now() + ATTEMPT_WINDOW_MS });
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (user.banned) {
      loginAttempts.set(key, { count: failedAttempts + 1, resetsAt: Date.now() + ATTEMPT_WINDOW_MS });
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("avatar")
      .eq("id", user.id)
      .maybeSingle();

    const safeUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      avatar: profile?.avatar ?? null,
    };

    loginAttempts.delete(key);
    const response = NextResponse.json({ user: safeUser });
    setAuthCookie(response, createAuthToken(user.id, user.role), req.nextUrl.protocol === "https:");
    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
