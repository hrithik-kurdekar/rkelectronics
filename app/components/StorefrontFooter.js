import Link from 'next/link';
import { Cpu } from 'lucide-react';
import { fetchContactConnections, fetchSocialConnections } from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';
import {
  iconForConnectionType,
  hrefForConnection,
  displayValueForConnection,
} from '@/lib/connections';
import SocialFollowSection from '@/app/components/SocialFollowSection';

const FOOTER_HEADING =
  'text-[11px] font-bold uppercase tracking-wider text-zinc-500';

export default async function StorefrontFooter() {
  const [{ data: contactConnections }, { data: socialConnections }] = await Promise.all([
    fetchContactConnections(),
    fetchSocialConnections(),
  ]);
  const contactList = contactConnections || [];
  const socialList = socialConnections || [];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-900/30 mt-auto">
      <div className={`${STOREFRONT_CONTAINER} py-12 lg:py-14`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 lg:gap-y-8 items-start">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-3 lg:pr-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white uppercase">
                RK Electronics
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Premium refurbished electronics with clear grading. Browse the catalog and inquire
              directly when something fits.
            </p>
            <p className="text-[11px] text-zinc-600 pt-1">© {year} RK Electronics. All rights reserved.</p>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className={FOOTER_HEADING}>Explore</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-zinc-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#categories" className="text-zinc-300 hover:text-white transition">
                  Categories
                </a>
              </li>
              <li>
                <a href="/#highlights" className="text-zinc-300 hover:text-white transition">
                  New &amp; featured
                </a>
              </li>
              <li>
                <Link href="/about" className="text-zinc-300 hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact seller */}
          <div className="lg:col-span-3 space-y-3">
            <div className="space-y-1">
              <h2 className={FOOTER_HEADING}>Contact seller</h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Ask about a product before you buy.
              </p>
            </div>
            {contactList.length === 0 ? (
              <p className="text-sm text-zinc-500">No contact channels configured yet.</p>
            ) : (
              <ul className="space-y-2">
                {contactList.map((connection) => {
                  const Icon = iconForConnectionType(connection.type);
                  const href = hrefForConnection(connection);
                  const display = displayValueForConnection(connection);

                  return (
                    <li
                      key={connection.id}
                      className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80"
                    >
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                          {connection.label}
                        </span>
                      </div>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 break-all transition"
                        >
                          {display}
                        </a>
                      ) : (
                        <span className="text-sm text-zinc-300 break-all">{display}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Follow for updates */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            {socialList.length > 0 ? (
              <SocialFollowSection connections={socialList} compact />
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className={FOOTER_HEADING}>Follow for updates</h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    New listings posted on social channels.
                  </p>
                </div>
                <p className="text-sm text-zinc-500">No social channels configured yet.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
