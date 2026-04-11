import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../src/lib/auth';
import { readDb, updateDb, type WikiRecord } from '../../../src/lib/db';

export const revalidate = 60;

export async function GET() {
  const db = await readDb();
  return NextResponse.json({
    entries: db.wiki.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await req.json()) as {
    title?: string;
    body?: string;
    tags?: string[];
    status?: WikiRecord['status'];
  };

  if (!payload.title || !payload.body) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
  }

  const slug = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const entry: WikiRecord = {
    id: crypto.randomUUID(),
    slug,
    title: payload.title,
    body: payload.body,
    tags: payload.tags || [],
    status: payload.status || 'draft',
    authorId: user.id,
    revision: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await updateDb((db) => ({ ...db, wiki: [entry, ...db.wiki] }));
  return NextResponse.json({ entry }, { status: 201 });
}
