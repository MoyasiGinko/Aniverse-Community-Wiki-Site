import { NextResponse } from 'next/server';
import { hashPassword, issueToken, publicUser, SESSION_COOKIE } from '../../../../src/lib/auth';
import { updateDb } from '../../../../src/lib/db';

export async function POST(req: Request) {
  const payload = (await req.json()) as { email?: string; password?: string };

  if (!payload.email || !payload.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  const hash = hashPassword(payload.password);
  const token = issueToken();

  let foundUserId = '';
  let publicPayload: ReturnType<typeof publicUser> | null = null;

  await updateDb((db) => {
    const user = db.users.find((entry) => entry.email === email && entry.passwordHash === hash);
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
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
