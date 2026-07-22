// app/page.js
import { AlertCircle } from 'lucide-react';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontHero from '@/app/components/StorefrontHero';
import CategoryGrid from '@/app/components/CategoryGrid';
import LazyCategorySections from '@/app/components/LazyCategorySections';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { fetchRootCategories, fetchBrowseSections, isDemoMode } from '@/lib/data';
import { STOREFRONT_SECTION_BATCH } from '@/lib/fair-product-pick';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 3600;
export const dynamic = 'force-static';

async function fetchStorefrontPayload() {
  const { data: roots, error: rootsError } = await fetchRootCategories();
  const {
    sections,
    hasMore,
    error: sectionsError,
  } = await fetchBrowseSections({
    level: 'home',
    offset: 0,
    limit: STOREFRONT_SECTION_BATCH,
  });

  const error = rootsError?.message || sectionsError?.message || null;
  return {
    roots: roots || [],
    sections: sections || [],
    hasMore: Boolean(hasMore),
    error,
  };
}

export default async function RKStorefrontHome() {
  const { roots, sections, hasMore, error } = await fetchStorefrontPayload();
  const demo = isDemoMode();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader roots={roots} demo={demo} />

      {error && (
        <div className={`${STOREFRONT_CONTAINER} pt-6`}>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Could not load catalog data. Please try again later.</p>
          </div>
        </div>
      )}

      {demo && (
        <div className={`${STOREFRONT_CONTAINER} pt-4`}>
          <p className="text-xs text-amber-500/90 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-2">
            Demo mode: catalog is loaded from local fixtures (not Supabase).
          </p>
        </div>
      )}

      <StorefrontHero />

      <section id="categories" className="scroll-mt-20 border-b border-zinc-900/60 bg-zinc-900/15 w-full">
        <div className={`${STOREFRONT_CONTAINER} py-12 sm:py-16 space-y-6`}>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Shop by category</h2>
            <p className="text-sm text-zinc-500">Browse the catalog map — expand to see every root category.</p>
          </div>
          <CategoryGrid roots={roots} />
        </div>
      </section>

      <section id="products" className="scroll-mt-20 w-full">
        <div className={`${STOREFRONT_CONTAINER} py-12 sm:py-16 space-y-8`}>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Browse products</h2>
            <p className="text-sm text-zinc-500">
              Two rows from each root category — explore for the full branch.
            </p>
          </div>
          <LazyCategorySections
            level="home"
            initialSections={sections}
            initialHasMore={hasMore}
          />
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
