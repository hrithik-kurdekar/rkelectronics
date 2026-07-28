import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import ProductPriceDisplay from '@/app/components/ProductPriceDisplay';

export default function StorefrontProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.sku_code.toLowerCase()}`}
      className="group bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col h-full transition hover:border-zinc-700"
    >
      <div className="relative aspect-square bg-zinc-950 border-b border-zinc-800 overflow-hidden">
        <ProductImage
          product={product}
          alt={product.title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold rounded-md uppercase tracking-wider">
          {product.condition}
        </div>
      </div>
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow space-y-2.5">
        <div>
          <span className="font-mono text-[10px] text-blue-400 uppercase font-semibold">
            {product.sku_code}
          </span>
          <h4 className="text-sm font-bold text-zinc-200 mt-1 line-clamp-2">{product.title}</h4>
        </div>
        <div className="pt-2 flex items-end justify-between border-t border-zinc-900 mt-auto gap-2">
          <ProductPriceDisplay product={product} size="storefront" />
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 flex-shrink-0">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
