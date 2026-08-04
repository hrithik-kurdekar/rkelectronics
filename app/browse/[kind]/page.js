import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import LazyProductGrid from '@/app/components/LazyProductGrid';
import { fetchProductCollection } from '@/lib/data';
import {
  isValidProductCollectionKind,
  productCollectionMeta,
  PRODUCT_COLLECTION_PAGE_SIZE,
} from '@/lib/product-collections';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { kind } = await params;
  const meta = productCollectionMeta(kind);
  if (!meta) return { title: 'Browse | RK Electronics' };
  return {
    title: `${meta.title} | RK Electronics`,
    description: meta.browseDescription,
  };
}

export default async function ProductCollectionBrowsePage({ params }) {
  const { kind } = await params;
  if (!isValidProductCollectionKind(kind)) notFound();

  const meta = productCollectionMeta(kind);
  const collection = await fetchProductCollection({ kind, offset: 0, limit: PRODUCT_COLLECTION_PAGE_SIZE });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 flex flex-col">
      <StorefrontHeader />

      <main className={`${STOREFRONT_CONTAINER} py-6 sm:py-8 flex-1`}>
        <div className="space-y-6 sm:space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {meta.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 max-w-2xl">{meta.browseDescription}</p>
          </div>

          <LazyProductGrid
            kind={kind}
            initialProducts={collection.products || []}
            initialHasMore={Boolean(collection.hasMore)}
          />
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
