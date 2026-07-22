import { Mail, Phone, MessageSquare, Globe } from 'lucide-react';
import { fetchActiveConnections } from '@/lib/data';

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

  if (!connections?.length) return null;

  return (
    <footer className="border-t border-zinc-900 bg-zinc-900/20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">Contact us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {connections.map((connection) => {
            const Icon = iconForType(connection.type);
            const href = hrefForConnection(connection);

            return (
              <div
                key={connection.id}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80"
              >
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{connection.type}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-1">{connection.label}</p>
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
      </div>
    </footer>
  );
}
