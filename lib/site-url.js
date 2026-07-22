/** Canonical site URL for metadata and absolute links. */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;

  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}
