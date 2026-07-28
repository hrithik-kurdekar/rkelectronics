import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CategoryGrid from '@/app/components/CategoryGrid';
import LazyCategorySections from '@/app/components/LazyCategorySections';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { categorySlugFromName } from '@/lib/category-slug';
import { matchCategoryBySlug } from '@/lib/category-path';
import {
  fetchRootsWithProducts,
  fetchSubsWithProducts,
  fetchBrowseSections,
  isDemoMode,
} from '@/lib/data';
import { STOREFRONT_SECTION_BATCH } from '@/lib/fair-product-pick';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 3600;

export default async function RootCategoryPage({ params }) {
  const { slug } = await params;
  const { data: roots, error: rootsError } = await fetchRootsWithProducts();
  const demo = isDemoMode();

  if (rootsError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>Could not load this category. Please try again later.</p>
        </div>
      </div>
    );
  }

  const root = matchCategoryBySlug(roots, slug);
  if (!root) notFound();

  const { data: subs } = await fetchSubsWithProducts(root.id);
  const {
    sections,
    hasMore,
    error: sectionsError,
  } = await fetchBrowseSections({
    level: 'root',
    parentId: root.id,
    offset: 0,
    limit: STOREFRONT_SECTION_BATCH,
  });

  const rootPath = `/category/${categorySlugFromName(root.name)}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader demo={demo} />

      <section className={`${STOREFRONT_CONTAINER} py-10 sm:py-12 space-y-10 flex-1`}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{root.name}</h1>
          <p className="text-sm text-zinc-500 mt-2">
            {(subs || []).length} sub-categories with products — browse two rows from each, then explore.
          </p>
        </div>

        {sectionsError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Could not load category sections.</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Sub-categories</h2>
            <p className="text-sm text-zinc-500">Same map layout as the home categories.</p>
          </div>
          <CategoryGrid
            items={subs || []}
            pathPrefix={rootPath}
            emptyLabel="No sub-categories with products yet."
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Products by sub-category</h2>
            <p className="text-sm text-zinc-500">Fair mix across brands in each sub.</p>
          </div>
          <LazyCategorySections
            level="root"
            parentId={root.id}
            pathPrefix={rootPath}
            initialSections={sections || []}
            initialHasMore={Boolean(hasMore)}
          />
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
