/** Connection purpose constants (no UI imports — safe for data layer). */

export const CONTACT_CONNECTION_TYPES = ['Phone', 'Email', 'Chat Link'];

export const SOCIAL_CONNECTION_TYPES = ['Social Channel'];

export function isContactConnection(connection) {
  return CONTACT_CONNECTION_TYPES.includes(connection?.type);
}

export function isSocialConnection(connection) {
  return SOCIAL_CONNECTION_TYPES.includes(connection?.type);
}

export function filterContactConnections(connections = []) {
  return connections.filter(isContactConnection);
}

export function filterSocialConnections(connections = []) {
  return connections.filter(isSocialConnection);
}

export function detectSocialPlatform(connection) {
  const haystack = `${connection?.label || ''} ${connection?.value || ''}`.toLowerCase();

  if (haystack.includes('instagram') || haystack.includes('instagr.am')) return 'instagram';
  if (haystack.includes('facebook') || haystack.includes('fb.com')) return 'facebook';
  if (haystack.includes('youtube') || haystack.includes('youtu.be')) return 'youtube';
  if (haystack.includes('whatsapp.com/channel') || haystack.includes('whatsapp channel')) {
    return 'whatsapp-channel';
  }
  if (haystack.includes('t.me') || haystack.includes('telegram')) return 'telegram';
  return 'other';
}

export function socialPlatformLabel(platform) {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'youtube':
      return 'YouTube';
    case 'whatsapp-channel':
      return 'WhatsApp Channel';
    case 'telegram':
      return 'Telegram';
    default:
      return 'Social';
  }
}
