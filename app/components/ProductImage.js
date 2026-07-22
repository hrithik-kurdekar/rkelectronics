import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { getProductImages } from '@/lib/product-images';

export default function ProductImage({
  product,
  alt,
  className = 'object-cover',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  priority = false,
}) {
  const images = getProductImages(product);
  const src = images[0];

  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-2">
        <ImageIcon className="w-10 h-10 opacity-50" />
        <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt || product?.title || 'Product'}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
