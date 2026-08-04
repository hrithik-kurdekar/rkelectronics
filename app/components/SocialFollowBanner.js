import { ArrowUpRight } from 'lucide-react';
import {
  iconForSocialConnection,
  hrefForConnection,
  accentForSocialConnection,
  socialPlatformLabel,
  detectSocialPlatform,
} from '@/lib/connections';

function connectionLabel(connection) {
  return connection.label || socialPlatformLabel(detectSocialPlatform(connection));
}

export default function SocialFollowBanner({ connections = [] }) {
  const list = connections.filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className="mt-6 sm:mt-10 lg:mt-12">
      {/* Mobile: subtitle + rectangular icon row */}
      <div className="sm:hidden space-y-3 w-full">
        <p className="text-sm text-zinc-400 leading-relaxed">
          New listings go live on these channels as they arrive, follow to get notified first.
        </p>
        <ul className="flex justify-center gap-2 w-full">
          {list.map((connection) => {
            const Icon = iconForSocialConnection(connection);
            const href = hrefForConnection(connection);
            const accent = accentForSocialConnection(connection);
            const label = connectionLabel(connection);

            const iconClass = `h-12 w-full rounded-lg flex items-center justify-center border transition-all duration-200 ${accent.border} ${accent.iconBg} ${
              href ? 'active:scale-95' : 'opacity-60'
            }`;

            const icon = <Icon className={`w-5 h-5 ${accent.iconText}`} />;

            if (href) {
              return (
                <li key={connection.id} className="flex-1 min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconClass}
                    aria-label={label}
                  >
                    {icon}
                  </a>
                </li>
              );
            }

            return (
              <li key={connection.id} className="flex-1 min-w-0">
                <span className={iconClass} aria-label={`${label} (unavailable)`}>
                  {icon}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* sm+: card grid */}
      <div className="hidden sm:block space-y-4">
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          New listings go live on these channels as they arrive, follow to get notified first.
        </p>

        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {list.map((connection) => {
            const Icon = iconForSocialConnection(connection);
            const href = hrefForConnection(connection);
            const accent = accentForSocialConnection(connection);
            const label = connectionLabel(connection);

            const rowClass = `group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/20 border transition-all duration-200 h-full w-full min-w-0 ${accent.border} ${
              href ? 'cursor-pointer hover:bg-black/35 hover:shadow-lg hover:shadow-black/20' : 'opacity-80'
            }`;

            const inner = (
              <>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${accent.iconText}`} />
                </div>

                <span className={`text-sm font-semibold truncate min-w-0 ${accent.cta}`}>
                  {label}
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
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClass}
                  >
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
      </div>
    </div>
  );
}
