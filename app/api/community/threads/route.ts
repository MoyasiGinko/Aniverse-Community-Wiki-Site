import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";
import { supabase } from "@/src/lib/supabase";

export const revalidate = 0; // Turn off cache since it's personal feeds now

export async function GET(req: Request) {
  const user = await getSessionUser();
  const url = new URL(req.url);
  const communityId = url.searchParams.get("communityId");
  const wikiReferenceId = url.searchParams.get("wikiReferenceId");
  const mode = url.searchParams.get("mode") || "feed";
  const limit = Math.max(
    1,
    Math.min(50, Number.parseInt(url.searchParams.get("limit") || "50", 10)),
  );
  const shareMode =
    url.searchParams.get("shareMode") === "unique" ? "unique" : "event";

  const selectOrEmpty = async (table: string, columns = "*") => {
    const { data, error } = await supabase.from(table).select(columns);
    if (error && (error as { code?: string }).code !== "PGRST205") {
      throw error;
    }
    return data || [];
  };

  const [
    threadsRows,
    commentsRows,
    votesRows,
    savesRows,
    viewEventRows,
    shareRows,
    shareEventRows,
    userRows,
    memberRows,
  ] = await Promise.all([
    selectOrEmpty("app_threads"),
    selectOrEmpty("app_comments", "thread_id"),
    selectOrEmpty("app_thread_votes", "thread_id,user_id,value"),
    selectOrEmpty("app_thread_saves", "thread_id,user_id"),
    selectOrEmpty("app_thread_view_events", "thread_id"),
    selectOrEmpty("app_thread_shares", "thread_id,user_id"),
    selectOrEmpty("app_thread_share_events", "thread_id,user_id"),
    selectOrEmpty("app_users", "id,username,avatar_url"),
    selectOrEmpty("app_community_members", "community_id,user_id"),
  ]);

  const threadsBase = threadsRows.map((row) => ({
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
  }));

  let threads = threadsBase;

  if (communityId) {
    threads = threads.filter((t) => t.communityId === communityId);
  } else if (wikiReferenceId) {
    threads = threads.filter((t) => t.wikiReferenceId === wikiReferenceId);
  } else if (mode === "trending") {
    threads = threadsBase;
  } else {
    // Default feed: joined/followed communities plus threads authored by the viewer.
    if (user) {
      const joinedCommunityIds = new Set(
        memberRows
          .filter((member) => member.user_id === user.id)
          .map((member) => member.community_id),
      );
      threads = threads.filter(
        (thread) =>
          (thread.communityId && joinedCommunityIds.has(thread.communityId)) ||
          thread.authorId === user.id,
      );
    } else {
      threads = [];
    }
  }

  const commentsCountByThread = new Map<string, number>();
  for (const comment of commentsRows) {
    commentsCountByThread.set(
      comment.thread_id,
      (commentsCountByThread.get(comment.thread_id) || 0) + 1,
    );
  }

  const upvotesByThread = new Map<string, number>();
  const downvotesByThread = new Map<string, number>();
  for (const vote of votesRows) {
    if (vote.value === 1) {
      upvotesByThread.set(
        vote.thread_id,
        (upvotesByThread.get(vote.thread_id) || 0) + 1,
      );
    }
    if (vote.value === -1) {
      downvotesByThread.set(
        vote.thread_id,
        (downvotesByThread.get(vote.thread_id) || 0) + 1,
      );
    }
  }

  const savesByThread = new Map<string, number>();
  for (const save of savesRows) {
    savesByThread.set(
      save.thread_id,
      (savesByThread.get(save.thread_id) || 0) + 1,
    );
  }

  const viewsByThread = new Map<string, number>();
  for (const view of viewEventRows) {
    viewsByThread.set(
      view.thread_id,
      (viewsByThread.get(view.thread_id) || 0) + 1,
    );
  }

  const sharesByThread = new Map<string, number>();
  const shareSource = shareMode === "unique" ? shareRows : shareEventRows;
  for (const share of shareSource) {
    sharesByThread.set(
      share.thread_id,
      (sharesByThread.get(share.thread_id) || 0) + 1,
    );
  }

  const savedByMe = new Set(
    user
      ? savesRows
          .filter((save) => save.user_id === user.id)
          .map((save) => save.thread_id)
      : [],
  );

  const sharedByMe = new Set(
    user
      ? shareEventRows
          .filter((share) => share.user_id === user.id)
          .map((share) => share.thread_id)
      : [],
  );

  const userVoteByThread = new Map<string, 1 | -1>();
  if (user) {
    for (const vote of votesRows) {
      if (vote.user_id === user.id) {
        userVoteByThread.set(vote.thread_id, vote.value);
      }
    }
  }

  const userById = new Map(
    userRows.map((item) => [
      item.id,
      {
        id: item.id,
        username: item.username,
        avatarUrl: item.avatar_url || "",
      },
    ]),
  );
  const enrichedThreads = threads
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((thread) => {
      const author = userById.get(thread.authorId);
      const fallbackSlug =
        thread.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || thread.id.slice(0, 8);
      return {
        ...thread,
        slug: thread.slug || fallbackSlug,
        author: author
          ? {
              id: author.id,
              username: author.username,
              avatarUrl: author.avatarUrl,
            }
          : null,
        stats: {
          upvotes: upvotesByThread.get(thread.id) || 0,
          downvotes: downvotesByThread.get(thread.id) || 0,
          saves: savesByThread.get(thread.id) || 0,
          shares: sharesByThread.get(thread.id) || 0,
          views: viewsByThread.get(thread.id) || 0,
          comments: commentsCountByThread.get(thread.id) || 0,
        },
        savedByMe: savedByMe.has(thread.id),
        sharedByMe: sharedByMe.has(thread.id),
        userVote: userVoteByThread.get(thread.id) || 0,
      };
    });

  const scoredThreads =
    mode === "trending"
      ? [...enrichedThreads]
          .sort((a, b) => {
            const scoreA =
              a.stats.upvotes * 3 -
              a.stats.downvotes * 2 +
              a.stats.comments * 2 +
              a.stats.shares * 2 +
              a.stats.saves +
              a.stats.views * 0.2;
            const scoreB =
              b.stats.upvotes * 3 -
              b.stats.downvotes * 2 +
              b.stats.comments * 2 +
              b.stats.shares * 2 +
              b.stats.saves +
              b.stats.views * 0.2;
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            return b.createdAt.localeCompare(a.createdAt);
          })
          .slice(0, limit)
      : enrichedThreads;

  return NextResponse.json({ threads: scoredThreads, shareMode, mode });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    title?: string;
    body?: string;
    communityId?: string;
    wikiReferenceId?: string;
    imageUrls?: string[];
  };
  if (!payload.title || !payload.body) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const thread = {
    id: crypto.randomUUID(),
    slug: "",
    isHighlighted: false,
    title: payload.title,
    body: payload.body,
    communityId: payload.communityId || null,
    wikiReferenceId: payload.wikiReferenceId || null,
    imageUrls: Array.isArray(payload.imageUrls)
      ? payload.imageUrls
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
          .slice(0, 8)
      : [],
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };

  const db = await readDb();
  const baseSlug =
    payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64) || crypto.randomUUID().slice(0, 8);
  const sameCommunityThreads = db.threads.filter(
    (entry) => entry.communityId === thread.communityId,
  );
  let candidateSlug = baseSlug;
  let index = 2;
  while (sameCommunityThreads.some((entry) => entry.slug === candidateSlug)) {
    candidateSlug = `${baseSlug}-${index}`;
    index += 1;
  }
  thread.slug = candidateSlug;

  await updateDb((current) => ({
    ...current,
    threads: [thread, ...current.threads],
  }));
  return NextResponse.json({ thread }, { status: 201 });
}
