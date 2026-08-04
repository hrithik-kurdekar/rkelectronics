import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';
import LazyCategorySections from '@/app/components/LazyCategorySections';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { categorySlugFromName } from '@/lib/category-slug';
import { matchCategoryBySlug } from '@/lib/category-path';
import {
  fetchRootsWithProducts,
  fetchSubsWithProducts,
  fetchBrandsWithProducts,
  fetchProductsForBrand,
  fetchBrowseSections,
} from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';
import {
  STOREFRONT_SECTION_BATCH,
  pickProductsForBrand,
} from '@/lib/fair-product-pick';

export const revalidate = 3600;

export default async function BrandCategoryPage({ params }) {
  const { slug, subSlug, brandSlug } = await params;
  const { data: roots } = await fetchRootsWithProducts();

  const root = matchCategoryBySlug(roots, slug);
  if (!root) notFound();

  const { data: subs } = await fetchSubsWithProducts(root.id);
  const sub = matchCategoryBySlug(subs, subSlug);
  if (!sub) notFound();

  const { data: brands } = await fetchBrandsWithProducts(sub.id);
  const brand = matchCategoryBySlug(brands, brandSlug);
  if (!brand) notFound();

  const { data: products, error: productsError } = await fetchProductsForBrand(brand.id);
  const list = pickProductsForBrand(products || [], Number.POSITIVE_INFINITY);

  const {
    sections,
    hasMore,
    error: sectionsError,
  } = await fetchBrowseSections({
    level: 'sub',
    parentId: sub.id,
    excludeCategoryId: brand.id,
    offset: 0,
    limit: STOREFRONT_SECTION_BATCH,
  });

  const rootPath = `/category/${categorySlugFromName(root.name)}`;
  const subPath = `${rootPath}/${categorySlugFromName(sub.name)}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader />

      <section className={`${STOREFRONT_CONTAINER} py-10 sm:py-12 space-y-10 flex-1`}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href={rootPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
            {root.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href={subPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
            {sub.name}
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{brand.name}</h1>
          <p className="text-sm text-zinc-500 mt-2">
            {productsError ? 'Could not load products.' : `${list.length} products`}
          </p>
        </div>

        {productsError ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Product list failed to load. Please refresh the page.</p>
          </div>
        ) : list.length === 0 ? (
          <p className="text-zinc-500 text-sm py-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
            No products for this brand yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {list.map((product) => (
              <StorefrontProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {(sections || []).length > 0 || hasMore || sectionsError ? (
          <div className="space-y-8 border-t border-zinc-900 pt-10">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">More brands in {sub.name}</h2>
              <p className="text-sm text-zinc-500">
                Same browse layout as the sub-category — explore any brand for its full list.
              </p>
            </div>
            {sectionsError ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Could not load other brand sections.</p>
              </div>
            ) : (
              <LazyCategorySections
                level="sub"
                parentId={sub.id}
                pathPrefix={subPath}
                excludeCategoryId={brand.id}
                initialSections={sections || []}
                initialHasMore={Boolean(hasMore)}
              />
            )}
          </div>
        ) : null}
      </section>

      <StorefrontFooter />
    </div>
  );
}
