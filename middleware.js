import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { shouldTrackPageView } from '@/lib/page-view-tracker';

function trackPageView(request) {
  const { pathname } = request.nextUrl;
  if (!shouldTrackPageView(pathname)) return;

  const url = new URL('/api/internal/page-view', request.url);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: pathname }),
  }).catch(() => {});
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const { supabaseResponse, user } = await updateSession(request);
    if (!user || user.app_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    return supabaseResponse;
  }

  trackPageView(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
