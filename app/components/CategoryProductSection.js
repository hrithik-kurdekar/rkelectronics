'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';

function useProductColumns() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const queries = [
      ['(min-width: 1536px)', 6],
      ['(min-width: 1280px)', 5],
      ['(min-width: 1024px)', 4],
      ['(min-width: 768px)', 3],
    ];

    const update = () => {
      for (const [query, count] of queries) {
        if (window.matchMedia(query).matches) {
          setCols(count);
          return;
        }
      }
      setCols(2);
    };

    update();
    const mqls = queries.map(([query]) => window.matchMedia(query));
    mqls.forEach((mql) => mql.addEventListener('change', update));
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update));
  }, []);

  return cols;
}

function ExploreCard({ href }) {
  return (
    <Link
      href={href}
      className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition hover:border-blue-500/40"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 min-h-[12rem]">
        <div className="w-14 h-14 rounded-full border border-zinc-700 group-hover:border-blue-500/50 flex items-center justify-center transition bg-zinc-950/60">
          <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-blue-300 transition">
          Explore
        </span>
      </div>
    </Link>
  );
}

export default function CategoryProductSection({ category, products = [], exploreHref }) {
  const cols = useProductColumns();
  const slots = cols * 2;
  const visible = products.slice(0, Math.max(0, slots - 1));

  return (
    <section className="space-y-4">
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
        {category.name}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {visible.map((product) => (
          <StorefrontProductCard key={product.id} product={product} />
        ))}
        <ExploreCard href={exploreHref} />
      </div>
    </section>
  );
}
