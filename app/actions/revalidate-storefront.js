'use server';

import { revalidatePath } from 'next/cache';

/**
 * Invalidate cached storefront pages after admin catalog changes.
 */
export async function revalidateStorefront({ sku, categorySlug } = {}) {
  revalidatePath('/');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[id]', 'page');

  if (sku) {
    revalidatePath(`/product/${String(sku).toLowerCase()}`);
  }
  if (categorySlug) {
    revalidatePath(`/category/${categorySlug}`);
  }
}
