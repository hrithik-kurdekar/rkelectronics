'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, ChevronDown, Menu, X } from 'lucide-react';
import { categorySlugFromName } from '@/lib/category-slug';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export default function StorefrontHeader({ roots = [], demo = false }) {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setCategoriesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className={`${STOREFRONT_CONTAINER} h-16 sm:h-18 flex items-center gap-4`}>
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Cpu className="w-4.5 h-4.5 w-[1.15rem] h-[1.15rem]" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-white uppercase truncate">
            RK Electronics
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="hidden md:flex items-center gap-1.5">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoriesOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition ${
                categoriesOpen
                  ? 'bg-zinc-800 text-blue-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              aria-expanded={categoriesOpen}
              aria-haspopup="listbox"
            >
              Categories
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoriesOpen && (
              <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl py-1.5 z-50">
                {roots.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-zinc-500">No categories yet.</p>
                ) : (
                  roots.map((root) => (
                    <Link
                      key={root.id}
                      href={`/category/${categorySlugFromName(root.name)}`}
                      className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {root.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            href="/about"
            className={`inline-flex items-center h-9 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition ${
              pathname === '/about'
                ? 'bg-zinc-800 text-blue-400'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            About Us
          </Link>
        </nav>

        {demo && (
          <span className="hidden sm:inline-flex text-[10px] px-2 py-1 border rounded-md font-mono text-amber-400 bg-amber-500/5 border-amber-500/20 flex-shrink-0">
            demo
          </span>
        )}

        <button
          type="button"
          className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t border-zinc-800 bg-zinc-950 ${STOREFRONT_CONTAINER} py-3 space-y-3`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Categories</p>
            <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
              {roots.length === 0 ? (
                <p className="text-xs text-zinc-500 py-1">No categories yet.</p>
              ) : (
                roots.map((root) => (
                  <Link
                    key={root.id}
                    href={`/category/${categorySlugFromName(root.name)}`}
                    className="block rounded-lg px-2.5 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {root.name}
                  </Link>
                ))
              )}
            </div>
          </div>
          <Link
            href="/about"
            className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            onClick={() => setMobileOpen(false)}
          >
            About Us
          </Link>
        </div>
      )}
    </header>
  );
}
