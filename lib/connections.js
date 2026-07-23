/** Shared helpers for Platform Connections display (footer, product contact). */

import { Mail, Phone, MessageSquare, Globe } from 'lucide-react';

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
