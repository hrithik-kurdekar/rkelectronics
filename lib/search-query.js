/** Strip PostgREST filter metacharacters from user search input. */
export function sanitizeSearchTerm(query) {
  if (!query || typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[%_,().\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

/** Build a safe ilike pattern for Supabase filters. */
export function searchIlikePattern(query) {
  const term = sanitizeSearchTerm(query);
  if (!term) return null;
  return `%${term}%`;
}
