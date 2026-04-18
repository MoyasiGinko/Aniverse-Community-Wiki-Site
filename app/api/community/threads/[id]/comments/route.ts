import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();
  const db = await readDb();
  const threadComments = db.comments
    .filter((entry) => entry.threadId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const replyCountByParent = new Map<string, number>();
  for (const comment of threadComments) {
    if (!comment.parentCommentId) continue;
    replyCountByParent.set(
      comment.parentCommentId,
      (replyCountByParent.get(comment.parentCommentId) || 0) + 1,
    );
  }

  const votesByComment = new Map<
    string,
    { upvotes: number; downvotes: number }
  >();
  for (const vote of db.commentVotes) {
    const current = votesByComment.get(vote.commentId) || {
      upvotes: 0,
      downvotes: 0,
    };
    if (vote.value === 1) current.upvotes += 1;
    if (vote.value === -1) current.downvotes += 1;
    votesByComment.set(vote.commentId, current);
  }

  const userVoteByComment = new Map<string, 1 | -1>();
  if (user) {
    for (const vote of db.commentVotes) {
      if (vote.userId === user.id) {
        userVoteByComment.set(vote.commentId, vote.value);
      }
    }
  }

  return NextResponse.json({
    comments: threadComments.map((comment) => ({
      ...comment,
      authorName:
        db.users.find((user) => user.id === comment.authorId)?.username ||
        "Unknown",
      replyCount: replyCountByParent.get(comment.id) || 0,
      stats: votesByComment.get(comment.id) || { upvotes: 0, downvotes: 0 },
      userVote: userVoteByComment.get(comment.id) || 0,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await req.json()) as {
    body?: string;
    parentCommentId?: string | null;
  };

  if (!payload.body) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const parentId = payload.parentCommentId || null;
  const comment = {
    id: crypto.randomUUID(),
    threadId: id,
    parentCommentId: parentId,
    body: payload.body,
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };

  let created = false;
  await updateDb((db) => {
    if (
      parentId &&
      !db.comments.some(
        (entry) => entry.id === parentId && entry.threadId === id,
      )
    ) {
      return db;
    }
    created = true;
    return { ...db, comments: [...db.comments, comment] };
  });

  if (!created) {
    return NextResponse.json(
      { error: "Invalid parent comment" },
      { status: 400 },
    );
  }

  return NextResponse.json({ comment }, { status: 201 });
}
