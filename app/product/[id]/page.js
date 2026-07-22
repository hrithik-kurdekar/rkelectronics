import { supabase } from '@/config/supabase';
import { getProductImages } from '@/lib/product-images';
import ProductImage from '@/app/components/ProductImage';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { notFound } from 'next/navigation';
import { ShieldAlert, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 600;

export async function generateStaticParams() {
  const { data } = await supabase.from('products').select('sku_code');
  return (data || [])
    .filter((p) => p.sku_code)
    .map((p) => ({ id: p.sku_code.toLowerCase() }));
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('sku_code', id.toUpperCase())
    .single();

  if (!product) notFound();

  const images = getProductImages(product);
  const whatsappNumber = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
  const encodedText = encodeURIComponent(
    `Hello RK Electronics, I am interested in purchasing your item:\n💎 Product: ${product.title}\n🆔 SKU Code: ${product.sku_code}\n💰 Listed Value: ₹${parseFloat(product.price).toLocaleString()}`
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodedText}`
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-zinc-900/40 border border-zinc-800 p-6 md:p-8 rounded-3xl backdrop-blur-md">
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
                <ProductImage product={product} alt={product.title} priority />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                      <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full tracking-wider">{product.sku_code}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">{product.condition}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">{product.title}</h1>
                <div className="text-3xl font-black text-white">₹{parseFloat(product.price).toLocaleString()}</div>

                <div className="border-t border-zinc-800/80 pt-4 space-y-2">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400">Specifications Inventory Breakdown</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">{product.description || 'No descriptive context parameters logged for this product profile entry.'}</p>
                </div>

                {product.defect_notes && (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex gap-3 text-xs text-amber-400">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div><span className="font-bold uppercase tracking-wider block mb-0.5">Disclosed Cosmetic Variations</span>{product.defect_notes}</div>
                  </div>
                )}
              </div>

              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 tracking-wide shadow-lg shadow-blue-600/10">
                  <MessageSquare className="w-4 h-4" /> Engage Conversion Chat Securely
                </a>
              ) : (
                <p className="text-sm text-zinc-500 text-center">Contact via WhatsApp is not configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}
