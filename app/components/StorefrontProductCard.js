import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import ProductPriceDisplay from '@/app/components/ProductPriceDisplay';
import { discountPercent, productShowsMrp } from '@/lib/product-price';

export default function StorefrontProductCard({ product }) {
  const showMrp = productShowsMrp(product);
  const discount = showMrp ? discountPercent(product.price, product.mrp) : null;

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
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold rounded-md uppercase tracking-wider">
          {product.condition}
        </div>
        {discount != null && discount > 0 ? (
          <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-zinc-950/95 text-emerald-300 text-[10px] font-bold leading-none border border-emerald-500/40 shadow-sm">
            <ArrowDown className="w-3 h-3 shrink-0" aria-hidden="true" />
            {discount}% OFF
          </div>
        ) : null}
      </div>
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow space-y-2.5">
        <h4 className="text-sm font-bold text-zinc-200 line-clamp-2">{product.title}</h4>
        <div className="pt-2 border-t border-zinc-900 mt-auto w-full">
          <ProductPriceDisplay product={product} size="storefront" variant="detailed" />
        </div>
      </div>
    </Link>
  );
}
