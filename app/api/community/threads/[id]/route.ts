import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth";
import { readDb, updateDb } from "@/src/lib/db";

export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getSessionUser();
  const db = await readDb();

  const thread = db.threads.find((item) => item.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (user) {
    const alreadyViewed = db.threadViews.some(
      (view) => view.threadId === id && view.userId === user.id,
    );

    if (!alreadyViewed) {
      await updateDb((current) => ({
        ...current,
        threadViews: [
          {
            threadId: id,
            userId: user.id,
            createdAt: new Date().toISOString(),
          },
          ...current.threadViews,
        ],
      }));
    }
  }

  return NextResponse.json({ thread });
}
