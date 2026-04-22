import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await readDb();
  const entry = db.wiki.find((item) => item.id === id || item.slug === id);

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ entry });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await req.json()) as {
    title?: string;
    body?: string;
    tags?: string[];
    status?: string;
    malAnimeId?: number | null;
    malAnimeTitle?: string;
    coverImageUrl?: string;
    extraImageUrls?: string[];
  };

  let updated = false;

  await updateDb((db) => ({
    ...db,
    wiki: db.wiki.map((entry) => {
      if (entry.id !== id && entry.slug !== id) {
        return entry;
      }

      if (entry.authorId !== user.id && user.role === "user") {
        return entry;
      }

      updated = true;
      return {
        ...entry,
        title: payload.title ?? entry.title,
        body: payload.body ?? entry.body,
        tags: payload.tags ?? entry.tags,
        status: (payload.status as typeof entry.status) ?? entry.status,
        malAnimeId: payload.malAnimeId ?? entry.malAnimeId,
        malAnimeTitle: payload.malAnimeTitle ?? entry.malAnimeTitle,
        coverImageUrl: payload.coverImageUrl ?? entry.coverImageUrl,
        extraImageUrls: payload.extraImageUrls ?? entry.extraImageUrls,
        revision: entry.revision + 1,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  if (!updated) {
    return NextResponse.json({ error: "Not updated" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let removed = false;
  let forbidden = false;

  await updateDb((db) => {
    const target = db.wiki.find(
      (entry) => entry.id === id || entry.slug === id,
    );
    if (!target) {
      return db;
    }

    const canDelete =
      target.authorId === user.id ||
      user.role === "admin" ||
      user.role === "mod";
    if (!canDelete) {
      forbidden = true;
      return db;
    }

    removed = true;

    const wikiCommentIds = new Set(
      db.wikiComments
        .filter((comment) => comment.entryId === target.id)
        .map((comment) => comment.id),
    );

    return {
      ...db,
      wiki: db.wiki.filter((entry) => entry.id !== target.id),
      wikiComments: db.wikiComments.filter(
        (comment) => comment.entryId !== target.id,
      ),
      threads: db.threads.filter(
        (thread) => thread.wikiReferenceId !== target.id,
      ),
      reports: db.reports.filter(
        (report) =>
          !(
            (report.type === "wiki" && report.targetId === target.id) ||
            (report.type === "comment" && wikiCommentIds.has(report.targetId))
          ),
      ),
    };
  });

  if (!removed) {
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
