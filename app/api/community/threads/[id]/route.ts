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

  const payload = (await req.json()) as {
    title?: string;
    body?: string;
    imageUrls?: string[];
  };
  const nextTitle = (payload.title || "").trim();
  const nextBody = (payload.body || "").trim();
  const nextImageUrls = Array.isArray(payload.imageUrls)
    ? payload.imageUrls.map((item) => item.trim()).filter(Boolean)
    : null;

  if (!nextTitle && !nextBody && nextImageUrls === null) {
    return NextResponse.json(
      { error: "title, body, or imageUrls is required" },
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
    imageUrls: string[];
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
      imageUrls: nextImageUrls ?? target.imageUrls,
      slug: resolvedSlug,
    };

    editedThread = {
      id: updated.id,
      slug: updated.slug,
      communityId: updated.communityId,
      authorId: updated.authorId,
      title: updated.title,
      body: updated.body,
      imageUrls: updated.imageUrls,
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

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let removed = false;
  let forbidden = false;

  await updateDb((db) => {
    const target = db.threads.find((entry) => entry.id === id);
    if (!target) {
      return db;
    }

    const canDelete =
      target.authorId === user.id ||
      user.role === "admin" ||
      user.role === "mod";
    if (!canDelete) {
      forbidden = true;
      return db;
    }

    removed = true;

    const commentIds = new Set(
      db.comments
        .filter((comment) => comment.threadId === id)
        .map((comment) => comment.id),
    );

    return {
      ...db,
      threads: db.threads.filter((entry) => entry.id !== id),
      comments: db.comments.filter((comment) => comment.threadId !== id),
      commentVotes: db.commentVotes.filter(
        (vote) => !commentIds.has(vote.commentId),
      ),
      threadVotes: db.threadVotes.filter((vote) => vote.threadId !== id),
      threadSaves: db.threadSaves.filter((save) => save.threadId !== id),
      threadViews: db.threadViews.filter((view) => view.threadId !== id),
      threadViewEvents: db.threadViewEvents.filter(
        (view) => view.threadId !== id,
      ),
      threadShares: db.threadShares.filter((share) => share.threadId !== id),
      threadShareEvents: db.threadShareEvents.filter(
        (share) => share.threadId !== id,
      ),
      reports: db.reports.filter(
        (report) =>
          !(
            (report.type === "thread" && report.targetId === id) ||
            (report.type === "comment" && commentIds.has(report.targetId))
          ),
      ),
    };
  });

  if (!removed) {
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
