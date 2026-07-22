import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { categoryNameFromSlug } from '@/lib/category-slug';
import { fetchRootCategories, fetchProductsByRootId, isDemoMode } from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 3600;

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const normalizedSlug = categoryNameFromSlug(slug);

  const { data: roots, error: rootsError } = await fetchRootCategories();
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

  const category = (roots || []).find(
    (root) => root.name.toLowerCase() === normalizedSlug
  );

  if (!category) notFound();

  const { data: products, error: productsError } = await fetchProductsByRootId(category.id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader roots={roots || []} demo={demo} />

      <section className={`${STOREFRONT_CONTAINER} py-10 sm:py-12 space-y-8 flex-1`}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{category.name}</h1>
          <p className="text-sm text-zinc-500 mt-2">
            {productsError ? 'Could not load products.' : `${(products || []).length} products in this category`}
          </p>
        </div>

        {productsError ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Product list failed to load. Please refresh the page.</p>
          </div>
        ) : (products || []).length === 0 ? (
          <p className="text-zinc-500 text-sm py-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {(products || []).map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.sku_code.toLowerCase()}`}
                className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition hover:border-zinc-700"
              >
                <div className="relative aspect-square bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                  <ProductImage
                    product={prod}
                    alt={prod.title}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {prod.condition}
                  </div>
                </div>
                <div className="p-3.5 sm:p-4 flex flex-col flex-grow space-y-2.5">
                  <div>
                    <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold">{prod.sku_code}</span>
                    <h4 className="text-sm font-bold text-zinc-200 mt-1 line-clamp-2">{prod.title}</h4>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-900 mt-auto gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      ₹{parseFloat(prod.price).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 flex-shrink-0">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <StorefrontFooter />
    </div>
  );
}
