import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { updateDb } from "@/src/lib/db";

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;
  const payload = (await req.json()) as { body?: string };
  const nextBody = (payload.body || "").trim();

  if (!nextBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  let updated = false;
  let forbidden = false;

  await updateDb((db) => {
    const target = db.comments.find(
      (comment) => comment.id === commentId && comment.threadId === id,
    );
    if (!target) {
      return db;
    }

    const thread = db.threads.find((entry) => entry.id === id);
    const canManage =
      target.authorId === user.id ||
      thread?.authorId === user.id ||
      user.role === "admin" ||
      user.role === "mod";

    if (!canManage) {
      forbidden = true;
      return db;
    }

    updated = true;

    return {
      ...db,
      comments: db.comments.map((comment) =>
        comment.id === commentId ? { ...comment, body: nextBody } : comment,
      ),
    };
  });

  if (!updated) {
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;

  let removed = false;
  let forbidden = false;

  await updateDb((db) => {
    const target = db.comments.find(
      (comment) => comment.id === commentId && comment.threadId === id,
    );
    if (!target) {
      return db;
    }

    const thread = db.threads.find((entry) => entry.id === id);
    const canManage =
      target.authorId === user.id ||
      thread?.authorId === user.id ||
      user.role === "admin" ||
      user.role === "mod";

    if (!canManage) {
      forbidden = true;
      return db;
    }

    removed = true;

    const childCommentIds = new Set(
      db.comments
        .filter((comment) => comment.parentCommentId === commentId)
        .map((comment) => comment.id),
    );

    const deletedIds = new Set([commentId, ...childCommentIds]);

    return {
      ...db,
      comments: db.comments.filter((comment) => !deletedIds.has(comment.id)),
      commentVotes: db.commentVotes.filter(
        (vote) => !deletedIds.has(vote.commentId),
      ),
      reports: db.reports.filter(
        (report) =>
          !(report.type === "comment" && deletedIds.has(report.targetId)),
      ),
    };
  });

  if (!removed) {
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
