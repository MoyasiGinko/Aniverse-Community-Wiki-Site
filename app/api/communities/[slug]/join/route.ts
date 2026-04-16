import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const community = db.communities.find((c) => c.slug === slug);

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const isMember = db.communityMembers.some(
    (m) => m.communityId === community.id && m.userId === user.id,
  );
  if (isMember) {
    return NextResponse.json({ success: true, message: "Already a member" });
  }

  const newMember = {
    communityId: community.id,
    userId: user.id,
    role: "member",
    joinedAt: new Date().toISOString(),
  };

  await updateDb((d) => ({
    ...d,
    communityMembers: [...d.communityMembers, newMember],
  }));

  return NextResponse.json(
    { success: true, member: newMember },
    { status: 201 },
  );
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const community = db.communities.find((c) => c.slug === slug);

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  await updateDb((d) => ({
    ...d,
    communityMembers: d.communityMembers.filter(
      (m) => !(m.communityId === community.id && m.userId === user.id),
    ),
  }));

  return NextResponse.json({ success: true });
}
