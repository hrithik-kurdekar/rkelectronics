'use client';

import React from 'react';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';
import {
  ExploreCard,
  PRODUCT_GRID_CLASS,
  useProductGridColumns,
  visibleProductCount,
} from '@/app/components/storefront-product-grid';

export default function ProductCollectionSection({
  title,
  description,
  products = [],
  exploreHref,
  exploreMessage,
}) {
  const cols = useProductGridColumns();
  const count = visibleProductCount(products.length, cols, { includeExplore: Boolean(exploreHref) });
  const visible = products.slice(0, count);

  if (visible.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h3>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
      </div>

      <div className={PRODUCT_GRID_CLASS}>
        {visible.map((product) => (
          <StorefrontProductCard key={product.id} product={product} />
        ))}
        {exploreHref && <ExploreCard href={exploreHref} message={exploreMessage} />}
      </div>
    </section>
  );
}
