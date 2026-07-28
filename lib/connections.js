/** Shared helpers for Platform Connections display (footer, product contact). */

import { MessageSquare, Globe, Share2 } from 'lucide-react';
import {
  CONTACT_CONNECTION_TYPES,
  SOCIAL_CONNECTION_TYPES,
  isContactConnection,
  isSocialConnection,
  filterContactConnections,
  filterSocialConnections,
  detectSocialPlatform,
  detectChatPlatform,
  chatPlatformLabel,
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
  detectChatPlatform,
  chatPlatformLabel,
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
    case 'Chat Link':
      return MessageSquare;
    default:
      return Globe;
  }
}

/** Storefront-safe inquiry href — never exposes raw chat URLs or phone numbers. */
export function hrefForInquiryConnection(connection, product = null) {
  if (!connection?.id || connection.type !== 'Chat Link') return null;

  const base = `/api/inquiry/chat/${connection.id}`;
  if (!product) return base;

  const params = new URLSearchParams();
  if (product.sku_code) params.set('sku', product.sku_code);
  if (product.title) params.set('title', product.title);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** @deprecated Use hrefForInquiryConnection for contact chat links. */
export function hrefForConnection(connection) {
  if (connection?.type === 'Chat Link') return hrefForInquiryConnection(connection);
  const value = connection?.value?.trim();
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return null;
}

/** Never expose raw URLs or phone numbers on the storefront. */
export function displayValueForConnection() {
  return '';
}

export function actionLabelForConnection(connection) {
  if (connection.type === 'Chat Link') {
    switch (detectChatPlatform(connection)) {
      case 'whatsapp':
        return 'Message on WhatsApp';
      case 'telegram':
        return 'Message on Telegram';
      case 'instagram':
        return 'Message on Instagram';
      case 'facebook':
        return 'Message on Messenger';
      default:
        return 'Open chat';
    }
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
  if (connection.type === 'Chat Link') {
    switch (detectChatPlatform(connection)) {
      case 'whatsapp':
        return 'Fastest way to inquire — we will share details in chat.';
      case 'telegram':
        return 'Send a direct message about this product.';
      case 'instagram':
        return 'DM us about availability and condition.';
      case 'facebook':
        return 'Message us on Messenger for a quick reply.';
      default:
        return 'Start a private conversation about this product.';
    }
  }
  return 'Reach out through this channel.';
}

export function accentForConnection(connection) {
  if (connection.type === 'Chat Link') {
    switch (detectChatPlatform(connection)) {
      case 'whatsapp':
        return {
          iconBg: 'bg-emerald-500/15',
          iconText: 'text-emerald-400',
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          cta: 'text-emerald-400 group-hover:text-emerald-300',
        };
      case 'telegram':
        return {
          iconBg: 'bg-zinc-500/15',
          iconText: 'text-zinc-400',
          border: 'border-zinc-600/30 hover:border-zinc-500/50',
          cta: 'text-zinc-400 group-hover:text-zinc-300',
        };
      case 'instagram':
        return {
          iconBg: 'bg-pink-500/15',
          iconText: 'text-pink-400',
          border: 'border-pink-500/20 hover:border-pink-500/40',
          cta: 'text-pink-400 group-hover:text-pink-300',
        };
      case 'facebook':
        return {
          iconBg: 'bg-blue-500/15',
          iconText: 'text-blue-400',
          border: 'border-blue-500/20 hover:border-blue-500/40',
          cta: 'text-blue-400 group-hover:text-blue-300',
        };
      default:
        break;
    }
  }

  return {
    iconBg: 'bg-zinc-500/15',
    iconText: 'text-zinc-400',
    border: 'border-zinc-700/80 hover:border-zinc-600',
    cta: 'text-blue-400 group-hover:text-blue-300',
  };
}

/** Prefill product context via the inquiry proxy (WhatsApp text is applied server-side). */
export function hrefForProductInquiry(connection, product) {
  if (!isContactConnection(connection)) return hrefForInquiryConnection(connection);
  return hrefForInquiryConnection(connection, product || null);
}
