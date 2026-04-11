import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { issueToken, publicUser, SESSION_COOKIE } from '../../../../src/lib/auth';
import { updateDb, type UserRecord } from '../../../../src/lib/db';

export async function POST(req: Request) {
  const payload = (await req.json()) as { provider?: 'google' | 'discord'; email?: string; username?: string };

  if (!payload.provider || !payload.email) {
    return NextResponse.json({ error: 'provider and email are required' }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  const username = payload.username?.trim() || email.split('@')[0] || 'member';

  let activeUser: UserRecord | null = null;
  const token = issueToken();

  await updateDb((db) => {
    const existing = db.users.find((entry) => entry.email === email);
    if (existing) {
      activeUser = existing;
      return {
        ...db,
        sessions: [
          ...db.sessions.filter((entry) => entry.userId !== existing.id),
          { token, userId: existing.id, createdAt: new Date().toISOString() },
        ],
      };
    }

    const user: UserRecord = {
      id: crypto.randomUUID(),
      email,
      username,
      passwordHash: '',
      provider: payload.provider,
      role: 'user',
      bio: '',
      avatarUrl: '',
      joinedAt: new Date().toISOString(),
    };
    activeUser = user;
    return {
      ...db,
      users: [...db.users, user],
      sessions: [...db.sessions, { token, userId: user.id, createdAt: new Date().toISOString() }],
    };
  });

  const res = NextResponse.json({ user: activeUser ? publicUser(activeUser) : null });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
