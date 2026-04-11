import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../src/lib/auth';
import { readDb } from '../../../src/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await readDb();
  const watchlistCount = db.watchlist.filter((entry) => entry.userId === user.id).length;
  const wikiCount = db.wiki.filter((entry) => entry.authorId === user.id).length;
  const threadCount = db.threads.filter((entry) => entry.authorId === user.id).length;
  const commentCount = db.comments.filter((entry) => entry.authorId === user.id).length;

  const badges: string[] = [];
  if (watchlistCount >= 5) badges.push('Collector');
  if (wikiCount >= 1) badges.push('Scribe');
  if (threadCount + commentCount >= 3) badges.push('Community Spark');
  if (user.role === 'mod' || user.role === 'admin') badges.push('Guardian');

  return NextResponse.json({
    stats: {
      watchlistCount,
      wikiCount,
      threadCount,
      commentCount,
      badges,
    },
  });
}
