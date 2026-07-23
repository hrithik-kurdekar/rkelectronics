import 'server-only';
import { supabase } from '@/config/supabase';
import { isDemoMode } from '@/lib/data';
import { isMissingRelation } from '@/lib/supabase-errors';

const SKIP_PREFIXES = ['/admin', '/api', '/backend-portal-gateway-rk', '/_next'];

export function shouldTrackPageView(pathname) {
  if (!pathname || pathname === '/favicon.ico') return false;
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  return true;
}

export async function recordPageView(path) {
  if (!path || isDemoMode()) {
    return { recorded: false, reason: isDemoMode() ? 'demo_mode' : 'invalid_path' };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { recorded: false, reason: 'unconfigured' };
  }

  const { error } = await supabase.from('page_views').insert({ path });

  if (error) {
    if (isMissingRelation(error)) {
      return { recorded: false, reason: 'table_missing' };
    }
    return { recorded: false, reason: error.message };
  }

  return { recorded: true };
}
