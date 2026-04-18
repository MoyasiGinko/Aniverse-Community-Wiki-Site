import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "thread"
  );
}

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

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as { title?: string; body?: string };
  const nextTitle = (payload.title || "").trim();
  const nextBody = (payload.body || "").trim();

  if (!nextTitle && !nextBody) {
    return NextResponse.json(
      { error: "title or body is required" },
      { status: 400 },
    );
  }

  let editedThread: {
    id: string;
    slug: string;
    communityId: string | null;
    authorId: string;
    title: string;
    body: string;
  } | null = null;
  let forbidden = false;

  await updateDb((db) => {
    const target = db.threads.find((entry) => entry.id === id);
    if (!target) {
      return db;
    }

    const canEdit =
      target.authorId === user.id ||
      user.role === "admin" ||
      user.role === "mod";
    if (!canEdit) {
      forbidden = true;
      return db;
    }

    const updatedTitle = nextTitle || target.title;
    const baseSlug = toSlug(updatedTitle);
    const needsNewSlug = updatedTitle !== target.title || !target.slug;

    let resolvedSlug = target.slug;
    if (needsNewSlug) {
      const hasConflict = db.threads.some(
        (entry) =>
          entry.id !== target.id &&
          entry.communityId === target.communityId &&
          entry.slug === baseSlug,
      );
      resolvedSlug = hasConflict
        ? `${baseSlug}-${target.id.slice(0, 6)}`
        : baseSlug;
    }

    const updated = {
      ...target,
      title: updatedTitle,
      body: nextBody || target.body,
      slug: resolvedSlug,
    };

    editedThread = {
      id: updated.id,
      slug: updated.slug,
      communityId: updated.communityId,
      authorId: updated.authorId,
      title: updated.title,
      body: updated.body,
    };

    return {
      ...db,
      threads: db.threads.map((entry) => (entry.id === id ? updated : entry)),
    };
  });

  if (!editedThread) {
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json({ thread: editedThread });
}
