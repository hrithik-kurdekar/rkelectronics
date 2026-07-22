import { NextResponse } from 'next/server';
import { fetchBrowseSections } from '@/lib/data';
import {
  STOREFRONT_SECTION_BATCH,
  STOREFRONT_SECTION_PRODUCT_LIMIT,
} from '@/lib/fair-product-pick';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || 'home';
  const parentId = searchParams.get('parentId') || null;
  const excludeCategoryId = searchParams.get('excludeCategoryId') || null;
  const offset = Number(searchParams.get('offset') || 0);
  const limit = Number(searchParams.get('limit') || STOREFRONT_SECTION_BATCH);

  if (!['home', 'root', 'sub'].includes(level)) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }

  if ((level === 'root' || level === 'sub') && !parentId) {
    return NextResponse.json({ error: 'parentId required' }, { status: 400 });
  }

  const { sections, hasMore, error } = await fetchBrowseSections({
    level,
    parentId,
    excludeCategoryId,
    offset: Number.isFinite(offset) ? offset : 0,
    limit: Number.isFinite(limit) ? limit : STOREFRONT_SECTION_BATCH,
    productsPerSection: STOREFRONT_SECTION_PRODUCT_LIMIT,
  });

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }

  return NextResponse.json({ sections, hasMore });
}
