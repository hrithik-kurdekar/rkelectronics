import Link from 'next/link';
import { Cpu, Mail, Phone, MessageSquare, Globe } from 'lucide-react';
import { fetchActiveConnections } from '@/lib/data';
import { STOREFRONT_CONTAINER } from '@/lib/storefront-layout';

function iconForType(type) {
  switch (type) {
    case 'Email':
      return Mail;
    case 'Phone':
      return Phone;
    case 'Chat Link':
      return MessageSquare;
    default:
      return Globe;
  }
}

function hrefForConnection(connection) {
  const value = connection.value?.trim();
  if (!value) return null;

  if (value.startsWith('http') || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }

  if (connection.type === 'Email') return `mailto:${value}`;
  if (connection.type === 'Phone') return `tel:${value}`;
  return value;
}

export default async function StorefrontFooter() {
  const { data: connections } = await fetchActiveConnections();
  const list = connections || [];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-900/30 mt-auto">
      <div className={`${STOREFRONT_CONTAINER} py-12 lg:py-14`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
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
            <p className="text-[11px] text-zinc-600">© {year} RK Electronics. All rights reserved.</p>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Explore</h2>
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
                <Link href="/about" className="text-zinc-300 hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Contact</h2>
            {list.length === 0 ? (
              <p className="text-sm text-zinc-500">Contact details will appear here when configured.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.map((connection) => {
                  const Icon = iconForType(connection.type);
                  const href = hrefForConnection(connection);

                  return (
                    <div
                      key={connection.id}
                      className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80"
                    >
                      <div className="flex items-center gap-2 text-zinc-500 mb-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {connection.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-0.5">{connection.label}</p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 break-all transition"
                        >
                          {connection.value.replace(/^(mailto:|tel:)/, '')}
                        </a>
                      ) : (
                        <span className="text-sm text-zinc-300">{connection.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
