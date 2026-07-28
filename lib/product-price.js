/** Shared INR price / MRP helpers for admin and storefront. */

export function parseProductAmount(value) {
  if (value == null || value === '') return null;
  const amount = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(amount) ? amount : null;
}

export function formatInr(amount, { minimumFractionDigits = 0, maximumFractionDigits = 2 } = {}) {
  const value = parseProductAmount(amount);
  if (value == null) return '';
  return value.toLocaleString('en-IN', { minimumFractionDigits, maximumFractionDigits });
}

export function productShowsMrp(product) {
  const price = parseProductAmount(product?.price);
  const mrp = parseProductAmount(product?.mrp);
  return mrp != null && price != null && mrp > price;
}

/** Whole-number discount vs list price, or null when not applicable. */
export function discountPercent(price, mrp) {
  const sale = parseProductAmount(price);
  const list = parseProductAmount(mrp);
  if (sale == null || list == null || list <= sale) return null;
  return Math.round(((list - sale) / list) * 100);
}
