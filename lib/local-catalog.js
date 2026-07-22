/**
 * Local demo catalog (bundled). Used when NEXT_PUBLIC_DEMO_MODE=true.
 * Same fixtures for storefront + admin reads — no Supabase Storage/DB usage.
 */
import demoCatalog from '@/fixtures/demo-catalog.json';

export function getLocalCatalog() {
  return demoCatalog;
}
