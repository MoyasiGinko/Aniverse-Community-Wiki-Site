import { NextResponse } from 'next/server';
import { getSessionUser, hasRole } from '@/src/lib/auth';
import { readDb } from '@/src/lib/db';

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user, ['mod', 'admin'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = await readDb();
  return NextResponse.json({ reports: db.reports });
}
