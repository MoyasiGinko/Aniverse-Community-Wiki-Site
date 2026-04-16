import crypto from "node:crypto";
import { cookies } from "next/headers";
import { readDb, type Role, type UserRecord } from "./db";
import { supabase } from "./supabase";

export const SESSION_COOKIE = "aniverse_session";

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_LEN = 64;

export function hashPassword(input: string): string {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const derived = crypto
    .scryptSync(input, salt, PASSWORD_KEY_LEN)
    .toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function hashLegacyPassword(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function verifyPassword(input: string, stored: string): boolean {
  if (!stored) {
    return false;
  }

  if (stored.startsWith("scrypt:")) {
    const [, salt, hash] = stored.split(":");
    if (!salt || !hash) {
      return false;
    }
    const derived = crypto
      .scryptSync(input, salt, PASSWORD_KEY_LEN)
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(derived, "hex"),
      Buffer.from(hash, "hex"),
    );
  }

  return hashLegacyPassword(input) === stored;
}

export function validatePasswordStrength(password: string): string | null {
  const checks = [
    password.length >= 10,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^\w\s]/.test(password),
  ];

  if (checks.every(Boolean)) {
    return null;
  }

  return "Password must be at least 10 chars and include uppercase, lowercase, number, and symbol.";
}

export function issueToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "")
  );
}

export async function getSessionUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { data: sessionRow, error: sessionError } = await supabase
      .from("app_sessions")
      .select("user_id")
      .eq("token", token)
      .maybeSingle();

    if (sessionError || !sessionRow?.user_id) {
      return null;
    }

    const { data: userRow, error: userError } = await supabase
      .from("app_users")
      .select("*")
      .eq("id", sessionRow.user_id)
      .maybeSingle();

    if (userError || !userRow) {
      return null;
    }

    return {
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      passwordHash: userRow.password_hash,
      provider: userRow.provider,
      role: userRow.role,
      bio: userRow.bio || "",
      avatarUrl: userRow.avatar_url || "",
      joinedAt: userRow.joined_at,
    };
  } catch {
    // Fallback path for environments where direct queries fail.
    const db = await readDb();
    const session = db.sessions.find((entry) => entry.token === token);
    if (!session) {
      return null;
    }
    return db.users.find((user) => user.id === session.userId) ?? null;
  }
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
