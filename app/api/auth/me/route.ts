import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { user: null },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    { user: publicUser(user) },
    { headers: noStoreHeaders },
  );
}
