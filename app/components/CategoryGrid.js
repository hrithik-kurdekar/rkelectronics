'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layers } from 'lucide-react';
import { categorySlugFromName } from '@/lib/category-slug';

function useCategoryColumns() {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const queries = [
      ['(min-width: 1536px)', 8],
      ['(min-width: 1280px)', 7],
      ['(min-width: 1024px)', 6],
      ['(min-width: 768px)', 5],
      ['(min-width: 640px)', 4],
    ];

    const update = () => {
      for (const [query, count] of queries) {
        if (window.matchMedia(query).matches) {
          setCols(count);
          return;
        }
      }
      setCols(3);
    };

    update();
    const mqls = queries.map(([query]) => window.matchMedia(query));
    mqls.forEach((mql) => mql.addEventListener('change', update));
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update));
  }, []);

  return cols;
}

function CategoryCover({ root }) {
  const src = root.image_url;

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-600 group-hover:text-blue-400 transition-colors duration-300">
        <Layers className="w-5 h-5" strokeWidth={1.5} />
      </div>
    );
  }

  const isLocal = src.startsWith('/');
  if (isLocal) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />
  );
}

export default function CategoryGrid({ roots = [] }) {
  const cols = useCategoryColumns();
  const [expanded, setExpanded] = useState(false);
  const previewCount = cols * 2;
  const needsToggle = roots.length > previewCount;
  const visible = expanded || !needsToggle ? roots : roots.slice(0, previewCount);

  if (roots.length === 0) {
    return <p className="text-zinc-500 text-sm py-8 text-center">No categories yet.</p>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-2 gap-y-3 sm:gap-x-2.5 sm:gap-y-3.5 md:gap-x-3 md:gap-y-4">
        {visible.map((root) => (
          <Link
            key={root.id}
            href={`/category/${categorySlugFromName(root.name)}`}
            className="group flex flex-col rounded-xl overflow-hidden border border-zinc-800/90 bg-zinc-900/40 transition duration-300 hover:border-blue-500/45 hover:bg-zinc-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <div className="relative aspect-square overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
              <CategoryCover root={root} />
            </div>
            <span className="px-1.5 py-2 sm:px-2 sm:py-2.5 text-[10px] sm:text-[11px] md:text-xs font-semibold leading-snug text-zinc-200 text-center line-clamp-2 group-hover:text-white transition-colors">
              {root.name}
            </span>
          </Link>
        ))}
      </div>

      {needsToggle && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="h-9 px-4 rounded-lg border border-zinc-700/80 text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:border-blue-500/40 hover:text-blue-300 hover:bg-blue-500/5 transition"
          >
            {expanded ? 'Show less' : `Show all (${roots.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
