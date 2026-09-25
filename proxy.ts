import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session-token';

// Optimistic check only: pages, actions and route handlers verify the session again.
function isAdminPath(pathname: string) {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/newsletters')
  );
}

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const path = request.nextUrl.pathname + request.nextUrl.search;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`[${timestamp}] ${method} ${path} (IP: ${ip})`);
  }

  const { pathname, search } = request.nextUrl;
  if (
    isAdminPath(pathname) &&
    !verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
