/** Server-side chat inquiry redirect helpers (no UI imports). */

export function buildInquiryLine({ sku, title } = {}) {
  if (sku && title) return `Hi, I'm interested in ${sku} — ${title}.`;
  if (sku) return `Hi, I'm interested in ${sku}.`;
  if (title) return `Hi, I'm interested in ${title}.`;
  return `Hi, I'm interested in a product on your site.`;
}

function appendQueryParam(url, key, value) {
  if (!value) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${key}=${encodeURIComponent(value)}`;
}

/** @returns {{ type: 'phone', phone: string } | { type: 'username', handle: string } | null} */
export function parseWhatsAppTarget(value) {
  const raw = (value || '').trim();
  if (!raw) return null;

  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();

    if (host === 'wa.me' || host.endsWith('.wa.me')) {
      const segment = decodeURIComponent(url.pathname.replace(/^\//, '').split('/')[0] || '');
      if (!segment) return null;

      const digits = segment.replace(/\D/g, '');
      if (digits.length >= 8 && /^\d+$/.test(digits)) {
        return { type: 'phone', phone: digits };
      }

      return { type: 'username', handle: segment.replace(/^@/, '') };
    }

    if (host.includes('whatsapp.com')) {
      const phoneParam = url.searchParams.get('phone')?.replace(/\D/g, '');
      if (phoneParam && phoneParam.length >= 8) {
        return { type: 'phone', phone: phoneParam };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isWhatsAppChatConnection(connection) {
  const haystack = `${connection?.label || ''} ${connection?.value || ''}`.toLowerCase();
  return (
    haystack.includes('wa.me') ||
    haystack.includes('api.whatsapp.com') ||
    haystack.includes('whatsapp.com/send')
  );
}

function whatsAppBaseUrl(value) {
  const target = parseWhatsAppTarget(value);
  if (!target) return null;

  if (target.type === 'phone') {
    return `https://wa.me/${target.phone}`;
  }

  return `https://wa.me/${target.handle}`;
}

/** Build the external chat URL for a connection (server-only; may contain sensitive targets). */
export function buildChatDestinationUrl(connection, { sku, title } = {}) {
  const value = (connection?.value || '').trim();
  if (!value) return null;

  const inquiryLine = sku || title ? buildInquiryLine({ sku, title }) : '';

  if (isWhatsAppChatConnection(connection)) {
    const base = whatsAppBaseUrl(value);
    if (!base) return null;
    return appendQueryParam(base, 'text', inquiryLine);
  }

  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return null;
  }

  return value;
}

/** Mask phone digits in admin UI — storefront never receives raw values. */
export function maskConnectionValueForAdmin(value) {
  const raw = (value || '').trim();
  if (!raw) return '';

  return raw
    .replace(/(wa\.me\/)\d+/gi, '$1***********')
    .replace(/([?&]phone=)\d+/gi, '$1***********');
}
