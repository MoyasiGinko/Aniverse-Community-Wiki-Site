import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/stats",
  "/moderation",
];

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsSession = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!needsSession) {
    return NextResponse.next();
  }

  const token = req.cookies.get("aniverse_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/stats/:path*",
    "/moderation/:path*",
  ],
};
