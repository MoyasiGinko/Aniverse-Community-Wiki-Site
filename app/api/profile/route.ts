import { NextResponse } from 'next/server';
import { getSessionUser, publicUser } from '../../../src/lib/auth';
import { updateDb } from '../../../src/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ profile: publicUser(user) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await req.json()) as { username?: string; bio?: string; avatarUrl?: string };

  await updateDb((db) => ({
    ...db,
    users: db.users.map((entry) => {
      if (entry.id !== user.id) {
        return entry;
      }
      return {
        ...entry,
        username: payload.username?.trim() || entry.username,
        bio: payload.bio ?? entry.bio,
        avatarUrl: payload.avatarUrl ?? entry.avatarUrl,
      };
    }),
  }));

  return NextResponse.json({ ok: true });
}
