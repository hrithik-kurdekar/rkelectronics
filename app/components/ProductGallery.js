'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

export default function ProductGallery({ images = [], title = 'Product' }) {
  const list = (images || []).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] || null;

  if (!current) {
    return (
      <div className="aspect-square w-full bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-2">
        <ImageIcon className="w-10 h-10 opacity-50" />
        <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
      </div>
    );
  }

  const isLocal = current.startsWith('/');

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
        {isLocal ? (
          <Image
            src={current}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {list.map((url, i) => {
            const thumbLocal = url.startsWith('/');
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border bg-zinc-950 transition ${
                  i === active
                    ? 'border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'border-zinc-800 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                {thumbLocal ? (
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
