import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0; // Turn off cache since it's personal feeds now

export async function GET(req: Request) {
  const user = await getSessionUser();
  const db = await readDb();
  const url = new URL(req.url);
  const communityId = url.searchParams.get("communityId");
  const wikiReferenceId = url.searchParams.get("wikiReferenceId");

  let threads = db.threads;

  if (communityId) {
    threads = threads.filter((t) => t.communityId === communityId);
  } else if (wikiReferenceId) {
    threads = threads.filter((t) => t.wikiReferenceId === wikiReferenceId);
  } else {
    // Default feed: joined/followed communities for authenticated users.
    if (user) {
      const joinedCommunityIds = new Set(
        db.communityMembers
          .filter((member) => member.userId === user.id)
          .map((member) => member.communityId),
      );
      threads = threads.filter(
        (thread) =>
          thread.communityId && joinedCommunityIds.has(thread.communityId),
      );
    } else {
      threads = [];
    }
  }

  return NextResponse.json({
    threads: threads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
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
  };
  if (!payload.title || !payload.body) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const thread = {
    id: crypto.randomUUID(),
    title: payload.title,
    body: payload.body,
    communityId: payload.communityId || null,
    wikiReferenceId: payload.wikiReferenceId || null,
    authorId: user.id,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => ({ ...db, threads: [thread, ...db.threads] }));
  return NextResponse.json({ thread }, { status: 201 });
}
