import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../../src/lib/auth';
import { readDb, updateDb } from '../../../../../src/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const entry = db.wiki.find((item) => item.id === id || item.slug === id);

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const comments = db.wikiComments
    .filter((comment) => comment.entryId === entry.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((comment) => ({
      ...comment,
      authorName: db.users.find((user) => user.id === comment.authorId)?.username || 'Unknown',
    }));

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await req.json()) as { body?: string; parentCommentId?: string | null };

  if (!payload.body || !payload.body.trim()) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const next = await updateDb((db) => {
    const entry = db.wiki.find((item) => item.id === id || item.slug === id);
    if (!entry) {
      return db;
    }

    const parentId = payload.parentCommentId || null;
    if (parentId && !db.wikiComments.some((comment) => comment.id === parentId && comment.entryId === entry.id)) {
      return db;
    }

    return {
      ...db,
      wikiComments: [
        ...db.wikiComments,
        {
          id: crypto.randomUUID(),
          entryId: entry.id,
          parentCommentId: parentId,
          body: payload.body!.trim(),
          authorId: user.id,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  const db = await readDb();
  const entry = db.wiki.find((item) => item.id === id || item.slug === id);

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    comments: next.wikiComments.filter((comment) => comment.entryId === entry.id),
  }, { status: 201 });
}
