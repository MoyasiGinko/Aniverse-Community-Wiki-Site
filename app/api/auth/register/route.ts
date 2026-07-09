import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabaseServer";

export async function POST(req: Request) {
  let payload: {
    email?: string;
    username?: string;
    password?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.email || !payload.username || !payload.password) {
    return NextResponse.json(
      { error: "email, username and password are required" },
      { status: 400 }
    );
  }

  const email = payload.email.trim().toLowerCase();
  const username = payload.username.trim();

  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "Please provide a valid email." },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 24) {
    return NextResponse.json(
      { error: "Username must be between 3 and 24 characters." },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return NextResponse.json(
      { error: "Username can only contain letters, numbers, _, -, and ." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Registration failed" },
      { status: 400 }
    );
  }

  const { data: userRow } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
        username: userRow?.username || username,
        role: userRow?.role || "user",
        bio: userRow?.bio || "",
        avatarUrl: userRow?.avatar_url || "",
        joinedAt: userRow?.joined_at || data.user.created_at,
      },
    },
    { status: 201 }
  );
}
