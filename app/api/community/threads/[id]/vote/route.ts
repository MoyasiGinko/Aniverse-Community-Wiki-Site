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
  const payload = (await req.json()) as { value?: 1 | -1 };
  if (payload.value !== 1 && payload.value !== -1) {
    return NextResponse.json(
      { error: "Vote value must be 1 or -1" },
      { status: 400 },
    );
  }

  const db = await readDb();
  const thread = db.threads.find((item) => item.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  await updateDb((current) => {
    const others = current.threadVotes.filter(
      (vote) => !(vote.threadId === id && vote.userId === user.id),
    );

    return {
      ...current,
      threadVotes: [
        {
          threadId: id,
          userId: user.id,
          value: payload.value as 1 | -1,
          createdAt: new Date().toISOString(),
        },
        ...others,
      ],
    };
  });

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
    threadVotes: current.threadVotes.filter(
      (vote) => !(vote.threadId === id && vote.userId === user.id),
    ),
  }));

  return NextResponse.json({ ok: true });
}
