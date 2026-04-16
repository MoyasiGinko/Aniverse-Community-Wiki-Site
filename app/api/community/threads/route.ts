import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0; // Turn off cache since it's personal feeds now

export async function GET(req: Request) {
  const user = await getSessionUser();
  const db = await readDb();
  const url = new URL(req.url);
  const communityId = url.searchParams.get("communityId");
  const wikiReferenceId = url.searchParams.get("wikiReferenceId");

  let threads = db.threads;

  if (communityId) {
    threads = threads.filter((t) => t.communityId === communityId);
  } else if (wikiReferenceId) {
    threads = threads.filter((t) => t.wikiReferenceId === wikiReferenceId);
  } else {
    // Default feed: joined/followed communities for authenticated users.
    if (user) {
      const joinedCommunityIds = new Set(
        db.communityMembers
          .filter((member) => member.userId === user.id)
          .map((member) => member.communityId),
      );
      threads = threads.filter(
        (thread) =>
          thread.communityId && joinedCommunityIds.has(thread.communityId),
      );
    } else {
      threads = [];
    }
  }

  const commentsCountByThread = new Map<string, number>();
  for (const comment of db.comments) {
    commentsCountByThread.set(
      comment.threadId,
      (commentsCountByThread.get(comment.threadId) || 0) + 1,
    );
  }

  const upvotesByThread = new Map<string, number>();
  const downvotesByThread = new Map<string, number>();
  for (const vote of db.threadVotes) {
    if (vote.value === 1) {
      upvotesByThread.set(
        vote.threadId,
        (upvotesByThread.get(vote.threadId) || 0) + 1,
      );
    }
    if (vote.value === -1) {
      downvotesByThread.set(
        vote.threadId,
        (downvotesByThread.get(vote.threadId) || 0) + 1,
      );
    }
  }

  const savesByThread = new Map<string, number>();
  for (const save of db.threadSaves) {
    savesByThread.set(
      save.threadId,
      (savesByThread.get(save.threadId) || 0) + 1,
    );
  }

  const viewsByThread = new Map<string, number>();
  for (const view of db.threadViews) {
    viewsByThread.set(
      view.threadId,
      (viewsByThread.get(view.threadId) || 0) + 1,
    );
  }

  const savedByMe = new Set(
    user
      ? db.threadSaves
          .filter((save) => save.userId === user.id)
          .map((save) => save.threadId)
      : [],
  );

  const userById = new Map(db.users.map((item) => [item.id, item]));
  const enrichedThreads = threads
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((thread) => {
      const author = userById.get(thread.authorId);
      return {
        ...thread,
        author: author
          ? {
              id: author.id,
              username: author.username,
              avatarUrl: author.avatarUrl,
            }
          : null,
        stats: {
          upvotes: upvotesByThread.get(thread.id) || 0,
          downvotes: downvotesByThread.get(thread.id) || 0,
          saves: savesByThread.get(thread.id) || 0,
          views: viewsByThread.get(thread.id) || 0,
          comments: commentsCountByThread.get(thread.id) || 0,
        },
        savedByMe: savedByMe.has(thread.id),
      };
    });

  return NextResponse.json({ threads: enrichedThreads });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    title?: string;
    body?: string;
    communityId?: string;
    wikiReferenceId?: string;
    imageUrls?: string[];
  };
  if (!payload.title || !payload.body) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const thread = {
    id: crypto.randomUUID(),
    title: payload.title,
    body: payload.body,
    communityId: payload.communityId || null,
    wikiReferenceId: payload.wikiReferenceId || null,
    imageUrls: Array.isArray(payload.imageUrls)
      ? payload.imageUrls
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
          .slice(0, 8)
      : [],
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => ({ ...db, threads: [thread, ...db.threads] }));
  return NextResponse.json({ thread }, { status: 201 });
}
