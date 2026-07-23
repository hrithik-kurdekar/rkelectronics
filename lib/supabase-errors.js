/** Shared Supabase error helpers (safe for server + client). */

export function isMissingRelation(error) {
  const code = error?.code;
  const message = error?.message || '';
  return code === '42P01' || /relation .* does not exist/i.test(message);
}

export function isPermissionDenied(error) {
  return error?.code === '42501' || /permission denied/i.test(error?.message || '');
}
