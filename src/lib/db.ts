import { supabase } from './supabase';

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

const toUser = (row: any): UserRecord => ({
  id: row.id,
  email: row.email,
  username: row.username,
  passwordHash: row.password_hash,
  provider: row.provider,
  role: row.role,
  bio: row.bio || '',
  avatarUrl: row.avatar_url || '',
  joinedAt: row.joined_at,
});

const toSession = (row: any): SessionRecord => ({
  token: row.token,
  userId: row.user_id,
  createdAt: row.created_at,
});

const toWatchlist = (row: any): WatchlistRecord => ({
  userId: row.user_id,
  animeId: row.anime_id,
  title: row.title,
  imageUrl: row.image_url || '',
  addedAt: row.added_at,
});

const toWiki = (row: any): WikiRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  body: row.body,
  tags: row.tags || [],
  status: row.status,
  authorId: row.author_id,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  revision: row.revision,
});

const toThread = (row: any): CommunityThreadRecord => ({
  id: row.id,
  title: row.title,
  body: row.body,
  authorId: row.author_id,
  createdAt: row.created_at,
});

const toComment = (row: any): CommunityCommentRecord => ({
  id: row.id,
  threadId: row.thread_id,
  body: row.body,
  authorId: row.author_id,
  createdAt: row.created_at,
});

const toReport = (row: any): ReportRecord => ({
  id: row.id,
  type: row.type,
  targetId: row.target_id,
  reason: row.reason,
  reporterId: row.reporter_id,
  createdAt: row.created_at,
});

async function mustSelect(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    throw error;
  }
  return data || [];
}

async function replaceTable(table: string, idColumn: string, rows: Record<string, unknown>[]) {
  const wipe = await supabase.from(table).delete().not(idColumn, 'is', null);
  if (wipe.error) {
    throw wipe.error;
  }

  if (rows.length > 0) {
    const insert = await supabase.from(table).insert(rows);
    if (insert.error) {
      throw insert.error;
    }
  }
}

export async function readDb(): Promise<AppDb> {
  const [users, sessions, watchlist, wiki, threads, comments, reports] = await Promise.all([
    mustSelect('app_users'),
    mustSelect('app_sessions'),
    mustSelect('app_watchlist'),
    mustSelect('app_wiki_entries'),
    mustSelect('app_threads'),
    mustSelect('app_comments'),
    mustSelect('app_reports'),
  ]);

  return {
    users: users.map(toUser),
    sessions: sessions.map(toSession),
    watchlist: watchlist.map(toWatchlist),
    wiki: wiki.map(toWiki),
    threads: threads.map(toThread),
    comments: comments.map(toComment),
    reports: reports.map(toReport),
  };
}

export async function writeDb(data: AppDb): Promise<void> {
  await replaceTable('app_users', 'id', data.users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    password_hash: user.passwordHash,
    provider: user.provider,
    role: user.role,
    bio: user.bio,
    avatar_url: user.avatarUrl,
    joined_at: user.joinedAt,
  })));

  await replaceTable('app_sessions', 'token', data.sessions.map((session) => ({
    token: session.token,
    user_id: session.userId,
    created_at: session.createdAt,
  })));

  await replaceTable('app_watchlist', 'anime_id', data.watchlist.map((entry) => ({
    user_id: entry.userId,
    anime_id: entry.animeId,
    title: entry.title,
    image_url: entry.imageUrl,
    added_at: entry.addedAt,
  })));

  await replaceTable('app_wiki_entries', 'id', data.wiki.map((entry) => ({
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    body: entry.body,
    tags: entry.tags,
    status: entry.status,
    author_id: entry.authorId,
    updated_at: entry.updatedAt,
    created_at: entry.createdAt,
    revision: entry.revision,
  })));

  await replaceTable('app_threads', 'id', data.threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    body: thread.body,
    author_id: thread.authorId,
    created_at: thread.createdAt,
  })));

  await replaceTable('app_comments', 'id', data.comments.map((comment) => ({
    id: comment.id,
    thread_id: comment.threadId,
    body: comment.body,
    author_id: comment.authorId,
    created_at: comment.createdAt,
  })));

  await replaceTable('app_reports', 'id', data.reports.map((report) => ({
    id: report.id,
    type: report.type,
    target_id: report.targetId,
    reason: report.reason,
    reporter_id: report.reporterId,
    created_at: report.createdAt,
  })));
}

export async function updateDb(updater: (db: AppDb) => AppDb | Promise<AppDb>): Promise<AppDb> {
  const current = await readDb();
  const next = await updater(current);
  await writeDb(next);
  return next;
}
