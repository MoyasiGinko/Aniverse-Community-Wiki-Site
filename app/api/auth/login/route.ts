import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabaseServer";

export async function POST(req: Request) {
  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.email || !payload.password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const email = payload.email.trim().toLowerCase();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: payload.password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Invalid credentials" },
      { status: 401 }
    );
  }

  const { data: userRow } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      username: userRow?.username || email.split("@")[0] || "user",
      role: userRow?.role || "user",
      bio: userRow?.bio || "",
      avatarUrl: userRow?.avatar_url || "",
      joinedAt: userRow?.joined_at || data.user.created_at,
    },
  });
}
