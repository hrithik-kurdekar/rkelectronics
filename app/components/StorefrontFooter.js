import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

export default function StorefrontFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-900/30 mt-auto">
      <div className={`${STOREFRONT_CONTAINER} py-4`}>
        <p className="text-center text-base text-zinc-500">
          © {year} RK Electronics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
