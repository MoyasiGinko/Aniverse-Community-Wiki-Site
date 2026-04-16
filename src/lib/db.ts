import { supabase } from "./supabase";

export type Role = "user" | "mod" | "admin";

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  provider: "local" | "google" | "discord" | "facebook" | "github";
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

export interface CommunityRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  bannerUrl: string;
  iconUrl: string;
  ownerId: string;
  createdAt: string;
}

export interface CommunityMemberRecord {
  communityId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface WikiRecord {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: "draft" | "published" | "flagged" | "archived";
  malAnimeId: number | null;
  malAnimeTitle: string;
  coverImageUrl: string;
  extraImageUrls: string[];
  authorId: string;
  communityId: string | null;
  updatedAt: string;
  createdAt: string;
  revision: number;
}

export interface WikiCommentRecord {
  id: string;
  entryId: string;
  parentCommentId: string | null;
  body: string;
  authorId: string;
  createdAt: string;
}

export interface CommunityThreadRecord {
  id: string;
  communityId: string | null;
  wikiReferenceId: string | null;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
}

export interface CommunityCommentRecord {
  id: string;
  threadId: string;
  parentCommentId: string | null;
  body: string;
  authorId: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  type: "thread" | "comment" | "wiki" | "community";
  targetId: string;
  reason: string;
  reporterId: string;
  createdAt: string;
}

export interface AppDb {
  users: UserRecord[];
  sessions: SessionRecord[];
  watchlist: WatchlistRecord[];
  communities: CommunityRecord[];
  communityMembers: CommunityMemberRecord[];
  wiki: WikiRecord[];
  wikiComments: WikiCommentRecord[];
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
  bio: row.bio || "",
  avatarUrl: row.avatar_url || "",
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
  imageUrl: row.image_url || "",
  addedAt: row.added_at,
});

const toCommunity = (row: any): CommunityRecord => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description || "",
  category: row.category,
  bannerUrl: row.banner_url || "",
  iconUrl: row.icon_url || "",
  ownerId: row.owner_id,
  createdAt: row.created_at,
});

const toCommunityMember = (row: any): CommunityMemberRecord => ({
  communityId: row.community_id,
  userId: row.user_id,
  role: row.role,
  joinedAt: row.joined_at,
});

const toWiki = (row: any): WikiRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  body: row.body,
  tags: row.tags || [],
  status: row.status,
  malAnimeId: row.mal_anime_id ?? null,
  malAnimeTitle: row.mal_anime_title || "",
  coverImageUrl: row.cover_image_url || "",
  extraImageUrls: row.extra_image_urls || [],
  authorId: row.author_id,
  communityId: row.community_id || null,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  revision: row.revision,
});

const toThread = (row: any): CommunityThreadRecord => ({
  id: row.id,
  communityId: row.community_id || null,
  wikiReferenceId: row.wiki_reference_id || null,
  title: row.title,
  body: row.body,
  authorId: row.author_id,
  createdAt: row.created_at,
});

const toWikiComment = (row: any): WikiCommentRecord => ({
  id: row.id,
  entryId: row.entry_id,
  parentCommentId: row.parent_comment_id || null,
  body: row.body,
  authorId: row.author_id,
  createdAt: row.created_at,
});

const toComment = (row: any): CommunityCommentRecord => ({
  id: row.id,
  threadId: row.thread_id,
  parentCommentId: row.parent_comment_id || null,
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
  try {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.warn(`[Supabase Select Error on ${table}]`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

async function replaceTable(
  table: string,
  idColumn: string,
  rows: Record<string, unknown>[],
) {
  try {
    const wipe = await supabase.from(table).delete().not(idColumn, "is", null);
    if (wipe.error) {
      console.warn(`[Supabase Wipe Error on ${table}]`, wipe.error);
    }
  } catch (e) {
    console.warn(`[Supabase Wipe Exception on ${table}]`, e);
  }

  if (rows.length > 0) {
    try {
      const insert = await supabase.from(table).insert(rows);
      if (insert.error) {
        console.warn(`[Supabase Insert Error on ${table}]`, insert.error);
      }
    } catch (e) {
      console.warn(`[Supabase Insert Exception on ${table}]`, e);
    }
  }
}

export async function readDb(): Promise<AppDb> {
  const [
    users,
    sessions,
    watchlist,
    communities,
    communityMembers,
    wiki,
    wikiComments,
    threads,
    comments,
    reports,
  ] = await Promise.all([
    mustSelect("app_users"),
    mustSelect("app_sessions"),
    mustSelect("app_watchlist"),
    mustSelect("app_communities"),
    mustSelect("app_community_members"),
    mustSelect("app_wiki_entries"),
    mustSelect("app_wiki_comments"),
    mustSelect("app_threads"),
    mustSelect("app_comments"),
    mustSelect("app_reports"),
  ]);

  return {
    users: users.map(toUser),
    sessions: sessions.map(toSession),
    watchlist: watchlist.map(toWatchlist),
    communities: communities.map(toCommunity),
    communityMembers: communityMembers.map(toCommunityMember),
    wiki: wiki.map(toWiki),
    wikiComments: wikiComments.map(toWikiComment),
    threads: threads.map(toThread),
    comments: comments.map(toComment),
    reports: reports.map(toReport),
  };
}

export async function writeDb(data: AppDb): Promise<void> {
  await replaceTable(
    "app_users",
    "id",
    data.users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      password_hash: user.passwordHash,
      provider: user.provider,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatarUrl,
      joined_at: user.joinedAt,
    })),
  );

  await replaceTable(
    "app_sessions",
    "token",
    data.sessions.map((session) => ({
      token: session.token,
      user_id: session.userId,
      created_at: session.createdAt,
    })),
  );

  await replaceTable(
    "app_watchlist",
    "anime_id",
    data.watchlist.map((entry) => ({
      user_id: entry.userId,
      anime_id: entry.animeId,
      title: entry.title,
      image_url: entry.imageUrl,
      added_at: entry.addedAt,
    })),
  );

  await replaceTable(
    "app_communities",
    "id",
    data.communities.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      category: c.category,
      banner_url: c.bannerUrl,
      icon_url: c.iconUrl,
      owner_id: c.ownerId,
      created_at: c.createdAt,
    })),
  );

  await replaceTable(
    "app_community_members",
    "user_id",
    data.communityMembers.map((m) => ({
      community_id: m.communityId,
      user_id: m.userId,
      role: m.role,
      joined_at: m.joinedAt,
    })),
  );

  await replaceTable(
    "app_wiki_entries",
    "id",
    data.wiki.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      body: entry.body,
      tags: entry.tags,
      status: entry.status,
      mal_anime_id: entry.malAnimeId,
      mal_anime_title: entry.malAnimeTitle,
      cover_image_url: entry.coverImageUrl,
      extra_image_urls: entry.extraImageUrls,
      author_id: entry.authorId,
      community_id: entry.communityId,
      updated_at: entry.updatedAt,
      created_at: entry.createdAt,
      revision: entry.revision,
    })),
  );

  await replaceTable(
    "app_wiki_comments",
    "id",
    data.wikiComments.map((comment) => ({
      id: comment.id,
      entry_id: comment.entryId,
      parent_comment_id: comment.parentCommentId,
      body: comment.body,
      author_id: comment.authorId,
      created_at: comment.createdAt,
    })),
  );

  await replaceTable(
    "app_threads",
    "id",
    data.threads.map((thread) => ({
      id: thread.id,
      community_id: thread.communityId,
      wiki_reference_id: thread.wikiReferenceId,
      title: thread.title,
      body: thread.body,
      author_id: thread.authorId,
      created_at: thread.createdAt,
    })),
  );

  await replaceTable(
    "app_comments",
    "id",
    data.comments.map((comment) => ({
      id: comment.id,
      thread_id: comment.threadId,
      parent_comment_id: comment.parentCommentId,
      body: comment.body,
      author_id: comment.authorId,
      created_at: comment.createdAt,
    })),
  );

  await replaceTable(
    "app_reports",
    "id",
    data.reports.map((report) => ({
      id: report.id,
      type: report.type,
      target_id: report.targetId,
      reason: report.reason,
      reporter_id: report.reporterId,
      created_at: report.createdAt,
    })),
  );
}

export async function updateDb(
  updater: (db: AppDb) => AppDb | Promise<AppDb>,
): Promise<AppDb> {
  const current = await readDb();
  const next = await updater(current);
  await writeDb(next);
  return next;
}
