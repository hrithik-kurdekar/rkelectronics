import { supabase } from '@/config/supabase';
import { PRODUCT_LIST_SELECT } from '@/lib/media-limits';
import { getLocalCatalog } from '@/lib/local-catalog';
import { NEW_ARRIVALS_MAX_AGE_DAYS } from '@/lib/product-collections';
import { CONTACT_CONNECTION_TYPES, SOCIAL_CONNECTION_TYPES } from '@/lib/connection-types';
import {
  STOREFRONT_SECTION_BATCH,
  STOREFRONT_SECTION_PRODUCT_LIMIT,
  indexProductsByBrand,
  pickFairProductsForRoot,
  pickFairProductsForSub,
  pickProductsForBrand,
} from '@/lib/fair-product-pick';

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

function localProducts({ brandId, rootId, subId, search, conditionsOnly } = {}) {
  let rows = getLocalCatalog().products;
  if (brandId) rows = rows.filter((p) => p.brand_id === brandId);
  if (rootId) rows = rows.filter((p) => p.root_category_id === rootId);
  if (subId) rows = rows.filter((p) => p.sub_category_id === subId);
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

function localConnections({ activeOnly = false, types = null } = {}) {
  let rows = getLocalCatalog().connections;
  if (activeOnly) rows = rows.filter((c) => c.is_active);
  if (types?.length) rows = rows.filter((c) => types.includes(c.type));
  return [...rows].sort(byCreatedAsc);
}

function localAllProductsSorted() {
  return [...getLocalCatalog().products].sort(byCreatedDesc);
}

function localNewArrivalProducts() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_ARRIVALS_MAX_AGE_DAYS);
  return localAllProductsSorted().filter((p) => new Date(p.created_at) >= cutoff);
}

function localFeaturedProductsAll() {
  return localAllProductsSorted().filter((p) => p.is_featured);
}

function paginateLocal(rows, offset, limit) {
  const slice = rows.slice(offset, offset + limit + 1);
  const hasMore = slice.length > limit;
  return { products: slice.slice(0, limit), hasMore };
}

function groupByParent(categories) {
  const map = {};
  for (const cat of categories) {
    const key = cat.parent_id || '__root__';
    if (!map[key]) map[key] = [];
    map[key].push(cat);
  }
  for (const key of Object.keys(map)) {
    map[key].sort(bySort);
  }
  return map;
}

async function loadCategoriesByParentIds(parentIds, type) {
  if (!parentIds.length) return [];
  if (isDemoMode()) {
    return parentIds.flatMap((parentId) => localCategories({ type, parentId }));
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .in('parent_id', parentIds)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

async function loadProductsForRootIds(rootIds) {
  if (!rootIds.length) return [];
  if (isDemoMode()) {
    return rootIds.flatMap((rootId) => localProducts({ rootId }));
  }
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .in('root_category_id', rootIds)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadProductsForSubIds(subIds) {
  if (!subIds.length) return [];
  if (isDemoMode()) {
    return subIds.flatMap((subId) => localProducts({ subId }));
  }
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .in('sub_category_id', subIds)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadProductsForBrandIds(brandIds) {
  if (!brandIds.length) return [];
  if (isDemoMode()) {
    return brandIds.flatMap((brandId) => localProducts({ brandId }));
  }
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .in('brand_id', brandIds)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadBrandIdsWithProducts(brandIds) {
  if (!brandIds.length) return new Set();
  if (isDemoMode()) {
    const products = brandIds.flatMap((brandId) => localProducts({ brandId }));
    return new Set(products.map((p) => p.brand_id).filter(Boolean));
  }
  const { data, error } = await supabase
    .from('products')
    .select('brand_id')
    .in('brand_id', brandIds);
  if (error) throw error;
  return new Set((data || []).map((p) => p.brand_id).filter(Boolean));
}

/** Distinct category IDs that appear on at least one product. */
async function loadProductCategoryIds({ rootId } = {}) {
  if (isDemoMode()) {
    let products = getLocalCatalog().products;
    if (rootId) products = products.filter((p) => p.root_category_id === rootId);
    return {
      rootIds: new Set(products.map((p) => p.root_category_id).filter(Boolean)),
      subIds: new Set(products.map((p) => p.sub_category_id).filter(Boolean)),
      brandIds: new Set(products.map((p) => p.brand_id).filter(Boolean)),
    };
  }

  let query = supabase
    .from('products')
    .select('root_category_id, sub_category_id, brand_id');
  if (rootId) query = query.eq('root_category_id', rootId);

  const { data, error } = await query;
  if (error) throw error;

  const rootIds = new Set();
  const subIds = new Set();
  const brandIds = new Set();
  for (const row of data || []) {
    if (row.root_category_id) rootIds.add(row.root_category_id);
    if (row.sub_category_id) subIds.add(row.sub_category_id);
    if (row.brand_id) brandIds.add(row.brand_id);
  }
  return { rootIds, subIds, brandIds };
}

/** Brands under a sub that have at least one product. */
export async function fetchBrandsWithProducts(subId) {
  const { data: brands, error } = await fetchCategories({ type: 'brand', parentId: subId });
  if (error) return { data: [], error };
  const list = brands || [];
  if (!list.length) return ok([]);
  try {
    const withProducts = await loadBrandIdsWithProducts(list.map((b) => b.id));
    return ok(list.filter((b) => withProducts.has(b.id)));
  } catch (err) {
    return { data: [], error: { message: err.message || String(err) } };
  }
}

/** Subs under a root that have at least one product (via a brand). */
export async function fetchSubsWithProducts(rootId) {
  const { data: subs, error } = await fetchCategories({ type: 'sub', parentId: rootId });
  if (error) return { data: [], error };
  const list = subs || [];
  if (!list.length) return ok([]);
  try {
    const { subIds } = await loadProductCategoryIds({ rootId });
    return ok(list.filter((s) => subIds.has(s.id)));
  } catch (err) {
    return { data: [], error: { message: err.message || String(err) } };
  }
}

/** Root categories that have at least one product anywhere underneath. */
export async function fetchRootsWithProducts() {
  const { data: roots, error } = await fetchRootCategories();
  if (error) return { data: [], error };
  const list = roots || [];
  if (!list.length) return ok([]);
  try {
    const { rootIds } = await loadProductCategoryIds();
    return ok(list.filter((r) => rootIds.has(r.id)));
  } catch (err) {
    return { data: [], error: { message: err.message || String(err) } };
  }
}

/**
 * Build browse sections for a parent level.
 * level: 'home' (sections = roots) | 'root' (sections = subs) | 'sub' (sections = brands)
 */
export async function fetchBrowseSections({
  level,
  parentId = null,
  offset = 0,
  limit = STOREFRONT_SECTION_BATCH,
  productsPerSection = STOREFRONT_SECTION_PRODUCT_LIMIT,
  excludeCategoryId = null,
} = {}) {
  try {
    let sectionCategories = [];

    if (level === 'home') {
      const { data, error } = await fetchRootsWithProducts();
      if (error) return { sections: [], hasMore: false, error };
      sectionCategories = data || [];
    } else if (level === 'root') {
      if (!parentId) return { sections: [], hasMore: false, error: null };
      const { data, error } = await fetchSubsWithProducts(parentId);
      if (error) return { sections: [], hasMore: false, error };
      sectionCategories = data || [];
    } else if (level === 'sub') {
      if (!parentId) return { sections: [], hasMore: false, error: null };
      const { data, error } = await fetchBrandsWithProducts(parentId);
      if (error) return { sections: [], hasMore: false, error };
      sectionCategories = data || [];
    } else {
      return { sections: [], hasMore: false, error: { message: 'Invalid browse level' } };
    }

    if (excludeCategoryId) {
      sectionCategories = sectionCategories.filter((c) => c.id !== excludeCategoryId);
    }

    const slice = sectionCategories.slice(offset, offset + limit);
    const hasMore = offset + limit < sectionCategories.length;

    if (slice.length === 0) {
      return { sections: [], hasMore: false, error: null };
    }

    let sections = [];

    if (level === 'home') {
      const rootIds = slice.map((r) => r.id);
      const subs = await loadCategoriesByParentIds(rootIds, 'sub');
      const subsByRoot = groupByParent(subs);
      const subIds = subs.map((s) => s.id);
      const brands = await loadCategoriesByParentIds(subIds, 'brand');
      const brandsGrouped = groupByParent(brands);
      const products = await loadProductsForRootIds(rootIds);
      const productsByBrandId = indexProductsByBrand(products);

      sections = slice.map((root) => {
        const allRootSubs = subsByRoot[root.id] || [];
        const brandsForSubs = {};
        for (const sub of allRootSubs) {
          brandsForSubs[sub.id] = (brandsGrouped[sub.id] || []).filter(
            (brand) => (productsByBrandId.get(brand.id) || []).length > 0
          );
        }
        const rootSubs = allRootSubs.filter(
          (sub) => (brandsForSubs[sub.id] || []).length > 0
        );
        return {
          category: root,
          products: pickFairProductsForRoot({
            subs: rootSubs,
            brandsBySubId: brandsForSubs,
            productsByBrandId,
            limit: productsPerSection,
          }),
        };
      });
    } else if (level === 'root') {
      const subIds = slice.map((s) => s.id);
      const brands = await loadCategoriesByParentIds(subIds, 'brand');
      const brandsGrouped = groupByParent(brands);
      const products = await loadProductsForSubIds(subIds);
      const productsByBrandId = indexProductsByBrand(products);

      sections = slice.map((sub) => {
        const subBrands = (brandsGrouped[sub.id] || []).filter(
          (brand) => (productsByBrandId.get(brand.id) || []).length > 0
        );
        return {
          category: sub,
          products: pickFairProductsForSub({
            brands: subBrands,
            productsByBrandId,
            limit: productsPerSection,
          }),
        };
      });
    } else {
      const brandIds = slice.map((b) => b.id);
      const products = await loadProductsForBrandIds(brandIds);
      const byBrand = {};
      for (const product of products) {
        if (!byBrand[product.brand_id]) byBrand[product.brand_id] = [];
        byBrand[product.brand_id].push(product);
      }

      sections = slice
        .map((brand) => ({
          category: brand,
          products: pickProductsForBrand(byBrand[brand.id] || [], productsPerSection),
        }))
        .filter((section) => section.products.length > 0);
    }

    return { sections, hasMore, error: null };
  } catch (error) {
    return { sections: [], hasMore: false, error: { message: error.message || String(error) } };
  }
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

/**
 * Paginated product collections for home previews and browse pages.
 * kind: 'new-arrivals' | 'featured'
 */
export async function fetchProductCollection({ kind, offset = 0, limit = 24 } = {}) {
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.min(Math.max(1, Number(limit) || 24), 48);

  if (kind === 'new-arrivals') {
    if (isDemoMode()) {
      const { products, hasMore } = paginateLocal(localNewArrivalProducts(), safeOffset, safeLimit);
      return { products, hasMore, error: null };
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NEW_ARRIVALS_MAX_AGE_DAYS);

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit);

    if (error) return { products: [], hasMore: false, error };

    const rows = data || [];
    const hasMore = rows.length > safeLimit;
    return { products: rows.slice(0, safeLimit), hasMore, error: null };
  }

  if (kind === 'featured') {
    if (isDemoMode()) {
      const { products, hasMore } = paginateLocal(localFeaturedProductsAll(), safeOffset, safeLimit);
      return { products, hasMore, error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit);

    if (error) return { products: [], hasMore: false, error };

    const rows = data || [];
    const hasMore = rows.length > safeLimit;
    return { products: rows.slice(0, safeLimit), hasMore, error: null };
  }

  return { products: [], hasMore: false, error: { message: 'Invalid collection kind' } };
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

export async function fetchProductsBySubId(subId) {
  if (isDemoMode()) return ok(localProducts({ subId }));

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('sub_category_id', subId)
    .order('is_featured', { ascending: false })
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

async function fetchConnectionsByTypes(types, { activeOnly = true } = {}) {
  if (isDemoMode()) {
    return ok(localConnections({ activeOnly, types }));
  }

  let query = supabase.from('connections').select('*').in('type', types);
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query.order('created_at', { ascending: true });
  return { data: data || [], error };
}

export async function fetchContactConnections() {
  return fetchConnectionsByTypes(CONTACT_CONNECTION_TYPES, { activeOnly: true });
}

/** Active social channels for following new listings (Social Channel). */
export async function fetchSocialConnections() {
  return fetchConnectionsByTypes(SOCIAL_CONNECTION_TYPES, { activeOnly: true });
}

/** @deprecated Prefer fetchContactConnections / fetchSocialConnections. */
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
