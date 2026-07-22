/** Normalized product image URLs (non-empty strings only). */
export function getProductImages(product) {
  if (!product?.image_urls) return [];
  if (!Array.isArray(product.image_urls)) return [];
  return product.image_urls.filter((url) => typeof url === 'string' && url.length > 0);
}
