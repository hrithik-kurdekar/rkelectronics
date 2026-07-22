// app/page.js
import Link from 'next/link';
import { ArrowRight, AlertCircle } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontHero from '@/app/components/StorefrontHero';
import CategoryGrid from '@/app/components/CategoryGrid';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { fetchRootCategories, fetchHomeProducts, isDemoMode } from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 3600;
export const dynamic = 'force-static';

async function fetchStorefrontPayload() {
  const { data: roots, error: rootsError } = await fetchRootCategories();
  const { featured, showingFeatured, error: productsError } = await fetchHomeProducts();

  const error = rootsError?.message || productsError?.message || null;
  return { roots: roots || [], featured: featured || [], showingFeatured, error };
}

export default async function RKStorefrontHome() {
  const { roots, featured, showingFeatured, error } = await fetchStorefrontPayload();
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
            <p className="text-sm text-zinc-500">Two rows by default — expand anytime to see the full catalog map.</p>
          </div>
          <CategoryGrid roots={roots} />
        </div>
      </section>

      <section id="products" className="scroll-mt-20 w-full">
        <div className={`${STOREFRONT_CONTAINER} py-12 sm:py-16 space-y-8`}>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {showingFeatured ? 'Featured Products' : 'Latest Arrivals'}
          </h2>
          {featured.length === 0 ? (
            <p className="text-zinc-500 text-sm py-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
              No products listed yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {featured.map((prod) => (
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
                      <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold">
                        {prod.sku_code}
                      </span>
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
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
