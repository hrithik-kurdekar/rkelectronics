import Link from 'next/link';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import SocialFollowBanner from '@/app/components/SocialFollowBanner';
import HeroVisual from '@/app/components/HeroVisual';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

const TRUST_CHIPS = ['Graded & tested', 'Same-day replies', 'Refurbished stock'];

export default function StorefrontHero({ socialConnections = [] }) {
  return (
    <section className="relative w-full overflow-hidden border-b border-zinc-800/60">
      {/* Base gradient */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#09090b_0%,#0a0f1a_40%,#09090b_100%)]"
        aria-hidden
      />

      {/* Mesh blobs */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(37,99,235,0.32),transparent_55%),radial-gradient(ellipse_at_85%_15%,rgba(99,102,241,0.14),transparent_50%),radial-gradient(ellipse_at_70%_75%,rgba(14,165,233,0.12),transparent_45%)]"
        aria-hidden
      />

      {/* Slow pulse blob */}
      <div
        className="absolute top-1/4 left-1/3 w-[480px] h-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl motion-safe:animate-pulse motion-reduce:animate-none"
        aria-hidden
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      {/* Diagonal scan lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)',
        }}
        aria-hidden
      />

      <div className={`relative ${STOREFRONT_CONTAINER} py-8 sm:py-14 lg:py-20 xl:py-24`}>
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Left: copy */}
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08] sm:leading-[1.06]">
              Trusted refurbished electronics,{' '}
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
                ready for work.
              </span>
            </h1>

            <p className="mt-3 sm:mt-5 max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed">
              Browse graded stock across categories — inquire on WhatsApp when you find the right
              piece.
            </p>

            <ul className="mt-4 sm:mt-6 grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2">
              {TRUST_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="flex items-center justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] sm:text-xs font-medium text-zinc-300 min-w-0 text-center leading-tight"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400/90 flex-shrink-0" />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 sm:mt-8 flex gap-2.5 sm:gap-3">
              <a
                href="#categories"
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 min-w-0"
              >
                Browse categories
                <ArrowDown className="w-4 h-4 flex-shrink-0" />
              </a>
              <Link
                href="/about"
                className="flex-1 inline-flex items-center justify-center h-10 sm:h-11 px-3 sm:px-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm text-zinc-200 hover:bg-white/[0.08] hover:text-white text-sm font-semibold transition min-w-0"
              >
                About us
              </Link>
            </div>
          </div>

          {/* Right: visual panel (desktop) */}
          <HeroVisual />
        </div>

        <SocialFollowBanner connections={socialConnections} />
      </div>
    </section>
  );
}
