import { NextResponse } from 'next/server';
import { fetchProductCollection } from '@/lib/data';
import {
  isValidProductCollectionKind,
  PRODUCT_COLLECTION_PAGE_SIZE,
} from '@/lib/product-collections';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind') || '';
  const offset = Number(searchParams.get('offset') || 0);
  const limit = Number(searchParams.get('limit') || PRODUCT_COLLECTION_PAGE_SIZE);

  if (!isValidProductCollectionKind(kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
  }

  const { products, hasMore, error } = await fetchProductCollection({
    kind,
    offset: Number.isFinite(offset) ? offset : 0,
    limit: Number.isFinite(limit) ? limit : PRODUCT_COLLECTION_PAGE_SIZE,
  });

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }

  return NextResponse.json({ products, hasMore });
}
