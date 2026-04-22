import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { updateDb } from "@/src/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await updateDb((state) => state);
  return NextResponse.json({
    items: db.watchlist.filter((entry) => entry.userId === user.id),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    animeId?: string;
    title?: string;
    imageUrl?: string;
  };
  if (!payload.animeId || !payload.title) {
    return NextResponse.json(
      { error: "animeId and title are required" },
      { status: 400 },
    );
  }

  const db = await updateDb((state) => {
    if (
      state.watchlist.some(
        (entry) =>
          entry.userId === user.id && entry.animeId === payload.animeId,
      )
    ) {
      return state;
    }

    return {
      ...state,
      watchlist: [
        ...state.watchlist,
        {
          userId: user.id,
          animeId: payload.animeId as string,
          title: payload.title as string,
          imageUrl: payload.imageUrl || "",
          addedAt: new Date().toISOString(),
        },
      ],
    };
  });

  return NextResponse.json({
    items: db.watchlist.filter((entry) => entry.userId === user.id),
  });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const animeId = url.searchParams.get("animeId");

  if (!animeId) {
    return NextResponse.json(
      { error: "animeId query param is required" },
      { status: 400 },
    );
  }

  const db = await updateDb((state) => ({
    ...state,
    watchlist: state.watchlist.filter(
      (entry) => !(entry.userId === user.id && entry.animeId === animeId),
    ),
  }));

  return NextResponse.json({
    items: db.watchlist.filter((entry) => entry.userId === user.id),
  });
}
