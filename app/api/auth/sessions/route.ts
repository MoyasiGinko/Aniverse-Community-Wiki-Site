import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";
import { supabase } from "@/src/lib/supabase";

type SessionScope = "single" | "others" | "all";

function normalizeScope(value: unknown): SessionScope {
  if (value === "others" || value === "all") {
    return value;
  }
  return "single";
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value || "";

  try {
    const { data, error } = await supabase
      .from("app_sessions")
      .select("token,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const sessions = (data || []).map((session) => ({
      token: session.token,
      createdAt: session.created_at,
      isCurrent: session.token === currentToken,
    }));

    return NextResponse.json({ sessions });
  } catch {
    const db = await readDb();
    const sessions = db.sessions
      .filter((session) => session.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((session) => ({
        token: session.token,
        createdAt: session.createdAt,
        isCurrent: session.token === currentToken,
      }));

    return NextResponse.json({ sessions });
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value || "";

  const payload = (await req.json().catch(() => ({}))) as {
    token?: string;
    scope?: SessionScope;
  };

  const scope = normalizeScope(payload.scope);

  const next = await updateDb((db) => ({
    ...db,
    sessions: db.sessions.filter((session) => {
      if (session.userId !== user.id) {
        return true;
      }

      if (scope === "all") {
        return false;
      }

      if (scope === "others") {
        return session.token === currentToken;
      }

      if (!payload.token) {
        return true;
      }

      return session.token !== payload.token;
    }),
  }));

  const shouldClearCurrent =
    scope === "all" || (scope === "single" && payload.token === currentToken);

  const sessions = next.sessions
    .filter((session) => session.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((session) => ({
      token: session.token,
      createdAt: session.createdAt,
      isCurrent: session.token === currentToken,
    }));

  const res = NextResponse.json({ ok: true, sessions });
  if (shouldClearCurrent) {
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  }

  return res;
}
