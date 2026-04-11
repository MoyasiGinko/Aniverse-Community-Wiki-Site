import { NextResponse } from 'next/server';
import { getSessionUser, hasRole } from '../../../../../src/lib/auth';
import { updateDb } from '../../../../../src/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!hasRole(user, ['mod', 'admin'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const payload = (await req.json()) as { action?: 'publish' | 'flag' | 'archive' };

  const statusByAction = {
    publish: 'published',
    flag: 'flagged',
    archive: 'archived',
  } as const;

  const nextStatus = payload.action ? statusByAction[payload.action] : undefined;
  if (!nextStatus) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await updateDb((db) => ({
    ...db,
    wiki: db.wiki.map((entry) => (
      entry.id === id || entry.slug === id
        ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
        : entry
    )),
  }));

  return NextResponse.json({ ok: true });
}
