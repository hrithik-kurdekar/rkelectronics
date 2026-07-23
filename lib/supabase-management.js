import 'server-only';

const API_BASE = 'https://api.supabase.com';

/** Minimum length for a Supabase personal access token (sbp_…). */
const MIN_PAT_LENGTH = 50;

export function normalizeAccessToken(raw) {
  if (!raw) return null;
  let token = raw.trim();
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }
  return token || null;
}

export function getAccessToken() {
  return normalizeAccessToken(process.env.SUPABASE_ACCESS_TOKEN);
}

/**
 * Validates SUPABASE_ACCESS_TOKEN before calling the Management API.
 * Returns { ok: true, token } or { ok: false, message }.
 */
export function validateAccessToken() {
  const raw = process.env.SUPABASE_ACCESS_TOKEN;
  if (!raw?.trim()) {
    return {
      ok: false,
      message:
        'Set SUPABASE_ACCESS_TOKEN in .env.local — create one at supabase.com/dashboard/account/tokens',
    };
  }

  const token = getAccessToken();

  if (token.startsWith('eyJ')) {
    return {
      ok: false,
      message:
        'SUPABASE_ACCESS_TOKEN looks like a project API key (anon/service role). Use a Personal Access Token (sbp_…) from Account → Access Tokens.',
    };
  }

  if (!token.startsWith('sbp_')) {
    return {
      ok: false,
      message:
        'SUPABASE_ACCESS_TOKEN must be a Personal Access Token starting with sbp_ (Account → Access Tokens, not project API keys).',
    };
  }

  if (token.length < MIN_PAT_LENGTH) {
    return {
      ok: false,
      message: `SUPABASE_ACCESS_TOKEN looks truncated (${token.length} chars). Copy the full token from Supabase — it is shown only once when created.`,
    };
  }

  return { ok: true, token };
}

export function getProjectRef() {
  const explicit = process.env.SUPABASE_PROJECT_REF?.trim();
  if (explicit) return explicit;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || null;
}

function friendlyApiError(status, body) {
  if (status === 401) {
    let detail = '';
    try {
      const parsed = JSON.parse(body);
      detail = parsed.message || '';
    } catch {
      detail = body;
    }

    if (/jwt could not be decoded/i.test(detail)) {
      return (
        'Invalid SUPABASE_ACCESS_TOKEN — use a Personal Access Token (sbp_…) from ' +
        'supabase.com/dashboard/account/tokens. Project anon/service keys will not work.'
      );
    }

    return `Supabase Management API unauthorized (401)${detail ? `: ${detail}` : ''}. Regenerate your access token.`;
  }

  if (status === 403) {
    return 'Access denied (403) — this token cannot read usage for this organization. Use a token from an account with org access.';
  }

  return `Supabase API ${status}${body ? `: ${body}` : ''}`;
}

async function managementFetch(path) {
  const validation = validateAccessToken();
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${validation.token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(friendlyApiError(res.status, body));
  }

  return res.json();
}

export async function getProjectMeta(ref) {
  return managementFetch(`/v1/projects/${ref}`);
}

export async function getOrgUsage(orgSlug, projectRef) {
  const params = new URLSearchParams({ project_ref: projectRef });
  return managementFetch(`/platform/organizations/${orgSlug}/usage?${params}`);
}
