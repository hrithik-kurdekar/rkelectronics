import 'server-only';
import { supabase } from '@/config/supabase';
import { isDemoMode } from '@/lib/data';
import { getAdminClient } from '@/lib/supabase/admin';
import { isMissingRelation } from '@/lib/supabase-errors';

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function recordHeartbeat({ status, latencyMs, message }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { recorded: false };

  try {
    const admin = getAdminClient();
    const { error } = await admin.from('system_heartbeats').insert({
      kind: 'keep_alive',
      status,
      latency_ms: latencyMs,
      message,
    });

    if (error) {
      if (isMissingRelation(error)) return { recorded: false, reason: 'table_missing' };
      return { recorded: false, reason: error.message };
    }

    return { recorded: true };
  } catch (err) {
    return { recorded: false, reason: err.message || String(err) };
  }
}

/** Lightweight DB ping to prevent Supabase free-tier pause after inactivity. */
export async function runKeepAlive() {
  if (isDemoMode()) {
    return {
      status: 'skipped',
      message: 'Demo mode — Supabase keep-alive not required',
      latencyMs: null,
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      status: 'unconfigured',
      message: 'Supabase URL or anon key is not configured',
      latencyMs: null,
    };
  }

  const start = Date.now();
  let client = supabase;
  let via = 'anon';

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      client = getAdminClient();
      via = 'service_role';
    } catch {
      client = supabase;
      via = 'anon';
    }
  }

  const { error } = await client.from('categories').select('id').limit(1);
  const latencyMs = Date.now() - start;

  if (error) {
    const heartbeat = await recordHeartbeat({
      status: 'error',
      latencyMs,
      message: error.message,
    });
    return {
      status: 'error',
      message: error.message,
      latencyMs,
      via,
      heartbeat,
    };
  }

  const heartbeat = await recordHeartbeat({
    status: 'ok',
    latencyMs,
    message: `Ping via ${via}`,
  });

  return {
    status: 'ok',
    message: 'Database reachable',
    latencyMs,
    via,
    heartbeat,
  };
}

export async function fetchLastKeepAlive() {
  if (isDemoMode()) {
    return {
      status: 'skipped',
      message: 'Demo mode',
      lastAt: null,
      latencyMs: null,
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      status: 'unconfigured',
      message: 'Service role key required to read heartbeat history',
      lastAt: null,
      latencyMs: null,
    };
  }

  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('system_heartbeats')
      .select('status, latency_ms, message, created_at')
      .eq('kind', 'keep_alive')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelation(error)) {
        return {
          status: 'unconfigured',
          message: 'Run migration 004_dashboard_analytics.sql to enable heartbeat history',
          lastAt: null,
          latencyMs: null,
        };
      }
      return {
        status: 'error',
        message: error.message,
        lastAt: null,
        latencyMs: null,
      };
    }

    if (!data) {
      return {
        status: 'never',
        message: 'No keep-alive runs recorded yet',
        lastAt: null,
        latencyMs: null,
      };
    }

    return {
      status: data.status,
      message: data.message,
      lastAt: data.created_at,
      latencyMs: data.latency_ms,
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message || String(err),
      lastAt: null,
      latencyMs: null,
    };
  }
}

export function isCronAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;

  const { searchParams } = new URL(request.url);
  return searchParams.get('secret') === secret;
}
