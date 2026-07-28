import { ArrowUpRight } from 'lucide-react';
import {
  iconForConnectionType,
  hrefForProductInquiry,
  accentForConnection,
} from '@/lib/connections';

export default function ProductContactSection({ connections = [], product }) {
  const list = connections.filter(Boolean);

  return (
    <section className="space-y-6 border-t border-zinc-900 pt-10">
      <div className="space-y-2 max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Interested in this product?
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Contact RK Electronics directly to check availability, ask about condition, or arrange a
          viewing. Tap a channel below to start a conversation — we typically reply the same day.
        </p>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-zinc-500 py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
          Contact options will appear here once configured.
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {list.map((connection) => {
            const Icon = iconForConnectionType(connection.type);
            const href = hrefForProductInquiry(connection, product);
            const accent = accentForConnection(connection);

            const rowClass = `group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-900/50 border transition-all duration-200 h-full w-full min-w-0 ${accent.border} ${
              href ? 'cursor-pointer hover:bg-zinc-900/80' : 'opacity-80'
            }`;

            const inner = (
              <>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${accent.iconText}`} />
                </div>

                <span className={`text-sm font-semibold truncate min-w-0 ${accent.cta}`}>
                  {connection.label}
                </span>

                <span className="flex-1 min-w-6" aria-hidden="true" />

                {href ? (
                  <ArrowUpRight
                    className={`w-4 h-4 flex-shrink-0 opacity-50 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${accent.cta}`}
                  />
                ) : (
                  <span className="text-xs text-zinc-500 flex-shrink-0">Unavailable</span>
                )}
              </>
            );

            if (href) {
              return (
                <li key={connection.id} className="min-w-0">
                  <a href={href} className={rowClass}>
                    {inner}
                  </a>
                </li>
              );
            }

            return (
              <li key={connection.id} className={`min-w-0 ${rowClass}`}>
                {inner}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
