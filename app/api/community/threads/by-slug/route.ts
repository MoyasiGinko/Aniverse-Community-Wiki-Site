import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0;

export async function GET(req: Request) {
  const user = await getSessionUser();
  const db = await readDb();
  const url = new URL(req.url);
  const communitySlug = url.searchParams.get("communitySlug") || "";
  const threadSlug = url.searchParams.get("threadSlug") || "";

  if (!communitySlug || !threadSlug) {
    return NextResponse.json(
      { error: "communitySlug and threadSlug are required" },
      { status: 400 },
    );
  }

  const community = db.communities.find((item) => item.slug === communitySlug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const thread = db.threads.find((item) => {
    if (item.communityId !== community.id) {
      return false;
    }

    const fallbackSlug =
      item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || item.id.slice(0, 8);

    return (item.slug || fallbackSlug) === threadSlug;
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const updated = await updateDb((current) => ({
    ...current,
    threadViewEvents: [
      {
        id: crypto.randomUUID(),
        threadId: thread.id,
        userId: user?.id || null,
        createdAt: new Date().toISOString(),
      },
      ...current.threadViewEvents,
    ],
  }));

  const comments = updated.comments.filter(
    (item) => item.threadId === thread.id,
  );
  const votes = updated.threadVotes.filter(
    (item) => item.threadId === thread.id,
  );
  const saves = updated.threadSaves.filter(
    (item) => item.threadId === thread.id,
  );
  const shares = updated.threadShareEvents.filter(
    (item) => item.threadId === thread.id,
  );
  const views = updated.threadViewEvents.filter(
    (item) => item.threadId === thread.id,
  );
  const author = updated.users.find((entry) => entry.id === thread.authorId);
  const userVote = user
    ? updated.threadVotes.find(
        (item) => item.threadId === thread.id && item.userId === user.id,
      )?.value || 0
    : 0;
  const savedByMe = user
    ? updated.threadSaves.some(
        (item) => item.threadId === thread.id && item.userId === user.id,
      )
    : false;
  const sharedByMe = user
    ? updated.threadShareEvents.some(
        (item) => item.threadId === thread.id && item.userId === user.id,
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

  return NextResponse.json({ thread: enrichedThread, community });
}
