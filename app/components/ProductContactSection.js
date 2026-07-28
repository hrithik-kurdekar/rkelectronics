import { ArrowUpRight } from 'lucide-react';
import {
  iconForConnectionType,
  hrefForProductInquiry,
  actionLabelForConnection,
  hintForConnection,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((connection) => {
            const Icon = iconForConnectionType(connection.type);
            const href = hrefForProductInquiry(connection, product);
            const action = actionLabelForConnection(connection);
            const hint = hintForConnection(connection);
            const accent = accentForConnection(connection);

            const cardClass = `group flex flex-col h-full p-5 rounded-2xl bg-zinc-900/50 border transition-all duration-200 ${accent.border} ${
              href
                ? 'cursor-pointer hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
                : 'opacity-80'
            }`;

            const inner = (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${accent.iconText}`} />
                  </div>
                  {href && (
                    <ArrowUpRight
                      className={`w-4 h-4 flex-shrink-0 mt-1 opacity-50 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${accent.cta}`}
                    />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-white">{connection.label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/80">
                  {href ? (
                    <p className={`text-xs font-bold uppercase tracking-wider ${accent.cta}`}>
                      {action} →
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500">Not available</p>
                  )}
                </div>
              </>
            );

            if (href) {
              return (
                <a
                  key={connection.id}
                  href={href}
                  className={cardClass}
                >
                  {inner}
                </a>
              );
            }

            return (
              <div key={connection.id} className={cardClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
