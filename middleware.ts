import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const PROTECTED = ['/dashboard', '/courses/watch'];
const ADMIN_ONLY = ['/admin'];
const AUTH_PAGES = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (payload) return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.next();
  }

  // Protect dashboard / watch pages
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      const url = new URL('/login', req.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin only
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!payload) return NextResponse.redirect(new URL('/login', req.url));
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/courses/watch/:path*', '/admin/:path*', '/login', '/register'],
};
