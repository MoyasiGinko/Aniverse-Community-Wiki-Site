import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: threadId, commentId } = await params;
  const payload = (await req.json()) as { value?: 1 | -1 };
  const db = await readDb();
  const commentExists = db.comments.some(
    (entry) => entry.id === commentId && entry.threadId === threadId,
  );

  if (!commentExists) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (payload.value !== 1 && payload.value !== -1) {
    return NextResponse.json(
      { error: "value must be 1 or -1" },
      { status: 400 },
    );
  }

  await updateDb((current) => {
    const withoutCurrent = current.commentVotes.filter(
      (vote) => !(vote.commentId === commentId && vote.userId === user.id),
    );

    return {
      ...current,
      commentVotes: [
        ...withoutCurrent,
        {
          commentId,
          userId: user.id,
          value: payload.value as 1 | -1,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: threadId, commentId } = await params;
  const db = await readDb();
  const commentExists = db.comments.some(
    (entry) => entry.id === commentId && entry.threadId === threadId,
  );

  if (!commentExists) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await updateDb((current) => {
    return {
      ...current,
      commentVotes: current.commentVotes.filter(
        (vote) => !(vote.commentId === commentId && vote.userId === user.id),
      ),
    };
  });

  return NextResponse.json({ ok: true });
}
