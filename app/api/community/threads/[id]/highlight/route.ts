import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageThreadHighlight(
  userId: string,
  userRole: string,
  threadCommunityId: string,
  db: Awaited<ReturnType<typeof readDb>>,
) {
  if (userRole === "admin") {
    return true;
  }

  const community = db.communities.find(
    (entry) => entry.id === threadCommunityId,
  );
  if (!community) {
    return false;
  }

  if (community.ownerId === userId) {
    return true;
  }

  const membership = db.communityMembers.find(
    (entry) =>
      entry.communityId === threadCommunityId && entry.userId === userId,
  );
  return membership?.role === "admin" || membership?.role === "mod";
}

async function updateHighlight(id: string, highlighted: boolean) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const thread = db.threads.find((entry) => entry.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (!thread.communityId) {
    return NextResponse.json(
      { error: "Only community threads can be highlighted" },
      { status: 400 },
    );
  }

  const allowed = canManageThreadHighlight(
    user.id,
    user.role,
    thread.communityId,
    db,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await updateDb((current) => ({
    ...current,
    threads: current.threads.map((entry) =>
      entry.id === id ? { ...entry, isHighlighted: highlighted } : entry,
    ),
  }));

  return NextResponse.json({ success: true, highlighted });
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return updateHighlight(id, true);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return updateHighlight(id, false);
}
