/**
 * Free-tier media / text limits — override via NEXT_PUBLIC_* env vars.
 * Defaults tuned for Supabase free Storage (1 GB) + DB (500 MB).
 */

function parseNumber(value, fallback, { min, max } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  let result = n;
  if (min != null) result = Math.max(min, result);
  if (max != null) result = Math.min(max, result);
  return result;
}

export function getMediaLimits() {
  return {
    /** Max width/height (px) for square WebP crop */
    imageMaxEdge: parseNumber(process.env.NEXT_PUBLIC_IMAGE_MAX_EDGE, 600, {
      min: 200,
      max: 2000,
    }),
    /** WebP quality 0–1 */
    imageWebpQuality: parseNumber(process.env.NEXT_PUBLIC_IMAGE_WEBP_QUALITY, 0.65, {
      min: 0.3,
      max: 1,
    }),
    /** Max images per product */
    productMaxImages: parseNumber(process.env.NEXT_PUBLIC_PRODUCT_MAX_IMAGES, 2, {
      min: 1,
      max: 20,
    }),
    /** Max characters for product description */
    descriptionMaxLength: parseNumber(process.env.NEXT_PUBLIC_DESCRIPTION_MAX_LENGTH, 500, {
      min: 50,
      max: 5000,
    }),
    /** Max characters for defect notes */
    defectNotesMaxLength: parseNumber(process.env.NEXT_PUBLIC_DEFECT_NOTES_MAX_LENGTH, 300, {
      min: 50,
      max: 2000,
    }),
  };
}

/** Columns needed for product cards / lists (avoids pulling unused text). */
export const PRODUCT_LIST_SELECT =
  'id, title, sku_code, price, mrp, condition, is_featured, image_urls, root_category_id, created_at';

/**
 * Extract storage object path from a Supabase public URL for the given bucket.
 * Returns null if the URL is not from this bucket.
 */
export function storagePathFromPublicUrl(publicUrl, bucketName) {
  if (!publicUrl || !bucketName) return null;
  try {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0]);
  } catch {
    return null;
  }
}

export function truncateText(value, maxLength) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}
