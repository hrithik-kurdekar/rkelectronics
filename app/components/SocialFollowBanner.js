import { ArrowUpRight } from 'lucide-react';
import {
  iconForSocialConnection,
  hrefForConnection,
  accentForSocialConnection,
  socialPlatformLabel,
  detectSocialPlatform,
} from '@/lib/connections';

export default function SocialFollowBanner({ connections = [] }) {
  const list = connections.filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-bold tracking-tight text-white">Follow for updates</h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          New listings posted on these channels.
        </p>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {list.map((connection) => {
          const Icon = iconForSocialConnection(connection);
          const href = hrefForConnection(connection);
          const accent = accentForSocialConnection(connection);
          const label =
            connection.label ||
            socialPlatformLabel(detectSocialPlatform(connection));

          const rowClass = `group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-950/40 border transition-all duration-200 h-full w-full min-w-0 ${accent.border} ${
            href ? 'cursor-pointer hover:bg-zinc-950/70' : 'opacity-80'
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
  );
}
