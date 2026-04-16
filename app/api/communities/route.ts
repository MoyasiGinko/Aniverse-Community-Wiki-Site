import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 30;

export async function GET() {
  const user = await getSessionUser();
  const db = await readDb();
  const memberCountByCommunity = new Map<string, number>();
  for (const member of db.communityMembers) {
    memberCountByCommunity.set(
      member.communityId,
      (memberCountByCommunity.get(member.communityId) || 0) + 1,
    );
  }

  const joinedCommunityIds = new Set(
    user
      ? db.communityMembers
          .filter((member) => member.userId === user.id)
          .map((member) => member.communityId)
      : [],
  );

  const communities = db.communities
    .map((community) => ({
      ...community,
      memberCount: memberCountByCommunity.get(community.id) || 0,
      joined: joinedCommunityIds.has(community.id),
    }))
    .sort((a, b) => {
      if (b.memberCount !== a.memberCount) {
        return b.memberCount - a.memberCount;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

  return NextResponse.json(
    {
      communities,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    slug?: string;
    name?: string;
    description?: string;
    category?: string;
  };
  if (!payload.slug || !payload.name) {
    return NextResponse.json(
      { error: "Slug and name are required" },
      { status: 400 },
    );
  }

  const cleanSlug = payload.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const db = await readDb();
  if (db.communities.some((c) => c.slug === cleanSlug)) {
    return NextResponse.json(
      { error: "Community slug already exists" },
      { status: 409 },
    );
  }

  const community = {
    id: crypto.randomUUID(),
    slug: cleanSlug,
    name: payload.name.trim(),
    description: payload.description || "",
    category: payload.category || "General",
    bannerUrl: "",
    iconUrl: "",
    ownerId: user.id,
    createdAt: new Date().toISOString(),
  };

  await updateDb((d) => ({ ...d, communities: [community, ...d.communities] }));
  return NextResponse.json({ community }, { status: 201 });
}
