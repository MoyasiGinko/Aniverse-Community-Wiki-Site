import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";
import { supabase } from "@/src/lib/supabase";

export const revalidate = 30;

export async function GET() {
  const user = await getSessionUser();

  const [communitiesRes, membersRes] = await Promise.all([
    supabase.from("app_communities").select("*"),
    supabase.from("app_community_members").select("community_id,user_id"),
  ]);

  if (communitiesRes.error || membersRes.error) {
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

  const communitiesRows = communitiesRes.data || [];
  const membersRows = membersRes.data || [];

  const memberCountByCommunity = new Map<string, number>();
  for (const member of membersRows) {
    memberCountByCommunity.set(
      member.community_id,
      (memberCountByCommunity.get(member.community_id) || 0) + 1,
    );
  }

  const joinedCommunityIds = new Set(
    user
      ? membersRows
          .filter((member) => member.user_id === user.id)
          .map((member) => member.community_id)
      : [],
  );

  const communities = communitiesRows
    .map((community) => ({
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description || "",
      category: community.category || "General",
      bannerUrl: community.banner_url || "",
      iconUrl: community.icon_url || "",
      ownerId: community.owner_id,
      createdAt: community.created_at,
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
    iconUrl?: string;
    bannerUrl?: string;
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
    bannerUrl: payload.bannerUrl?.trim() || "",
    iconUrl: payload.iconUrl?.trim() || "",
    ownerId: user.id,
    createdAt: new Date().toISOString(),
  };

  await updateDb((d) => ({ ...d, communities: [community, ...d.communities] }));
  return NextResponse.json({ community }, { status: 201 });
}
