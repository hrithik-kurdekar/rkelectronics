export const NEW_ARRIVALS_MAX_AGE_DAYS = 30;

export const PRODUCT_COLLECTION_KINDS = ['new-arrivals', 'featured'];

export const PRODUCT_COLLECTION_PAGE_SIZE = 24;

export function isValidProductCollectionKind(kind) {
  return PRODUCT_COLLECTION_KINDS.includes(kind);
}

export function productCollectionMeta(kind) {
  switch (kind) {
    case 'new-arrivals':
      return {
        title: 'New Arrivals',
        description: 'Fresh listings from the last 30 days.',
        browseDescription: 'All products added in the last 30 days.',
        homeExploreHref: '/browse/new-arrivals',
        exploreMessage: 'View all new arrivals from the last 30 days',
      };
    case 'featured':
      return {
        title: 'Featured',
        description: 'Hand-picked highlights from our catalog.',
        browseDescription: 'Every product marked as featured in inventory.',
        homeExploreHref: '/browse/featured',
        exploreMessage: 'View all featured products in the catalog',
      };
    default:
      return null;
  }
}

export function newArrivalsCutoffDate() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_ARRIVALS_MAX_AGE_DAYS);
  return cutoff;
}
