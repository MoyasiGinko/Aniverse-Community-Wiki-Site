import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb } from "@/src/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const threadById = new Map(db.threads.map((entry) => [entry.id, entry]));
  const communityById = new Map(
    db.communities.map((entry) => [entry.id, entry]),
  );
  const userById = new Map(db.users.map((entry) => [entry.id, entry]));

  const threads = db.threads
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({
      ...entry,
      communitySlug: entry.communityId
        ? (communityById.get(entry.communityId)?.slug ?? null)
        : null,
    }));

  const comments = db.comments
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => {
      const thread = threadById.get(entry.threadId);
      const community = thread?.communityId
        ? communityById.get(thread.communityId)
        : null;
      return {
        ...entry,
        threadTitle: thread?.title || "Unknown thread",
        threadSlug: thread?.slug || "",
        communitySlug: community?.slug || null,
      };
    });

  const wiki = db.wiki
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const userThreadIds = new Set(threads.map((entry) => entry.id));
  const managedReplies = db.comments
    .filter((entry) => userThreadIds.has(entry.threadId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => {
      const thread = threadById.get(entry.threadId);
      const community = thread?.communityId
        ? communityById.get(thread.communityId)
        : null;
      const author = userById.get(entry.authorId);
      return {
        ...entry,
        threadTitle: thread?.title || "Unknown thread",
        threadSlug: thread?.slug || "",
        communitySlug: community?.slug || null,
        authorName: author?.username || "Unknown",
        isMine: entry.authorId === user.id,
      };
    });

  const savedThreads = db.threadSaves
    .filter((entry) => entry.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((save) => {
      const thread = threadById.get(save.threadId);
      if (!thread) {
        return null;
      }

      const community = thread.communityId
        ? communityById.get(thread.communityId)
        : null;

      return {
        id: thread.id,
        slug: thread.slug,
        title: thread.title,
        body: thread.body,
        savedAt: save.createdAt,
        communitySlug: community?.slug || null,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    activity: {
      threads,
      comments,
      wiki,
      savedThreads,
      managedReplies,
    },
  });
}
