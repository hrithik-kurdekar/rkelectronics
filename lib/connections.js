/** Shared helpers for Platform Connections display (footer, product contact). */

import { Mail, Phone, MessageSquare, Globe, Share2 } from 'lucide-react';
import {
  CONTACT_CONNECTION_TYPES,
  SOCIAL_CONNECTION_TYPES,
  isContactConnection,
  isSocialConnection,
  filterContactConnections,
  filterSocialConnections,
  detectSocialPlatform,
  socialPlatformLabel,
} from '@/lib/connection-types';

export {
  CONTACT_CONNECTION_TYPES,
  SOCIAL_CONNECTION_TYPES,
  isContactConnection,
  isSocialConnection,
  filterContactConnections,
  filterSocialConnections,
  detectSocialPlatform,
  socialPlatformLabel,
};

export function iconForSocialConnection(connection) {
  switch (detectSocialPlatform(connection)) {
    case 'youtube':
    case 'instagram':
    case 'facebook':
    case 'whatsapp-channel':
    case 'telegram':
      return Share2;
    default:
      return Globe;
  }
}

export function iconForConnectionType(type) {
  switch (type) {
    case 'Email':
      return Mail;
    case 'Phone':
      return Phone;
    case 'Chat Link':
      return MessageSquare;
    default:
      return Globe;
  }
}

export function hrefForConnection(connection) {
  const value = connection.value?.trim();
  if (!value) return null;

  if (value.startsWith('http') || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }

  if (connection.type === 'Email') return `mailto:${value}`;
  if (connection.type === 'Phone') return `tel:${value}`;
  return value;
}

export function displayValueForConnection(connection) {
  const value = (connection.value || '').trim();
  if (!value) return '';

  if (value.startsWith('mailto:')) return value.replace(/^mailto:/, '');
  if (value.startsWith('tel:')) return value.replace(/^tel:/, '');
  if (value.startsWith('http')) {
    try {
      const url = new URL(value);
      if (url.hostname.includes('wa.me') || url.hostname.includes('whatsapp')) {
        const phone = url.pathname.replace(/\D/g, '');
        if (phone) return `+${phone}`;
      }
    } catch {
      // fall through
    }
  }

  return value;
}

export function actionLabelForConnection(connection) {
  const label = (connection.label || '').toLowerCase();
  const value = (connection.value || '').toLowerCase();

  if (connection.type === 'Email') return 'Send email';
  if (connection.type === 'Phone') return 'Call now';
  if (connection.type === 'Chat Link') {
    if (label.includes('whatsapp') || value.includes('wa.me') || value.includes('whatsapp')) {
      return 'Message on WhatsApp';
    }
    return 'Open chat';
  }
  if (connection.type === 'Social Channel') return actionLabelForSocialConnection(connection);
  return 'Get in touch';
}

export function actionLabelForSocialConnection(connection) {
  const platform = socialPlatformLabel(detectSocialPlatform(connection));
  return `Follow on ${platform}`;
}

export function hintForSocialConnection() {
  return 'Join to get notified when new products are posted.';
}

export function hintForConnection(connection) {
  switch (connection.type) {
    case 'Email':
      return 'Ask about availability, specs, or delivery.';
    case 'Phone':
      return 'Speak with us directly for quick answers.';
    case 'Chat Link':
      return 'Fastest way to inquire — share the product SKU.';
    default:
      return 'Reach out through this channel.';
  }
}

export function accentForConnection(connection) {
  const label = (connection.label || '').toLowerCase();
  const value = (connection.value || '').toLowerCase();

  if (
    connection.type === 'Chat Link' &&
    (label.includes('whatsapp') || value.includes('wa.me') || value.includes('whatsapp'))
  ) {
    return {
      iconBg: 'bg-emerald-500/15',
      iconText: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      cta: 'text-emerald-400 group-hover:text-emerald-300',
    };
  }

  if (connection.type === 'Phone') {
    return {
      iconBg: 'bg-blue-500/15',
      iconText: 'text-blue-400',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      cta: 'text-blue-400 group-hover:text-blue-300',
    };
  }

  if (connection.type === 'Email') {
    return {
      iconBg: 'bg-violet-500/15',
      iconText: 'text-violet-400',
      border: 'border-violet-500/20 hover:border-violet-500/40',
      cta: 'text-violet-400 group-hover:text-violet-300',
    };
  }

  return {
    iconBg: 'bg-zinc-500/15',
    iconText: 'text-zinc-400',
    border: 'border-zinc-700/80 hover:border-zinc-600',
    cta: 'text-blue-400 group-hover:text-blue-300',
  };
}

/** Prefill WhatsApp (and mailto subject/body) when inquiring about a product. */
export function hrefForProductInquiry(connection, product) {
  if (!isContactConnection(connection)) return hrefForConnection(connection);

  const href = hrefForConnection(connection);
  if (!href || !product) return href;

  const sku = product.sku_code || '';
  const title = product.title || '';
  const inquiryLine =
    sku && title
      ? `Hi, I'm interested in ${sku} — ${title}.`
      : sku
        ? `Hi, I'm interested in ${sku}.`
        : title
          ? `Hi, I'm interested in ${title}.`
          : `Hi, I'm interested in a product on your site.`;

  if (connection.type === 'Email') {
    const subject = encodeURIComponent(sku ? `Inquiry: ${sku}` : 'Product inquiry');
    const body = encodeURIComponent(`${inquiryLine}\n\n`);
    const base = href.startsWith('mailto:') ? href : `mailto:${href.replace(/^mailto:/, '')}`;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}subject=${subject}&body=${body}`;
  }

  if (connection.type === 'Chat Link') {
    const lower = href.toLowerCase();
    if (lower.includes('wa.me') || lower.includes('whatsapp') || lower.includes('api.whatsapp')) {
      const text = encodeURIComponent(inquiryLine);
      const sep = href.includes('?') ? '&' : '?';
      return `${href}${sep}text=${text}`;
    }
  }

  return href;
}
