import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb } from "@/src/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const threads = db.threads
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const comments = db.comments
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const wiki = db.wiki
    .filter((entry) => entry.authorId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const communityById = new Map(
    db.communities.map((entry) => [entry.id, entry]),
  );
  const threadById = new Map(db.threads.map((entry) => [entry.id, entry]));

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
    },
  });
}
