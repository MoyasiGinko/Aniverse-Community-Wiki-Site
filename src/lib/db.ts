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
  slug: string;
  isHighlighted: boolean;
  communityId: string | null;
  wikiReferenceId: string | null;
  title: string;
  body: string;
  imageUrls: string[];
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

export interface CommentVoteRecord {
  commentId: string;
  userId: string;
  value: 1 | -1;
  createdAt: string;
}

export interface ThreadVoteRecord {
  threadId: string;
  userId: string;
  value: 1 | -1;
  createdAt: string;
}

export interface ThreadSaveRecord {
  threadId: string;
  userId: string;
  createdAt: string;
}

export interface ThreadViewRecord {
  threadId: string;
  userId: string;
  createdAt: string;
}

export interface ThreadViewEventRecord {
  id: string;
  threadId: string;
  userId: string | null;
  createdAt: string;
}

export interface ThreadShareRecord {
  threadId: string;
  userId: string;
  createdAt: string;
}

export interface ThreadShareEventRecord {
  id: string;
  threadId: string;
  userId: string | null;
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
  commentVotes: CommentVoteRecord[];
  threadVotes: ThreadVoteRecord[];
  threadSaves: ThreadSaveRecord[];
  threadViews: ThreadViewRecord[];
  threadViewEvents: ThreadViewEventRecord[];
  threadShares: ThreadShareRecord[];
  threadShareEvents: ThreadShareEventRecord[];
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
  slug: row.slug || "",
  isHighlighted: Boolean(row.is_highlighted),
  communityId: row.community_id || null,
  wikiReferenceId: row.wiki_reference_id || null,
  title: row.title,
  body: row.body,
  imageUrls: row.image_urls || [],
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

const toCommentVote = (row: any): CommentVoteRecord => ({
  commentId: row.comment_id,
  userId: row.user_id,
  value: row.value,
  createdAt: row.created_at,
});

const toThreadVote = (row: any): ThreadVoteRecord => ({
  threadId: row.thread_id,
  userId: row.user_id,
  value: row.value,
  createdAt: row.created_at,
});

const toThreadSave = (row: any): ThreadSaveRecord => ({
  threadId: row.thread_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

const toThreadView = (row: any): ThreadViewRecord => ({
  threadId: row.thread_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

const toThreadViewEvent = (row: any): ThreadViewEventRecord => ({
  id: row.id,
  threadId: row.thread_id,
  userId: row.user_id || null,
  createdAt: row.created_at,
});

const toThreadShare = (row: any): ThreadShareRecord => ({
  threadId: row.thread_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

const toThreadShareEvent = (row: any): ThreadShareEventRecord => ({
  id: row.id,
  threadId: row.thread_id,
  userId: row.user_id || null,
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
      if ((error as { code?: string }).code === "PGRST205") {
        return [];
      }
      console.warn(`[Supabase Select Error on ${table}]`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

function getMissingColumnFromSchemaCacheError(error: unknown): string | null {
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message || "")
      : "";
  const match = message.match(/Could not find the '([^']+)' column/);
  return match ? match[1] : null;
}

async function insertWithSchemaFallback(
  table: string,
  idColumn: string,
  rows: Record<string, unknown>[],
) {
  const conflictColumnsByTable: Record<string, string> = {
    app_watchlist: "user_id,anime_id",
    app_community_members: "community_id,user_id",
    app_thread_votes: "thread_id,user_id",
    app_thread_saves: "thread_id,user_id",
    app_thread_views: "thread_id,user_id",
    app_thread_shares: "thread_id,user_id",
    app_comment_votes: "comment_id,user_id",
  };
  const onConflict = conflictColumnsByTable[table] || idColumn;

  let payload = rows;
  const removedColumns = new Set<string>();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const insert = await supabase.from(table).insert(payload);
    if (!insert.error) {
      return;
    }

    const code = (insert.error as { code?: string }).code;
    if (code === "PGRST205") {
      return;
    }

    if (code === "PGRST204") {
      const missingColumn = getMissingColumnFromSchemaCacheError(insert.error);
      if (missingColumn) {
        removedColumns.add(missingColumn);
        payload = payload.map((row) => {
          const next = { ...row };
          delete next[missingColumn];
          return next;
        });
        continue;
      }
    }

    if (code === "23505") {
      const upsert = await supabase
        .from(table)
        .upsert(payload, { onConflict, ignoreDuplicates: false });
      if (!upsert.error) {
        return;
      }

      if ((upsert.error as { code?: string }).code === "PGRST204") {
        const missingColumn = getMissingColumnFromSchemaCacheError(
          upsert.error,
        );
        if (missingColumn) {
          removedColumns.add(missingColumn);
          payload = payload.map((row) => {
            const next = { ...row };
            delete next[missingColumn];
            return next;
          });
          continue;
        }
      }

      console.warn(`[Supabase Upsert Error on ${table}]`, upsert.error);
      return;
    }

    console.warn(`[Supabase Insert Error on ${table}]`, insert.error);
    return;
  }

  console.warn(
    `[Supabase Insert Error on ${table}] retried without columns: ${Array.from(removedColumns).join(", ")}`,
  );
}

async function replaceTable(
  table: string,
  idColumn: string,
  rows: Record<string, unknown>[],
) {
  try {
    const wipe = await supabase.from(table).delete().not(idColumn, "is", null);
    if (wipe.error) {
      if ((wipe.error as { code?: string }).code === "PGRST205") {
        return;
      }
      console.warn(`[Supabase Wipe Error on ${table}]`, wipe.error);
    }
  } catch (e) {
    if ((e as { code?: string }).code !== "PGRST205") {
      console.warn(`[Supabase Wipe Exception on ${table}]`, e);
    }
  }

  if (rows.length > 0) {
    try {
      await insertWithSchemaFallback(table, idColumn, rows);
    } catch (e) {
      if ((e as { code?: string }).code !== "PGRST205") {
        console.warn(`[Supabase Insert Exception on ${table}]`, e);
      }
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
    commentVotes,
    threadVotes,
    threadSaves,
    threadViews,
    threadViewEvents,
    threadShares,
    threadShareEvents,
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
    mustSelect("app_comment_votes"),
    mustSelect("app_thread_votes"),
    mustSelect("app_thread_saves"),
    mustSelect("app_thread_views"),
    mustSelect("app_thread_view_events"),
    mustSelect("app_thread_shares"),
    mustSelect("app_thread_share_events"),
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
    commentVotes: commentVotes.map(toCommentVote),
    threadVotes: threadVotes.map(toThreadVote),
    threadSaves: threadSaves.map(toThreadSave),
    threadViews: threadViews.map(toThreadView),
    threadViewEvents: threadViewEvents.map(toThreadViewEvent),
    threadShares: threadShares.map(toThreadShare),
    threadShareEvents: threadShareEvents.map(toThreadShareEvent),
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
      slug: thread.slug,
      is_highlighted: Boolean(thread.isHighlighted),
      community_id: thread.communityId,
      wiki_reference_id: thread.wikiReferenceId,
      title: thread.title,
      body: thread.body,
      image_urls: thread.imageUrls,
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
    "app_comment_votes",
    "user_id",
    data.commentVotes.map((vote) => ({
      comment_id: vote.commentId,
      user_id: vote.userId,
      value: vote.value,
      created_at: vote.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_votes",
    "user_id",
    data.threadVotes.map((vote) => ({
      thread_id: vote.threadId,
      user_id: vote.userId,
      value: vote.value,
      created_at: vote.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_saves",
    "user_id",
    data.threadSaves.map((save) => ({
      thread_id: save.threadId,
      user_id: save.userId,
      created_at: save.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_views",
    "user_id",
    data.threadViews.map((view) => ({
      thread_id: view.threadId,
      user_id: view.userId,
      created_at: view.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_view_events",
    "id",
    data.threadViewEvents.map((viewEvent) => ({
      id: viewEvent.id,
      thread_id: viewEvent.threadId,
      user_id: viewEvent.userId,
      created_at: viewEvent.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_shares",
    "user_id",
    data.threadShares.map((share) => ({
      thread_id: share.threadId,
      user_id: share.userId,
      created_at: share.createdAt,
    })),
  );

  await replaceTable(
    "app_thread_share_events",
    "id",
    data.threadShareEvents.map((shareEvent) => ({
      id: shareEvent.id,
      thread_id: shareEvent.threadId,
      user_id: shareEvent.userId,
      created_at: shareEvent.createdAt,
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
  if (
    !(globalThis as { __aniverseDbUpdateQueue?: Promise<void> })
      .__aniverseDbUpdateQueue
  ) {
    (
      globalThis as { __aniverseDbUpdateQueue?: Promise<void> }
    ).__aniverseDbUpdateQueue = Promise.resolve();
  }

  const queueState = globalThis as { __aniverseDbUpdateQueue?: Promise<void> };
  const previous = queueState.__aniverseDbUpdateQueue as Promise<void>;

  let release: () => void = () => {};
  queueState.__aniverseDbUpdateQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const current = await readDb();
    const next = await updater(current);
    await writeDb(next);
    return next;
  } finally {
    release();
  }
}
