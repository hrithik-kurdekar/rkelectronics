import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Intercept requests targeting administrative control layers
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('sb-access-token')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    try {
      // Decode JWT fields without hitting direct DB connections
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const client = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: { user }, error } = await client.auth.getUser(sessionToken);

      if (error || !user || user.app_metadata?.role !== 'admin') {
        return NextResponse.redirect(new URL('/404', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};