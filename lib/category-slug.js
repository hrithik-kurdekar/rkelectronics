/** Matches home page links: /category/{name.toLowerCase()} */
export function categorySlugFromName(name) {
  return encodeURIComponent(name.toLowerCase());
}

export function categoryNameFromSlug(slug) {
  return decodeURIComponent(slug).toLowerCase();
}
