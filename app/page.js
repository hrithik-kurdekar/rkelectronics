// app/page.js
import { supabase } from '@/config/supabase';
import Link from 'next/link';
import { Cpu, ArrowRight, Layers } from 'lucide-react';

export const revalidate = 3600;
export const dynamic = 'force-static';

async function fetchStorefrontPayload() {
  const { data: roots } = await supabase.from('categories').select('*').eq('type', 'root').order('sort_order');
  const { data: featured } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12);
  return { roots: roots || [], featured: featured || [] };
}

export default async function RKStorefrontHome() {
  const { roots, featured } = await fetchStorefrontPayload();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600">
      <header className="border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl"><Cpu className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">RK Electronics</span>
          </div>
          <span className="text-emerald-400 text-xs px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full font-mono">● database clean</span>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Premium Grade Refurbished <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Electronics</span>
        </h1>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 border-y border-zinc-900/60 bg-zinc-900/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {roots.map((root) => (
            <Link key={root.id} href={`/category/${root.name.toLowerCase()}`} className="group p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center transition-all hover:border-blue-500/50">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 group-hover:text-blue-400 rounded-full flex items-center justify-center mb-4"><Layers className="w-5 h-5" /></div>
              <span className="text-sm font-bold text-zinc-200 group-hover:text-white">{root.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <h2 className="text-xl font-bold tracking-tight text-white">Latest Workspace Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((prod) => (
            <Link key={prod.id} href={`/product/${prod.sku_code.toLowerCase()}`} className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition-all hover:border-zinc-700">
              <div className="relative aspect-square bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                {/* Safe array index readout fallback */}
                <img src={prod.image_urls?.[0]} alt={prod.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold rounded-md uppercase tracking-wider">{prod.condition}</div>
              </div>
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <div>
                  <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold">{prod.sku_code}</span>
                  <h4 className="text-sm font-bold text-zinc-200 mt-1 line-clamp-2">{prod.title}</h4>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-zinc-900 mt-auto">
                  <span className="text-base font-extrabold text-white">₹{parseFloat(prod.price).toLocaleString()}</span>
                  <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">Analyze <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}