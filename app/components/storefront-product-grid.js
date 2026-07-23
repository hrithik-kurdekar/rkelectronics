'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const COLUMN_BREAKPOINTS = [
  ['(min-width: 1536px)', 6],
  ['(min-width: 1280px)', 5],
  ['(min-width: 1024px)', 4],
  ['(min-width: 768px)', 3],
];

/** Matches Tailwind grid: grid-cols-2 md:3 lg:4 xl:5 2xl:6 */
export function useProductGridColumns() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const update = () => {
      for (const [query, count] of COLUMN_BREAKPOINTS) {
        if (window.matchMedia(query).matches) {
          setCols(count);
          return;
        }
      }
      setCols(2);
    };

    update();
    const mqls = COLUMN_BREAKPOINTS.map(([query]) => window.matchMedia(query));
    mqls.forEach((mql) => mql.addEventListener('change', update));
    return () => mqls.forEach((mql) => mql.removeEventListener('change', update));
  }, []);

  return cols;
}

/**
 * Pick products for a 2-row grid with Explore as the last cell.
 * If products fill full rows exactly, drop one so Explore sits at end of row 1
 * instead of alone on the next row (recalculates when cols changes on resize).
 */
export function visibleProductCount(
  productCount,
  cols,
  { includeExplore = true, maxRows = 2 } = {}
) {
  if (productCount <= 0 || cols <= 0) return 0;

  const maxProducts = cols * maxRows - (includeExplore ? 1 : 0);
  let count = Math.min(productCount, Math.max(0, maxProducts));

  if (includeExplore && count > 0 && count % cols === 0) {
    count -= 1;
  }

  return count;
}

export function exploreMessageForBrowseLevel(level, categoryName) {
  const name = categoryName || 'this category';
  switch (level) {
    case 'home':
      return `View more subcategories in ${name}`;
    case 'root':
      return `View more brands in ${name}`;
    case 'sub':
      return `View all products from ${name}`;
    default:
      return `View more in ${name}`;
  }
}

export function ExploreCard({ href, message }) {
  return (
    <Link
      href={href}
      className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition hover:border-zinc-700"
    >
      <div className="relative aspect-square bg-zinc-950 border-b border-zinc-800 overflow-hidden flex items-center justify-center">
        <div className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <ArrowRight className="w-9 h-9 sm:w-10 sm:h-10 text-blue-400" strokeWidth={2} />
        </div>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-grow space-y-2.5">
        <div>
          <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold tracking-wider">
            Explore
          </span>
          {message && (
            <p className="text-sm font-bold text-zinc-200 mt-1 line-clamp-2">{message}</p>
          )}
        </div>
        <div className="pt-2 flex items-center justify-end border-t border-zinc-900 mt-auto">
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export const PRODUCT_GRID_CLASS =
  'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4';
