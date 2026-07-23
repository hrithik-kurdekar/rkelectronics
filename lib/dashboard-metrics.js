import 'server-only';
import { supabase } from '@/config/supabase';
import { isDemoMode } from '@/lib/data';
import { getAdminClient } from '@/lib/supabase/admin';
import { countProductsByCondition } from '@/lib/product-conditions';
import {
  CONTACT_CONNECTION_TYPES,
  SOCIAL_CONNECTION_TYPES,
} from '@/lib/connection-types';
import { fetchLastKeepAlive } from '@/lib/keep-alive';
import { isMissingRelation, isPermissionDenied } from '@/lib/supabase-errors';
import { getLocalCatalog } from '@/lib/local-catalog';

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function localCatalogMetrics() {
  const catalog = getLocalCatalog();
  const products = catalog.products || [];
  const categories = catalog.categories || [];
  const connections = catalog.connections || [];

  return {
    catalog: countProductsByCondition(products),
    categories: {
      roots: categories.filter((c) => c.type === 'root').length,
      subs: categories.filter((c) => c.type === 'sub').length,
      brands: categories.filter((c) => c.type === 'brand').length,
    },
    connections: {
      contact: connections.filter(
        (c) => c.is_active && CONTACT_CONNECTION_TYPES.includes(c.type)
      ).length,
      social: connections.filter(
        (c) => c.is_active && SOCIAL_CONNECTION_TYPES.includes(c.type)
      ).length,
      total: connections.filter((c) => c.is_active).length,
    },
    featured: products.filter((p) => p.is_featured).length,
    newestProduct: products
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null,
  };
}

async function supabasePing() {
  if (!hasSupabaseConfig()) {
    return { status: 'unconfigured', latencyMs: null, message: 'Supabase env vars missing' };
  }

  const start = Date.now();
  const { error } = await supabase.from('categories').select('id').limit(1);
  const latencyMs = Date.now() - start;

  if (error) {
    return { status: 'error', latencyMs, message: error.message };
  }

  return { status: 'ok', latencyMs, message: 'Connected' };
}

async function supabaseCatalogMetrics() {
  const [
    productsRes,
    rootsRes,
    subsRes,
    brandsRes,
    connectionsRes,
    featuredRes,
    newestRes,
  ] = await Promise.all([
    supabase.from('products').select('condition'),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('type', 'root'),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('type', 'sub'),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('type', 'brand'),
    supabase.from('connections').select('type, is_active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
    supabase
      .from('products')
      .select('title, sku_code, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const firstError =
    productsRes.error ||
    rootsRes.error ||
    subsRes.error ||
    brandsRes.error ||
    connectionsRes.error ||
    featuredRes.error ||
    newestRes.error;

  if (firstError) {
    return { error: firstError.message };
  }

  const activeConnections = (connectionsRes.data || []).filter((c) => c.is_active);

  return {
    catalog: countProductsByCondition(productsRes.data || []),
    categories: {
      roots: rootsRes.count || 0,
      subs: subsRes.count || 0,
      brands: brandsRes.count || 0,
    },
    connections: {
      contact: activeConnections.filter((c) => CONTACT_CONNECTION_TYPES.includes(c.type)).length,
      social: activeConnections.filter((c) => SOCIAL_CONNECTION_TYPES.includes(c.type)).length,
      total: activeConnections.length,
    },
    featured: featuredRes.count || 0,
    newestProduct: newestRes.data || null,
  };
}

async function fetchTrafficMetrics() {
  if (isDemoMode()) {
    return {
      status: 'demo',
      views7d: null,
      views30d: null,
      topPaths: [],
      message: 'Traffic tracking is disabled in demo mode',
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      status: 'unconfigured',
      views7d: null,
      views30d: null,
      topPaths: [],
      message: 'Supabase not configured',
    };
  }

  let client = supabase;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      client = getAdminClient();
    } catch {
      client = supabase;
    }
  }

  const now = new Date();
  const days7 = new Date(now);
  days7.setDate(days7.getDate() - 7);
  const days30 = new Date(now);
  days30.setDate(days30.getDate() - 30);

  const [views7dRes, views30dRes, recentRes] = await Promise.all([
    client
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('viewed_at', days7.toISOString()),
    client
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('viewed_at', days30.toISOString()),
    client
      .from('page_views')
      .select('path')
      .gte('viewed_at', days30.toISOString())
      .limit(500),
  ]);

  const tableError = views7dRes.error || views30dRes.error || recentRes.error;
  if (tableError) {
    if (isMissingRelation(tableError)) {
      return {
        status: 'unconfigured',
        views7d: null,
        views30d: null,
        topPaths: [],
        message: 'Run migration 004_dashboard_analytics.sql to enable traffic tracking',
      };
    }
    if (isPermissionDenied(tableError)) {
      return {
        status: 'unconfigured',
        views7d: null,
        views30d: null,
        topPaths: [],
        message: 'Set SUPABASE_SERVICE_ROLE_KEY to read traffic on the dashboard',
      };
    }
    return {
      status: 'error',
      views7d: null,
      views30d: null,
      topPaths: [],
      message: tableError.message,
    };
  }

  const pathCounts = {};
  for (const row of recentRes.data || []) {
    pathCounts[row.path] = (pathCounts[row.path] || 0) + 1;
  }

  const topPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  return {
    status: 'ok',
    views7d: views7dRes.count || 0,
    views30d: views30dRes.count || 0,
    topPaths,
    message: null,
  };
}

async function fetchStorageMetrics() {
  if (isDemoMode()) {
    return {
      status: 'demo',
      objectCount: null,
      message: 'Storage metrics unavailable in demo mode',
    };
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    return {
      status: 'unconfigured',
      objectCount: null,
      message: 'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET not set',
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      status: 'unconfigured',
      objectCount: null,
      message: 'Service role key required for storage metrics',
    };
  }

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.storage.from(bucket).list('', { limit: 1000 });

    if (error) {
      return { status: 'error', objectCount: null, message: error.message };
    }

    return {
      status: 'ok',
      objectCount: (data || []).length,
      message: null,
    };
  } catch (err) {
    return {
      status: 'error',
      objectCount: null,
      message: err.message || String(err),
    };
  }
}

function buildWarnings({ cronConfigured, keepAlive, traffic, storage }) {
  const warnings = [];

  if (!isDemoMode() && !cronConfigured) {
    warnings.push('CRON_SECRET is not set — scheduled keep-alive will not run on Vercel');
  }

  if (keepAlive.status === 'never') {
    warnings.push('Keep-alive has never run — deploy cron or call /api/cron/keep-alive manually');
  }

  if (traffic.status === 'unconfigured') {
    warnings.push(traffic.message);
  }

  if (storage.status === 'unconfigured' && !isDemoMode()) {
    warnings.push(storage.message);
  }

  return warnings;
}

export async function fetchDashboardMetrics() {
  const demoMode = isDemoMode();
  const generatedAt = new Date().toISOString();
  const cronConfigured = Boolean(process.env.CRON_SECRET);

  let store = null;
  if (demoMode) {
    store = localCatalogMetrics();
  } else if (hasSupabaseConfig()) {
    store = await supabaseCatalogMetrics();
    if (store.error) {
      store = { error: store.error };
    }
  } else {
    store = { error: 'Supabase not configured' };
  }

  const [supabaseHealth, keepAlive, traffic, storage] = await Promise.all([
    demoMode
      ? Promise.resolve({ status: 'skipped', latencyMs: null, message: 'Demo mode' })
      : supabasePing(),
    fetchLastKeepAlive(),
    fetchTrafficMetrics(),
    fetchStorageMetrics(),
  ]);

  const warnings = buildWarnings({ cronConfigured, keepAlive, traffic, storage });

  if (store?.error) {
    warnings.push(`Catalog metrics: ${store.error}`);
  }

  return {
    demoMode,
    generatedAt,
    catalog: store?.catalog || { total: 0, new: 0, refurbished: 0, used: 0, other: 0 },
    categories: store?.categories || { roots: 0, subs: 0, brands: 0 },
    connections: store?.connections || { contact: 0, social: 0, total: 0 },
    featured: store?.featured ?? 0,
    newestProduct: store?.newestProduct || null,
    supabase: supabaseHealth,
    keepAlive: {
      ...keepAlive,
      cronConfigured,
    },
    traffic,
    storage,
    warnings,
  };
}
