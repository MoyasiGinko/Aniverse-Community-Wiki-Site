import crypto from "node:crypto";
import { cookies } from "next/headers";
import { readDb, type Role, type UserRecord } from "./db";
import { createClient } from "./supabaseServer";

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
    
    const derivedBuf = Buffer.from(derived, "hex");
    const hashBuf = Buffer.from(hash, "hex");
    
    if (derivedBuf.length !== hashBuf.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      new Uint8Array(derivedBuf),
      new Uint8Array(hashBuf),
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
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return null;
    }

    let { data: userRow, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!userRow) {
      const rawMeta = authUser.user_metadata || {};
      const rawAppMeta = authUser.app_metadata || {};
      let username =
        rawMeta.username ||
        rawMeta.full_name ||
        rawMeta.name ||
        authUser.email?.split("@")[0] ||
        "user";
      username = username.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24);
      if (username.length < 3) {
        username = `${username}_user`;
      }
      let provider = rawAppMeta.provider || "google";
      if (provider === "email") {
        provider = "local";
      }
      const avatarUrl = rawMeta.avatar_url || rawMeta.picture || "";

      const newUserRow = {
        id: authUser.id,
        email: authUser.email || "",
        username,
        password_hash: "",
        provider,
        role: "user",
        bio: "",
        avatar_url: avatarUrl,
        joined_at: authUser.created_at || new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from("app_users")
        .upsert(newUserRow)
        .select()
        .single();

      if (!insertError && inserted) {
        userRow = inserted;
      }
    }

    if (!userRow) {
      const rawMeta = authUser.user_metadata || {};
      const rawAppMeta = authUser.app_metadata || {};
      let username =
        rawMeta.username ||
        rawMeta.full_name ||
        rawMeta.name ||
        authUser.email?.split("@")[0] ||
        "user";
      username = username.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24);
      if (username.length < 3) {
        username = `${username}_user`;
      }
      let provider = rawAppMeta.provider || "google";
      if (provider === "email") {
        provider = "local";
      }

      return {
        id: authUser.id,
        email: authUser.email || "",
        username,
        passwordHash: "",
        provider: provider as any,
        role: "user",
        bio: "",
        avatarUrl: rawMeta.avatar_url || rawMeta.picture || "",
        joinedAt: authUser.created_at || new Date().toISOString(),
      };
    }

    return {
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      passwordHash: userRow.password_hash || "",
      provider: userRow.provider || "local",
      role: (userRow.role as Role) || "user",
      bio: userRow.bio || "",
      avatarUrl: userRow.avatar_url || "",
      joinedAt: userRow.joined_at,
    };
  } catch {
    return null;
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
