import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldAlert, AlertCircle } from 'lucide-react';
import { getProductImages } from '@/lib/product-images';
import ProductGallery from '@/app/components/ProductGallery';
import StorefrontProductCard from '@/app/components/StorefrontProductCard';
import LazyCategorySections from '@/app/components/LazyCategorySections';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import {
  fetchProductBySku,
  fetchProductSkuParams,
  fetchRootsWithProducts,
  fetchActiveConnections,
  fetchProductsForBrand,
  fetchCategoryById,
  fetchBrowseSections,
  isDemoMode,
} from '@/lib/data';
import {
  STOREFRONT_SECTION_BATCH,
  pickProductsForBrand,
} from '@/lib/fair-product-pick';
import { iconForConnectionType, hrefForConnection } from '@/lib/connections';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';
import { categorySlugFromName } from '@/lib/category-slug';

export const revalidate = 600;

export async function generateStaticParams() {
  if (isDemoMode()) return [];
  return fetchProductSkuParams();
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const { data: product } = await fetchProductBySku(id);
  if (!product) notFound();

  const { data: roots } = await fetchRootsWithProducts();
  const { data: connections } = await fetchActiveConnections();
  const contactList = connections || [];
  const images = getProductImages(product);
  const demo = isDemoMode();

  const [{ data: rootCat }, { data: subCat }, { data: brandCat }] = await Promise.all([
    product.root_category_id ? fetchCategoryById(product.root_category_id) : Promise.resolve({ data: null }),
    product.sub_category_id ? fetchCategoryById(product.sub_category_id) : Promise.resolve({ data: null }),
    product.brand_id ? fetchCategoryById(product.brand_id) : Promise.resolve({ data: null }),
  ]);

  let sameBrandProducts = [];
  if (product.brand_id) {
    const { data: brandProducts } = await fetchProductsForBrand(product.brand_id);
    sameBrandProducts = pickProductsForBrand(brandProducts || [], Number.POSITIVE_INFINITY).filter(
      (p) => p.id !== product.id
    );
  }

  let siblingSections = [];
  let siblingHasMore = false;
  let siblingSectionsError = null;
  if (product.sub_category_id && product.brand_id) {
    const result = await fetchBrowseSections({
      level: 'sub',
      parentId: product.sub_category_id,
      excludeCategoryId: product.brand_id,
      offset: 0,
      limit: STOREFRONT_SECTION_BATCH,
    });
    siblingSections = result.sections || [];
    siblingHasMore = Boolean(result.hasMore);
    siblingSectionsError = result.error;
  }

  const rootPath = rootCat ? `/category/${categorySlugFromName(rootCat.name)}` : null;
  const subPath =
    rootCat && subCat
      ? `${rootPath}/${categorySlugFromName(subCat.name)}`
      : null;
  const brandPath =
    subPath && brandCat
      ? `${subPath}/${categorySlugFromName(brandCat.name)}`
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader roots={roots || []} demo={demo} />

      <main className={`${STOREFRONT_CONTAINER} py-8 sm:py-10 space-y-12 sm:space-y-16 flex-1`}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          {rootCat && rootPath && (
            <>
              <span className="text-zinc-700">/</span>
              <Link href={rootPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
                {rootCat.name}
              </Link>
            </>
          )}
          {subCat && subPath && (
            <>
              <span className="text-zinc-700">/</span>
              <Link href={subPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
                {subCat.name}
              </Link>
            </>
          )}
          {brandCat && brandPath && (
            <>
              <span className="text-zinc-700">/</span>
              <Link href={brandPath} className="font-medium text-zinc-400 hover:text-white transition-colors">
                {brandCat.name}
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductGallery images={images} title={product.title} />

          <div className="space-y-6 lg:pt-1">
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full tracking-wider">
                {product.sku_code}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                {product.condition}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {product.title}
              </h1>
              <p className="text-3xl font-black text-white">
                ₹{parseFloat(product.price).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-zinc-800 pt-5 space-y-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-500">Description</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {product.defect_notes && (
              <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex gap-3 text-xs text-amber-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">
                    Condition notes
                  </span>
                  {product.defect_notes}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="space-y-5 border-t border-zinc-900 pt-10">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Contact</h2>
            <p className="text-sm text-zinc-500">
              Reach RK Electronics through the channels configured in Platform Connections.
            </p>
          </div>

          {contactList.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center border border-dashed border-zinc-800 rounded-2xl">
              Contact details will appear here when configured.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {contactList.map((connection) => {
                const Icon = iconForConnectionType(connection.type);
                const href = hrefForConnection(connection);
                const display = (connection.value || '').replace(/^(mailto:|tel:)/, '');

                return (
                  <div
                    key={connection.id}
                    className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {connection.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{connection.label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm font-semibold text-blue-400 hover:text-blue-300 break-all transition"
                      >
                        {display}
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-300">{display}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {sameBrandProducts.length > 0 && (
          <section className="space-y-5 border-t border-zinc-900 pt-10">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">
                More from {brandCat?.name || 'this brand'}
              </h2>
              <p className="text-sm text-zinc-500">Other products under the same brand.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {sameBrandProducts.map((item) => (
                <StorefrontProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {subPath && (siblingSections.length > 0 || siblingHasMore || siblingSectionsError) ? (
          <section className="space-y-8 border-t border-zinc-900 pt-10">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">
                More brands in {subCat?.name || 'this category'}
              </h2>
              <p className="text-sm text-zinc-500">
                Same browse layout as the brand page — two rows plus Explore per brand.
              </p>
            </div>
            {siblingSectionsError ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Could not load other brand sections.</p>
              </div>
            ) : (
              <LazyCategorySections
                level="sub"
                parentId={product.sub_category_id}
                pathPrefix={subPath}
                excludeCategoryId={product.brand_id}
                initialSections={siblingSections}
                initialHasMore={siblingHasMore}
              />
            )}
          </section>
        ) : null}
      </main>

      <StorefrontFooter />
    </div>
  );
}
