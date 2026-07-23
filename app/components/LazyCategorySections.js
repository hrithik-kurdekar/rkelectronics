'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CategoryProductSection from '@/app/components/CategoryProductSection';
import { categorySlugFromName } from '@/lib/category-slug';
import { STOREFRONT_SECTION_BATCH } from '@/lib/fair-product-pick';

/**
 * Lazy-loads additional browse sections as the user scrolls.
 * pathPrefix: '' for home → /category/{slug}
 *             '/category/root' for root page → /category/root/{sub}
 */
export default function LazyCategorySections({
  level,
  parentId = null,
  pathPrefix = '',
  excludeCategoryId = null,
  initialSections = [],
  initialHasMore = false,
}) {
  const [sections, setSections] = useState(initialSections);
  const [offset, setOffset] = useState(initialSections.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const exploreHref = (category) => {
    const slug = categorySlugFromName(category.name);
    if (pathPrefix) return `${pathPrefix}/${slug}`;
    return `/category/${slug}`;
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        level,
        offset: String(offset),
        limit: String(STOREFRONT_SECTION_BATCH),
      });
      if (parentId) params.set('parentId', parentId);
      if (excludeCategoryId) params.set('excludeCategoryId', excludeCategoryId);

      const res = await fetch(`/api/storefront/sections?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load sections');

      const next = json.sections || [];
      setSections((prev) => [...prev, ...next]);
      setOffset((prev) => prev + next.length);
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, level, parentId, excludeCategoryId, offset]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '240px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="space-y-10 sm:space-y-12">
      {sections.map((section) => (
        <CategoryProductSection
          key={section.category.id}
          category={section.category}
          products={section.products}
          exploreHref={exploreHref(section.category)}
          browseLevel={level}
        />
      ))}

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading ? (
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Loading more…</span>
          ) : (
            <span className="text-xs text-zinc-600">Scroll for more categories</span>
          )}
        </div>
      )}
    </div>
  );
}
