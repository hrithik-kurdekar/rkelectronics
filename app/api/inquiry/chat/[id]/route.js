import { NextResponse } from 'next/server';
import { fetchConnectionById } from '@/lib/data';
import { buildChatDestinationUrl } from '@/lib/inquiry-chat';

export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing connection id' }, { status: 400 });
  }

  const { data: connection, error } = await fetchConnectionById(id);
  if (error) {
    return NextResponse.json({ error: 'Failed to load connection' }, { status: 500 });
  }
  if (!connection || !connection.is_active || connection.type !== 'Chat Link') {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get('sku') || '';
  const title = searchParams.get('title') || '';

  const destination = buildChatDestinationUrl(connection, { sku, title });
  if (!destination) {
    return NextResponse.json({ error: 'Chat link is not configured' }, { status: 503 });
  }

  return NextResponse.redirect(destination, 302);
}
