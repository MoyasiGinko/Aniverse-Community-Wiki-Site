import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const authUser = data.user;
      const { data: existing } = await supabase
        .from("app_users")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!existing) {
        const rawMeta = authUser.user_metadata || {};
        const rawAppMeta = authUser.app_metadata || {};
        let username =
          rawMeta.username ||
          rawMeta.full_name ||
          rawMeta.name ||
          authUser.email?.split("@")[0] ||
          "user";
        username = username.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24);
        if (username.length < 3) {
          username = `${username}_user`;
        }
        let provider = rawAppMeta.provider || "google";
        if (provider === "email") {
          provider = "local";
        }
        const avatarUrl = rawMeta.avatar_url || rawMeta.picture || "";

        await supabase.from("app_users").upsert({
          id: authUser.id,
          email: authUser.email || "",
          username,
          password_hash: "",
          provider,
          role: "user",
          bio: "",
          avatar_url: avatarUrl,
          joined_at: authUser.created_at || new Date().toISOString(),
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth-code-error`);
}
