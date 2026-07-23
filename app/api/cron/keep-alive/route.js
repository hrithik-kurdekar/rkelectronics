import { NextResponse } from 'next/server';
import { isCronAuthorized, runKeepAlive } from '@/lib/keep-alive';

export async function GET(request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        status: 'unconfigured',
        message: 'CRON_SECRET is not set — add it in Vercel/host env to enable scheduled keep-alive',
      },
      { status: 503 }
    );
  }

  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runKeepAlive();
    const ok = result.status === 'ok' || result.status === 'skipped';
    return NextResponse.json(
      {
        ok,
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: ok ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        status: 'error',
        message: err.message || 'Keep-alive failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
