import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { updateDb } from "@/src/lib/db";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    type?: "thread" | "comment" | "wiki";
    targetId?: string;
    reason?: string;
  };

  if (!payload.type || !payload.targetId || !payload.reason) {
    return NextResponse.json(
      { error: "type, targetId and reason are required" },
      { status: 400 },
    );
  }

  await updateDb((db) => ({
    ...db,
    reports: [
      ...db.reports,
      {
        id: crypto.randomUUID(),
        type: payload.type as "thread" | "comment" | "wiki",
        targetId: payload.targetId as string,
        reason: payload.reason as string,
        reporterId: user.id,
        createdAt: new Date().toISOString(),
      },
    ],
  }));

  return NextResponse.json({ ok: true }, { status: 201 });
}
