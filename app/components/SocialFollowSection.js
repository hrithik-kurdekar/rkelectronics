import { ArrowUpRight } from 'lucide-react';
import {
  hrefForConnection,
  iconForSocialConnection,
  socialPlatformLabel,
  detectSocialPlatform,
} from '@/lib/connections';

export default function SocialFollowSection({ connections = [], compact = false }) {
  const list = connections.filter(Boolean);
  if (list.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-3 h-full">
        <div className="space-y-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Follow for updates
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            New listings posted on these channels.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {list.map((connection) => {
            const Icon = iconForSocialConnection(connection);
            const href = hrefForConnection(connection);
            const platform = socialPlatformLabel(detectSocialPlatform(connection));
            const label = connection.label || platform;

            if (!href) {
              return (
                <li
                  key={connection.id}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs text-zinc-500"
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </li>
              );
            }

            return (
              <li key={connection.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900/80 transition"
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
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Follow for new products</h2>
        <p className="text-sm text-zinc-500">Join to get notified when new products are posted.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((connection) => {
          const Icon = iconForSocialConnection(connection);
          const href = hrefForConnection(connection);
          const platform = socialPlatformLabel(detectSocialPlatform(connection));
          const label = connection.label || platform;

          const cardClass =
            'group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-600 hover:bg-zinc-900/70 transition';

          const inner = (
            <>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{label}</p>
                <p className="text-xs text-zinc-500">{platform}</p>
              </div>
              {href && (
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 flex-shrink-0 transition" />
              )}
            </>
          );

          if (href) {
            return (
              <a
                key={connection.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
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
    </section>
  );
}
