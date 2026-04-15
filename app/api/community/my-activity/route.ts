import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../src/lib/auth';
import { readDb } from '../../../../src/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await readDb();
  const threads = db.threads
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const comments = db.comments
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const wiki = db.wiki
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json({
    activity: {
      threads,
      comments,
      wiki,
    },
  });
}
