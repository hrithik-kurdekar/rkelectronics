'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Menu, X } from 'lucide-react';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

const navLinkClass = (active) =>
  `inline-flex items-center h-9 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition ${
    active ? 'bg-zinc-800 text-blue-400' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
  }`;

export default function StorefrontHeader({ demo = false }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md relative">
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
          <Link href="/" className={navLinkClass(pathname === '/')}>
            Home
          </Link>
          <Link href="/about" className={navLinkClass(pathname === '/about')}>
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
        <div className="md:hidden absolute inset-x-0 top-full z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-xl">
          <div className={`${STOREFRONT_CONTAINER} py-3 space-y-1`}>
            <Link
              href="/"
              className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
