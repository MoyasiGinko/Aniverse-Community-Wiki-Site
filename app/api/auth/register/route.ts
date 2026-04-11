import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { hashPassword, issueToken, publicUser, SESSION_COOKIE } from '../../../../src/lib/auth';
import { updateDb } from '../../../../src/lib/db';

export async function POST(req: Request) {
  const payload = (await req.json()) as {
    email?: string;
    username?: string;
    password?: string;
  };

  if (!payload.email || !payload.username || !payload.password) {
    return NextResponse.json({ error: 'email, username and password are required' }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  const username = payload.username.trim();
  const passwordHash = hashPassword(payload.password);

  const userId = crypto.randomUUID();
  const token = issueToken();

  let createdUser: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    provider: 'local';
    role: 'user';
    bio: string;
    avatarUrl: string;
    joinedAt: string;
  } | null = null;

  const next = await updateDb((db) => {
    if (db.users.some((entry) => entry.email === email)) {
      return db;
    }

    createdUser = {
      id: userId,
      email,
      username,
      passwordHash,
      provider: 'local',
      role: 'user',
      bio: '',
      avatarUrl: '',
      joinedAt: new Date().toISOString(),
    };

    return {
      ...db,
      users: [...db.users, createdUser],
      sessions: [...db.sessions, { token, userId, createdAt: new Date().toISOString() }],
    };
  });

  if (!createdUser) {
    return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
  }

  const res = NextResponse.json({ user: publicUser(createdUser) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
