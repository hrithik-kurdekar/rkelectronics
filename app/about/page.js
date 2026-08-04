import Link from 'next/link';
import StorefrontHeader from '@/app/components/StorefrontHeader';
import StorefrontFooter from '@/app/components/StorefrontFooter';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export const metadata = {
  title: 'About Us | RK Electronics',
  description: 'Learn about RK Electronics — refurbished electronics with clear grading and direct inquiry.',
};

export const revalidate = 3600;

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <StorefrontHeader />

      <section className={`${STOREFRONT_CONTAINER} py-14 sm:py-20 flex-1`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400/90 mb-3">
          About Us
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white max-w-2xl">
          Built for buyers who want clarity before they commit.
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
          <p>
            RK Electronics specializes in refurbished and pre-owned electronics — listed with
            condition grades so you know what you&apos;re looking at before you inquire.
          </p>
          <p>
            Browse by category, open a product for details, and reach out through the contact
            channels on this site. There is no checkout cart: we handle interest directly.
          </p>
          <p>
            Questions about a listing? Open the product page and use the chat links there — we&apos;re
            happy to help you confirm availability and condition.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex mt-10 h-11 px-5 items-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
        >
          Back to storefront
        </Link>
      </section>

      <StorefrontFooter />
    </div>
  );
}
