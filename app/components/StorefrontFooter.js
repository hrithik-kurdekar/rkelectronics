import { Cpu, ArrowUpRight } from 'lucide-react';
import { fetchContactConnections, fetchSocialConnections } from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';
import {
  iconForConnectionType,
  hrefForInquiryConnection,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 lg:gap-y-8 items-start">
          {/* Brand */}
          <div className="space-y-3">
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

          {/* Contact seller */}
          <div className="space-y-3 w-full min-w-0">
            <div className="space-y-1">
              <h2 className={FOOTER_HEADING}>Contact seller</h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Ask about a product before you buy.
              </p>
            </div>
            {contactList.length === 0 ? (
              <p className="text-sm text-zinc-500">No contact channels configured yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 w-full">
                {contactList.map((connection) => {
                  const Icon = iconForConnectionType(connection.type);
                  const href = hrefForInquiryConnection(connection);
                  const label = connection.label;

                  if (!href) {
                    return (
                      <li
                        key={connection.id}
                        className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs text-zinc-500"
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </li>
                    );
                  }

                  return (
                    <li key={connection.id} className="w-full">
                      <a
                        href={href}
                        className="group flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900/80 transition"
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500 group-hover:text-blue-400 transition" />
                        <span className="text-xs font-semibold text-zinc-300 group-hover:text-white truncate flex-1 min-w-0">
                          {label}
                        </span>
                        <ArrowUpRight className="w-3 h-3 flex-shrink-0 text-zinc-600 group-hover:text-blue-400 transition" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Follow for updates */}
          <div className="space-y-3 w-full min-w-0 md:pl-6 lg:pl-10">
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
