import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { readDb, updateDb } from '@/src/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  return NextResponse.json({
    comments: db.comments
      .filter((entry) => entry.threadId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((comment) => ({
        ...comment,
        authorName: db.users.find((user) => user.id === comment.authorId)?.username || 'Unknown',
      })),
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await req.json()) as { body?: string; parentCommentId?: string | null };

  if (!payload.body) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
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
    if (parentId && !db.comments.some((entry) => entry.id === parentId && entry.threadId === id)) {
      return db;
    }
    created = true;
    return { ...db, comments: [...db.comments, comment] };
  });

  if (!created) {
    return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
