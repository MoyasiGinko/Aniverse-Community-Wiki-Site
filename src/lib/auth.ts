import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { readDb, type Role, type UserRecord } from './db';

export const SESSION_COOKIE = 'aniverse_session';

export function hashPassword(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function issueToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

export async function getSessionUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  return db.users.find((user) => user.id === session.userId) ?? null;
}

export function hasRole(user: UserRecord | null, allowed: Role[]): boolean {
  if (!user) {
    return false;
  }
  return allowed.includes(user.role);
}

export function publicUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    joinedAt: user.joinedAt,
  };
}
