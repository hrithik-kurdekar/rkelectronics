'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';
import { PRODUCT_COLLECTION_PAGE_SIZE } from '@/lib/product-collections';

export default function LazyProductGrid({
  kind,
  initialProducts = [],
  initialHasMore = false,
}) {
  const [products, setProducts] = useState(initialProducts);
  const [offset, setOffset] = useState(initialProducts.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        kind,
        offset: String(offset),
        limit: String(PRODUCT_COLLECTION_PAGE_SIZE),
      });
      const res = await fetch(`/api/storefront/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load products');

      const next = json.products || [];
      setProducts((prev) => [...prev, ...next]);
      setOffset((prev) => prev + next.length);
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, kind, offset]);

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

  if (products.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-12 text-center border border-dashed border-zinc-800 rounded-2xl">
        No products in this collection yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product) => (
          <StorefrontProductCard key={product.id} product={product} />
        ))}
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading ? (
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Loading more…</span>
          ) : (
            <span className="text-xs text-zinc-600">Scroll for more products</span>
          )}
        </div>
      )}
    </div>
  );
}
