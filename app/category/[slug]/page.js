import { supabase } from '@/config/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Cpu } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import { categoryNameFromSlug } from '@/lib/category-slug';

export const revalidate = 3600;

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const normalizedSlug = categoryNameFromSlug(slug);

  const { data: roots } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'root')
    .order('sort_order');

  const category = (roots || []).find(
    (root) => root.name.toLowerCase() === normalizedSlug
  );

  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('root_category_id', category.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600">
      <header className="border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl"><Cpu className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">RK Electronics</span>
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{category.name}</h1>
          <p className="text-sm text-zinc-500 mt-2">{(products || []).length} products in this category</p>
        </div>

        {(products || []).length === 0 ? (
          <p className="text-zinc-500 text-sm py-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(products || []).map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.sku_code.toLowerCase()}`}
                className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition-all hover:border-zinc-700"
              >
                <div className="relative aspect-square bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                  <ProductImage
                    product={prod}
                    alt={prod.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {prod.condition}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow space-y-3">
                  <div>
                    <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold">{prod.sku_code}</span>
                    <h4 className="text-sm font-bold text-zinc-200 mt-1 line-clamp-2">{prod.title}</h4>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-900 mt-auto">
                    <span className="text-base font-extrabold text-white">₹{parseFloat(prod.price).toLocaleString()}</span>
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
