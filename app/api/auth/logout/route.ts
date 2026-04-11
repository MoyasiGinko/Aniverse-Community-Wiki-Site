import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../../../../src/lib/auth';
import { updateDb } from '../../../../src/lib/db';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await updateDb((db) => ({
      ...db,
      sessions: db.sessions.filter((entry) => entry.token !== token),
    }));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
