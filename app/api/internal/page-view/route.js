import { NextResponse } from 'next/server';
import { recordPageView } from '@/lib/page-view-tracker';

export async function POST(request) {
  let path = '';

  try {
    const body = await request.json();
    path = typeof body?.path === 'string' ? body.path : '';
  } catch {
    path = '';
  }

  if (!path || path.length > 500) {
    return NextResponse.json({ recorded: false, reason: 'invalid_path' }, { status: 400 });
  }

  const result = await recordPageView(path);
  return NextResponse.json(result, { status: result.recorded ? 201 : 200 });
}
