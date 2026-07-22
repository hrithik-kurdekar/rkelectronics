import { supabase } from '@/config/supabase';
import { PRODUCT_LIST_SELECT } from '@/lib/media-limits';
import { getLocalCatalog } from '@/lib/local-catalog';

/**
 * Single catalog data layer (storefront + admin reads).
 * NEXT_PUBLIC_DEMO_MODE=true  → local fixtures
 * NEXT_PUBLIC_DEMO_MODE=false → Supabase
 */

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export const DEMO_WRITE_MESSAGE =
  'Demo mode: catalog is read-only. Set NEXT_PUBLIC_DEMO_MODE=false to save to Supabase.';

function ok(data) {
  return { data, error: null };
}

function fail(message) {
  return { data: null, error: { message } };
}

function bySort(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

function byCreatedDesc(a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
}

function byCreatedAsc(a, b) {
  return new Date(a.created_at) - new Date(b.created_at);
}

function localCategories({ type, parentId } = {}) {
  let rows = getLocalCatalog().categories;
  if (type) rows = rows.filter((c) => c.type === type);
  if (parentId != null) rows = rows.filter((c) => c.parent_id === parentId);
  return [...rows].sort(bySort);
}

function localProducts({ brandId, rootId, search, conditionsOnly } = {}) {
  let rows = getLocalCatalog().products;
  if (brandId) rows = rows.filter((p) => p.brand_id === brandId);
  if (rootId) rows = rows.filter((p) => p.root_category_id === rootId);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.sku_code?.toLowerCase().includes(q)
    );
  }
  if (conditionsOnly) {
    return rows.map((p) => ({ condition: p.condition }));
  }
  return [...rows].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return byCreatedDesc(a, b);
  });
}

function localCategoryById(id) {
  return getLocalCatalog().categories.find((c) => c.id === id) || null;
}

function localFeatured(limit = 12) {
  const featured = getLocalCatalog()
    .products.filter((p) => p.is_featured)
    .sort(byCreatedDesc);
  if (featured.length > 0) return featured.slice(0, limit);
  return [...getLocalCatalog().products].sort(byCreatedDesc).slice(0, limit);
}

function localProductBySku(sku) {
  const upper = String(sku || '').toUpperCase();
  return getLocalCatalog().products.find((p) => p.sku_code === upper) || null;
}

function localConnections({ activeOnly = false } = {}) {
  let rows = getLocalCatalog().connections;
  if (activeOnly) rows = rows.filter((c) => c.is_active);
  return [...rows].sort(byCreatedAsc);
}

// ——— Storefront ———

export async function fetchRootCategories() {
  if (isDemoMode()) return ok(localCategories({ type: 'root' }));

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'root')
    .order('sort_order');

  return { data: data || [], error };
}

export async function fetchHomeProducts() {
  if (isDemoMode()) {
    const featured = localFeatured(12);
    return {
      featured,
      showingFeatured: featured.some((p) => p.is_featured),
      error: null,
    };
  }

  const { data: featuredRows, error: featuredError } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(12);

  let featured = featuredRows || [];
  let showingFeatured = featured.length > 0;

  if (!showingFeatured) {
    const { data: latest, error: latestError } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .order('created_at', { ascending: false })
      .limit(12);
    featured = latest || [];
    if (latestError && !featuredError) {
      return { featured: [], showingFeatured: false, error: latestError };
    }
  }

  return { featured, showingFeatured, error: featuredError || null };
}

export async function fetchProductsByRootId(rootId) {
  if (isDemoMode()) return ok(localProducts({ rootId }));

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('root_category_id', rootId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function fetchProductBySku(sku) {
  if (isDemoMode()) return ok(localProductBySku(sku));

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku_code', String(sku).toUpperCase())
    .single();

  return { data, error };
}

export async function fetchProductSkuParams() {
  if (isDemoMode()) {
    return getLocalCatalog()
      .products.map((p) => p.sku_code)
      .filter(Boolean)
      .map((code) => ({ id: code.toLowerCase() }));
  }

  const { data } = await supabase.from('products').select('sku_code');
  return (data || [])
    .filter((p) => p.sku_code)
    .map((p) => ({ id: p.sku_code.toLowerCase() }));
}

export async function fetchActiveConnections() {
  if (isDemoMode()) return ok(localConnections({ activeOnly: true }));

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

// ——— Admin reads ———

export async function fetchCategories({ type, parentId } = {}) {
  if (isDemoMode()) return ok(localCategories({ type, parentId }));

  let query = supabase.from('categories').select('*');
  if (type) query = query.eq('type', type);
  if (parentId != null) query = query.eq('parent_id', parentId);
  const { data, error } = await query.order('sort_order');
  return { data: data || [], error };
}

export async function fetchCategoryById(id) {
  if (isDemoMode()) return ok(localCategoryById(id));

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function fetchProductsForBrand(brandId) {
  if (isDemoMode()) return ok(localProducts({ brandId }));

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('brand_id', brandId)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function searchProducts(query) {
  if (isDemoMode()) {
    const term = String(query || '').trim();
    if (!term) return ok([]);
    return ok(localProducts({ search: term }));
  }

  const { searchIlikePattern } = await import('@/lib/search-query');
  const pattern = searchIlikePattern(query);
  if (!pattern) return ok([]);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`title.ilike.${pattern},sku_code.ilike.${pattern}`)
    .order('is_featured', { ascending: false });

  return { data: data || [], error };
}

export async function fetchProductConditions() {
  if (isDemoMode()) return ok(localProducts({ conditionsOnly: true }));

  const { data, error } = await supabase.from('products').select('condition');
  return { data: data || [], error };
}

export async function fetchConnections() {
  if (isDemoMode()) return ok(localConnections({ activeOnly: false }));

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}
