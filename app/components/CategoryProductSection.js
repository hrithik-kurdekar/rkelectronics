'use client';

import React from 'react';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';
import {
  ExploreCard,
  PRODUCT_GRID_CLASS,
  PRODUCT_GRID_MAX_ROWS,
  exploreMessageForBrowseLevel,
  shouldShowExploreCard,
  useProductGridColumns,
  visibleProductCount,
} from '@/app/components/storefront-product-grid';

export default function CategoryProductSection({
  category,
  products = [],
  exploreHref,
  browseLevel = 'home',
}) {
  const cols = useProductGridColumns();
  const showExplore =
    Boolean(exploreHref) &&
    shouldShowExploreCard(products.length, cols, { maxRows: PRODUCT_GRID_MAX_ROWS });
  const count = visibleProductCount(products.length, cols, {
    includeExplore: showExplore,
    maxRows: PRODUCT_GRID_MAX_ROWS,
  });
  const visible = products.slice(0, count);
  const exploreMessage = exploreHref
    ? exploreMessageForBrowseLevel(browseLevel, category?.name)
    : null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
        {category.name}
      </h3>

      <div className={PRODUCT_GRID_CLASS}>
        {visible.map((product) => (
          <StorefrontProductCard key={product.id} product={product} />
        ))}
        {showExplore && <ExploreCard href={exploreHref} message={exploreMessage} />}
      </div>
    </section>
  );
}
