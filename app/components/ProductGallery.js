'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

const MAIN_FRAME =
  'relative aspect-square w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800';

function GalleryImage({ src, alt, className, sizes, priority = false }) {
  const isLocal = src.startsWith('/');

  if (isLocal) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}

export default function ProductGallery({ images = [], title = 'Product' }) {
  const list = (images || []).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] || null;

  if (!current) {
    return (
      <div className="w-full space-y-3">
        <div className={`${MAIN_FRAME} flex flex-col items-center justify-center text-zinc-600 gap-2`}>
          <ImageIcon className="w-10 h-10 opacity-50" />
          <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className={MAIN_FRAME}>
        <GalleryImage
          src={current}
          alt={title}
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div
        className="flex justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-0.5"
        role="tablist"
        aria-label="Product images"
      >
        {list.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border bg-zinc-950 transition ${
              i === active
                ? 'border-blue-500/70 ring-1 ring-blue-500/40'
                : 'border-zinc-800 opacity-75 hover:opacity-100'
            }`}
            aria-label={`View image ${i + 1} of ${list.length}`}
          >
            <GalleryImage
              src={url}
              alt=""
              sizes="64px"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
