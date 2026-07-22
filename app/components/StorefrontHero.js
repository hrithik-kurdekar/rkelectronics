import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export default function StorefrontHero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-zinc-800/60">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(37,99,235,0.28),transparent_50%),radial-gradient(ellipse_at_80%_60%,rgba(14,165,233,0.12),transparent_45%),linear-gradient(180deg,#09090b_0%,#0c1222_45%,#09090b_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className={`relative ${STOREFRONT_CONTAINER} py-16 sm:py-20 lg:py-24`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400/90 mb-4">
          RK Electronics
        </p>
        <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
          Trusted refurbished electronics, ready for work.
        </h1>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed">
          Browse graded stock across categories — inquire on WhatsApp when you find the right piece.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#categories"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
          >
            Browse categories
            <ArrowDown className="w-4 h-4" />
          </a>
          <Link
            href="/about"
            className="inline-flex items-center h-11 px-5 rounded-xl border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white text-sm font-semibold transition"
          >
            About the shop
          </Link>
        </div>
      </div>
    </section>
  );
}
