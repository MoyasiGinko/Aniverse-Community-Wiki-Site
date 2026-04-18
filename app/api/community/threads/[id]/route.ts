import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getSessionUser();
  const db = await readDb();

  const thread = db.threads.find((item) => item.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const updated = await updateDb((current) => ({
    ...current,
    threadViewEvents: [
      {
        id: crypto.randomUUID(),
        threadId: id,
        userId: user?.id || null,
        createdAt: new Date().toISOString(),
      },
      ...current.threadViewEvents,
    ],
  }));

  const comments = updated.comments.filter((item) => item.threadId === id);
  const votes = updated.threadVotes.filter((item) => item.threadId === id);
  const saves = updated.threadSaves.filter((item) => item.threadId === id);
  const shares = updated.threadShareEvents.filter(
    (item) => item.threadId === id,
  );
  const views = updated.threadViewEvents.filter((item) => item.threadId === id);
  const author = updated.users.find((entry) => entry.id === thread.authorId);
  const userVote = user
    ? updated.threadVotes.find(
        (item) => item.threadId === id && item.userId === user.id,
      )?.value || 0
    : 0;
  const savedByMe = user
    ? updated.threadSaves.some(
        (item) => item.threadId === id && item.userId === user.id,
      )
    : false;
  const sharedByMe = user
    ? updated.threadShareEvents.some(
        (item) => item.threadId === id && item.userId === user.id,
      )
    : false;

  const enrichedThread = {
    ...thread,
    author: author
      ? {
          id: author.id,
          username: author.username,
          avatarUrl: author.avatarUrl,
        }
      : null,
    stats: {
      upvotes: votes.filter((item) => item.value === 1).length,
      downvotes: votes.filter((item) => item.value === -1).length,
      saves: saves.length,
      shares: shares.length,
      views: views.length,
      comments: comments.length,
    },
    userVote,
    savedByMe,
    sharedByMe,
  };

  return NextResponse.json({ thread: enrichedThread });
}
