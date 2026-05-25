import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/serverAuth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "photographer" && user.role !== "admin") {
      return NextResponse.json({ message: "Only photographers can upload profile photos" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Select an image file" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Profile photo must be under 5 MB" }, { status: 400 });
    }

    const folder = `photofly/photographers/${user.id}/profile`;
    const { url } = await uploadToCloudinary(
      Buffer.from(await file.arrayBuffer()),
      "avatar",
      folder,
      { overwrite: true }
    );

    const { error } = await supabase.from("users").update({ avatar: url }).eq("id", user.id);
    if (error) throw error;

    return NextResponse.json({ avatar: url });
  } catch (err) {
    console.error("[POST /api/profile/avatar]", err);
    return NextResponse.json({ message: "Failed to upload profile photo" }, { status: 500 });
  }
}
