import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, expectedSessionToken, safeEqual } from '@/lib/adminAuth';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

// Endpoints that must stay reachable without a session, otherwise nobody could
// ever authenticate or sign out.
const PUBLIC_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const expected = await expectedSessionToken();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authed = Boolean(expected && token && safeEqual(token, expected));

  if (authed) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  if (pathname !== '/admin') {
    loginUrl.searchParams.set('next', pathname);
  }
  return NextResponse.redirect(loginUrl);
}
