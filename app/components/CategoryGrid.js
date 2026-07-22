'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { categorySlugFromName } from '@/lib/category-slug';

function useCategoryColumns() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const queries = [
      ['(min-width: 1280px)', 6],
      ['(min-width: 1024px)', 5],
      ['(min-width: 768px)', 4],
      ['(min-width: 640px)', 3],
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {visible.map((root) => (
          <Link
            key={root.id}
            href={`/category/${categorySlugFromName(root.name)}`}
            className="group p-4 sm:p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex flex-col items-center transition hover:border-blue-500/45 hover:bg-zinc-900"
          >
            <div className="w-11 h-11 bg-zinc-950 border border-zinc-800 group-hover:border-blue-500/30 group-hover:text-blue-400 rounded-full flex items-center justify-center mb-3 transition">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-white text-center line-clamp-2">
              {root.name}
            </span>
          </Link>
        ))}
      </div>

      {needsToggle && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="h-10 px-5 rounded-xl border border-zinc-700 text-xs font-bold uppercase tracking-wide text-zinc-200 hover:border-blue-500/40 hover:text-blue-300 transition"
          >
            {expanded ? 'Show less' : `Show all (${roots.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
