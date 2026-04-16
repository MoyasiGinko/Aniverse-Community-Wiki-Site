import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword, validatePasswordStrength, verifyPassword } from '@/src/lib/auth';
import { updateDb } from '@/src/lib/db';

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.provider !== 'local') {
    return NextResponse.json({ error: 'Password updates are only available for local accounts.' }, { status: 400 });
  }

  const payload = (await req.json()) as { currentPassword?: string; newPassword?: string };
  if (!payload.currentPassword || !payload.newPassword) {
    return NextResponse.json({ error: 'currentPassword and newPassword are required' }, { status: 400 });
  }

  if (!verifyPassword(payload.currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const validationError = validatePasswordStrength(payload.newPassword);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  await updateDb((db) => ({
    ...db,
    users: db.users.map((entry) => (
      entry.id === user.id
        ? { ...entry, passwordHash: hashPassword(payload.newPassword as string) }
        : entry
    )),
  }));

  return NextResponse.json({ ok: true });
}