import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = await readDb();
  const thread = db.threads.find((item) => item.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const requestUrl = new URL(req.url);
  const mode =
    requestUrl.searchParams.get("mode") === "unique" ? "unique" : "event";

  await updateDb((current) => {
    const now = new Date().toISOString();

    const nextState = {
      ...current,
      threadShareEvents: [
        {
          id: crypto.randomUUID(),
          threadId: id,
          userId: user.id,
          createdAt: now,
        },
        ...current.threadShareEvents,
      ],
    };

    if (mode === "event") {
      return nextState;
    }

    const exists = current.threadShares.some(
      (share) => share.threadId === id && share.userId === user.id,
    );

    if (exists) {
      return nextState;
    }

    return {
      ...nextState,
      threadShares: [
        {
          threadId: id,
          userId: user.id,
          createdAt: now,
        },
        ...nextState.threadShares,
      ],
    };
  });

  return NextResponse.json({ ok: true, mode });
}
