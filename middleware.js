import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  if (pathname.startsWith('/admin')) {
    if (!user || user.app_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
