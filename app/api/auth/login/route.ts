import { NextResponse } from 'next/server';
import { issueToken, publicUser, SESSION_COOKIE, verifyPassword } from '@/src/lib/auth';
import { updateDb } from '@/src/lib/db';

export async function POST(req: Request) {
  const payload = (await req.json()) as { email?: string; password?: string };

  if (!payload.email || !payload.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  const token = issueToken();

  let foundUserId = '';
  let publicPayload: ReturnType<typeof publicUser> | null = null;

  await updateDb((db) => {
    const user = db.users.find((entry) => entry.email === email && verifyPassword(payload.password as string, entry.passwordHash));
    if (!user) {
      return db;
    }

    foundUserId = user.id;
    publicPayload = publicUser(user);

    return {
      ...db,
      sessions: [
        ...db.sessions.filter((entry) => entry.userId !== user.id),
        { token, userId: user.id, createdAt: new Date().toISOString() },
      ],
    };
  });

  if (!publicPayload || !foundUserId) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ user: publicPayload });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
