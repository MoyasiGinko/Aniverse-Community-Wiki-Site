import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../src/lib/auth';
import { readDb, updateDb } from '../../../../src/lib/db';

export const revalidate = 30;

export async function GET() {
  const db = await readDb();
  return NextResponse.json({
    threads: db.threads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await req.json()) as { title?: string; body?: string };
  if (!payload.title || !payload.body) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
  }

  const thread = {
    id: crypto.randomUUID(),
    title: payload.title,
    body: payload.body,
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => ({ ...db, threads: [thread, ...db.threads] }));
  return NextResponse.json({ thread }, { status: 201 });
}
