import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type Role = 'user' | 'mod' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  provider: 'local' | 'google' | 'discord';
  role: Role;
  bio: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface WatchlistRecord {
  userId: string;
  animeId: string;
  title: string;
  imageUrl: string;
  addedAt: string;
}

export interface WikiRecord {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: 'draft' | 'published' | 'flagged' | 'archived';
  authorId: string;
  updatedAt: string;
  createdAt: string;
  revision: number;
}

export interface CommunityThreadRecord {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
}

export interface CommunityCommentRecord {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  type: 'thread' | 'comment' | 'wiki';
  targetId: string;
  reason: string;
  reporterId: string;
  createdAt: string;
}

export interface AppDb {
  users: UserRecord[];
  sessions: SessionRecord[];
  watchlist: WatchlistRecord[];
  wiki: WikiRecord[];
  threads: CommunityThreadRecord[];
  comments: CommunityCommentRecord[];
  reports: ReportRecord[];
}

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const defaultDb: AppDb = {
  users: [],
  sessions: [],
  watchlist: [],
  wiki: [],
  threads: [],
  comments: [],
  reports: [],
};

export async function readDb(): Promise<AppDb> {
  try {
    const raw = await readFile(dbPath, 'utf-8');
    return { ...defaultDb, ...(JSON.parse(raw) as AppDb) };
  } catch {
    return { ...defaultDb };
  }
}

export async function writeDb(data: AppDb): Promise<void> {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function updateDb(updater: (db: AppDb) => AppDb | Promise<AppDb>): Promise<AppDb> {
  const current = await readDb();
  const next = await updater(current);
  await writeDb(next);
  return next;
}
