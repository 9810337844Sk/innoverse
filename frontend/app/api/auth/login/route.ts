import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  banned: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Use the check_password SQL function (defined in schema)
    const { data, error } = await supabase
      .rpc("check_password", {
        p_email: email.toLowerCase().trim(),
        p_password: password,
      });

    if (error) {
      console.error("[login] password check error", error);
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const user = Array.isArray(data) ? data[0] as LoginUser | undefined : data as LoginUser | null;

    if (!user?.id) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (user.banned) {
      return NextResponse.json({ message: "Your account has been suspended" }, { status: 403 });
    }

    const safeUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    const token = Buffer.from(
      JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 7 * 86400000 })
    ).toString("base64");

    return NextResponse.json({ user: safeUser, token });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
