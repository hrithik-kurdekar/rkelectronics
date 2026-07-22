/**
 * Fair-exposure product picking across category trees.
 * Prefer breadth (subs → brands) before depth (later products in one brand).
 */

export const STOREFRONT_SECTION_PRODUCT_LIMIT = 16; // covers 2 rows up to 8 cols
export const STOREFRONT_SECTION_BATCH = 4;

function sortProducts(a, b) {
  if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
  return new Date(b.created_at) - new Date(a.created_at);
}

/** Normalize brands → sorted product arrays. */
export function indexProductsByBrand(products = []) {
  const map = new Map();
  for (const product of products) {
    if (!product?.brand_id) continue;
    if (!map.has(product.brand_id)) map.set(product.brand_id, []);
    map.get(product.brand_id).push(product);
  }
  for (const list of map.values()) {
    list.sort(sortProducts);
  }
  return map;
}

/**
 * Home / root section: round-robin across subs → brands → product index.
 * for productIndex:
 *   for brandIndex:
 *     for each sub: emit brand[brandIndex].products[productIndex]
 */
export function pickFairProductsForRoot({
  subs = [],
  brandsBySubId = {},
  productsByBrandId,
  limit = STOREFRONT_SECTION_PRODUCT_LIMIT,
}) {
  const productMap =
    productsByBrandId instanceof Map
      ? productsByBrandId
      : indexProductsByBrand(Object.values(productsByBrandId || {}).flat());

  const used = new Set();
  const out = [];
  const maxBrands = Math.max(
    0,
    ...subs.map((sub) => (brandsBySubId[sub.id] || []).length)
  );

  if (maxBrands === 0 || subs.length === 0) return out;

  for (let productIndex = 0; out.length < limit; productIndex++) {
    let progress = false;
    for (let brandIndex = 0; brandIndex < maxBrands && out.length < limit; brandIndex++) {
      for (const sub of subs) {
        if (out.length >= limit) break;
        const brands = brandsBySubId[sub.id] || [];
        const brand = brands[brandIndex];
        if (!brand) continue;
        const list = productMap.get(brand.id) || [];
        const product = list[productIndex];
        if (!product || used.has(product.id)) continue;
        used.add(product.id);
        out.push(product);
        progress = true;
      }
    }
    if (!progress) break;
  }

  return out;
}

/**
 * Root page / sub section: round-robin across brands → product index.
 * for productIndex:
 *   for each brand: emit brand.products[productIndex]
 */
export function pickFairProductsForSub({
  brands = [],
  productsByBrandId,
  limit = STOREFRONT_SECTION_PRODUCT_LIMIT,
}) {
  const productMap =
    productsByBrandId instanceof Map
      ? productsByBrandId
      : indexProductsByBrand(
          Array.isArray(productsByBrandId)
            ? productsByBrandId
            : Object.values(productsByBrandId || {}).flat()
        );

  const used = new Set();
  const out = [];
  if (brands.length === 0) return out;

  for (let productIndex = 0; out.length < limit; productIndex++) {
    let progress = false;
    for (const brand of brands) {
      if (out.length >= limit) break;
      const list = productMap.get(brand.id) || [];
      const product = list[productIndex];
      if (!product || used.has(product.id)) continue;
      used.add(product.id);
      out.push(product);
      progress = true;
    }
    if (!progress) break;
  }

  return out;
}

/** Brand section / brand page preview: first N products in sort order. */
export function pickProductsForBrand(products = [], limit = STOREFRONT_SECTION_PRODUCT_LIMIT) {
  return [...products].sort(sortProducts).slice(0, limit);
}
