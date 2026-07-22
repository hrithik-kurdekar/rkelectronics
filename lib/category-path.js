import { categorySlugFromName } from '@/lib/category-slug';

export function categoryHref(root, sub = null, brand = null) {
  const parts = [categorySlugFromName(root.name)];
  if (sub) parts.push(categorySlugFromName(sub.name));
  if (brand) parts.push(categorySlugFromName(brand.name));
  return `/category/${parts.join('/')}`;
}

export function matchCategoryBySlug(categories, slug) {
  const normalized = decodeURIComponent(slug).toLowerCase();
  return (categories || []).find((c) => c.name.toLowerCase() === normalized) || null;
}
