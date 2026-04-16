import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: RouteContext) {
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

  const exists = db.threadSaves.some(
    (save) => save.threadId === id && save.userId === user.id,
  );
  if (!exists) {
    await updateDb((current) => ({
      ...current,
      threadSaves: [
        {
          threadId: id,
          userId: user.id,
          createdAt: new Date().toISOString(),
        },
        ...current.threadSaves,
      ],
    }));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await updateDb((current) => ({
    ...current,
    threadSaves: current.threadSaves.filter(
      (save) => !(save.threadId === id && save.userId === user.id),
    ),
  }));

  return NextResponse.json({ ok: true });
}
