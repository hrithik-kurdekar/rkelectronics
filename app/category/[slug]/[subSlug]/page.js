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
  fetchBrandsWithProducts,
  fetchBrowseSections,
  isDemoMode,
} from '@/lib/data';
import { STOREFRONT_SECTION_BATCH } from '@/lib/fair-product-pick';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 3600;

export default async function SubCategoryPage({ params }) {
  const { slug, subSlug } = await params;
  const { data: roots } = await fetchRootsWithProducts();
  const demo = isDemoMode();

  const root = matchCategoryBySlug(roots, slug);
  if (!root) notFound();

  const { data: subs } = await fetchSubsWithProducts(root.id);
  const sub = matchCategoryBySlug(subs, subSlug);
  if (!sub) notFound();

  const { data: brands } = await fetchBrandsWithProducts(sub.id);
  const {
    sections,
    hasMore,
    error: sectionsError,
  } = await fetchBrowseSections({
    level: 'sub',
    parentId: sub.id,
    offset: 0,
    limit: STOREFRONT_SECTION_BATCH,
  });

  const rootPath = `/category/${categorySlugFromName(root.name)}`;
  const subPath = `${rootPath}/${categorySlugFromName(sub.name)}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader roots={roots || []} demo={demo} />

      <section className={`${STOREFRONT_CONTAINER} py-10 sm:py-12 space-y-10 flex-1`}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href={rootPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
            {root.name}
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{sub.name}</h1>
          <p className="text-sm text-zinc-500 mt-2">
            {(brands || []).length} brands with products under {root.name}
          </p>
        </div>

        {sectionsError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Could not load brand sections.</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Brands</h2>
            <p className="text-sm text-zinc-500">Pick a brand or scroll the previews below.</p>
          </div>
          <CategoryGrid
            items={brands || []}
            pathPrefix={subPath}
            emptyLabel="No brands with products yet."
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Products by brand</h2>
            <p className="text-sm text-zinc-500">Two rows per brand — explore for the full list.</p>
          </div>
          <LazyCategorySections
            level="sub"
            parentId={sub.id}
            pathPrefix={subPath}
            initialSections={sections || []}
            initialHasMore={Boolean(hasMore)}
          />
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
