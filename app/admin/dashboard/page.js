'use client';

import { useCallback, useEffect, useState } from 'react';
import ErrorBanner from '@/app/components/ErrorBanner';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Link2,
  Package,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

function StatusBadge({ status }) {
  const styles = {
    ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    skipped: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    demo: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    never: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    unconfigured: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const label = {
    ok: 'OK',
    skipped: 'Skipped',
    demo: 'Demo',
    never: 'Not run',
    unconfigured: 'Not set up',
    error: 'Error',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.unconfigured}`}
    >
      {label[status] || status}
    </span>
  );
}

function formatRelativeTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`p-4 rounded-xl border ${color} flex items-center justify-between shadow-sm`}>
      <div className="space-y-1.5 min-w-0">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
          {title}
        </span>
        <div className="text-2xl font-black tracking-tight text-white">{value}</div>
      </div>
      <div className="p-2.5 bg-zinc-950 border border-zinc-800/60 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

function Panel({ title, description, icon: Icon, iconClass, children }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconClass}`} /> {title}
        </h3>
        {description && <p className="text-[11px] text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const pullMetrics = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Could not load dashboard metrics.');
        return;
      }
      setError(null);
      setMetrics(await res.json());
    } catch {
      setError('Could not load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    pullMetrics();
  }, [pullMetrics]);

  const catalog = metrics?.catalog || { total: 0, new: 0, refurbished: 0, used: 0, other: 0 };
  const cardConfig = [
    {
      title: 'Total SKUs',
      value: catalog.total,
      icon: Package,
      color: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    },
    {
      title: 'New stock',
      value: catalog.new,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    },
    {
      title: 'Refurbished',
      value: catalog.refurbished,
      icon: CheckCircle2,
      color: 'text-teal-500 bg-teal-500/5 border-teal-500/10',
    },
    {
      title: 'Used / other',
      value: catalog.used + catalog.other,
      icon: AlertCircle,
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 select-none">
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" /> Store dashboard
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Catalog, traffic, Supabase health, and keep-alive status.
            {metrics?.demoMode && ' Running in demo mode — live metrics are limited.'}
          </p>
        </div>
        <button
          type="button"
          onClick={pullMetrics}
          disabled={refreshing}
          className="h-8 px-3 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {metrics?.warnings?.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
          {metrics.warnings.map((warning) => (
            <p key={warning} className="text-xs text-amber-200/90 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {warning}
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardConfig.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {!loading && metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Featured products"
              value={metrics.featured}
              icon={Zap}
              color="text-violet-500 bg-violet-500/5 border-violet-500/10"
            />
            <MetricCard
              title="Categories"
              value={
                metrics.categories.roots + metrics.categories.subs + metrics.categories.brands
              }
              icon={Users}
              color="text-cyan-500 bg-cyan-500/5 border-cyan-500/10"
            />
            <MetricCard
              title="Active connections"
              value={metrics.connections.total}
              icon={Link2}
              color="text-pink-500 bg-pink-500/5 border-pink-500/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel
              title="Supabase"
              description="Database connectivity from the app server."
              icon={Database}
              iconClass="text-emerald-400"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={metrics.supabase.status} />
                {metrics.supabase.latencyMs != null && (
                  <span className="text-xs font-mono text-zinc-400">
                    {metrics.supabase.latencyMs} ms
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-400">{metrics.supabase.message}</p>
              <dl className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Roots</dt>
                  <dd className="text-lg font-bold text-white">{metrics.categories.roots}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Subs</dt>
                  <dd className="text-lg font-bold text-white">{metrics.categories.subs}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Brands</dt>
                  <dd className="text-lg font-bold text-white">{metrics.categories.brands}</dd>
                </div>
              </dl>
            </Panel>

            <Panel
              title="Keep-alive"
              description="Prevents Supabase free-tier pause after 7 days idle. Runs daily via Vercel cron."
              icon={Server}
              iconClass="text-blue-400"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={metrics.keepAlive.status} />
                <span className="text-xs text-zinc-500">
                  Cron {metrics.keepAlive.cronConfigured ? 'configured' : 'not configured'}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{metrics.keepAlive.message}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                Last run: {formatRelativeTime(metrics.keepAlive.lastAt)}
                {metrics.keepAlive.latencyMs != null && (
                  <span className="font-mono">({metrics.keepAlive.latencyMs} ms)</span>
                )}
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Panel
              title="Storefront traffic"
              description="Page views recorded from public routes."
              icon={TrendingUp}
              iconClass="text-orange-400"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={metrics.traffic.status} />
              </div>
              {metrics.traffic.status === 'ok' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">7 days</p>
                      <p className="text-2xl font-black text-white">{metrics.traffic.views7d}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">30 days</p>
                      <p className="text-2xl font-black text-white">{metrics.traffic.views30d}</p>
                    </div>
                  </div>
                  {metrics.traffic.topPaths.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {metrics.traffic.topPaths.map(({ path, views }) => (
                        <li
                          key={path}
                          className="flex justify-between gap-2 text-xs text-zinc-400"
                        >
                          <span className="truncate font-mono">{path}</span>
                          <span className="text-zinc-500 flex-shrink-0">{views}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-500">{metrics.traffic.message}</p>
              )}
            </Panel>

            <Panel
              title="Connections"
              description="Contact vs social channels configured in settings."
              icon={BarChart3}
              iconClass="text-purple-400"
            >
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Contact seller</span>
                    <span className="text-zinc-500 font-mono">{metrics.connections.contact}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: metrics.connections.total
                          ? `${(metrics.connections.contact / metrics.connections.total) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Follow for updates</span>
                    <span className="text-zinc-500 font-mono">{metrics.connections.social}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: metrics.connections.total
                          ? `${(metrics.connections.social / metrics.connections.total) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Storage"
              description="Product media bucket object count (requires service role)."
              icon={HardDrive}
              iconClass="text-violet-400"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={metrics.storage.status} />
              </div>
              {metrics.storage.status === 'ok' ? (
                <p className="text-2xl font-black text-white">{metrics.storage.objectCount}</p>
              ) : (
                <p className="text-sm text-zinc-500">{metrics.storage.message}</p>
              )}
              {metrics.newestProduct && (
                <div className="border-t border-zinc-800/80 pt-3 mt-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">
                    Newest listing
                  </p>
                  <p className="text-sm text-zinc-300 truncate">{metrics.newestProduct.title}</p>
                  <p className="text-xs font-mono text-zinc-600">{metrics.newestProduct.sku_code}</p>
                </div>
              )}
            </Panel>
          </div>

          <p className="text-[10px] text-zinc-600 text-right font-mono">
            Updated {formatRelativeTime(metrics.generatedAt)}
          </p>
        </>
      )}
    </div>
  );
}
