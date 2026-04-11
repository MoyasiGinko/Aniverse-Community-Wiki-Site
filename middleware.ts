import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile/edit', '/moderation', '/stats'];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsSession = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!needsSession) {
    return NextResponse.next();
  }

  const token = req.cookies.get('aniverse_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/moderation/:path*', '/stats/:path*'],
};
