import type { SharedProfilePayload } from '../types/appData';

/**
 * Generate a CosmicSelf deep link for a shared profile payload.
 * The payload is encoded directly into the URL so QR exchange works offline.
 */
export function generateProfileLink(payload: SharedProfilePayload): string {
  return `https://cosmicself.app/profile?data=${encodePayload(payload)}`;
}

/**
 * Generate a compatibility deep link.
 * Scanning opens the app with an already-shared profile ready to compare.
 */
export function generateCompatibilityLink(payload: SharedProfilePayload): string {
  return `https://cosmicself.app/compat?data=${encodePayload(payload)}`;
}

/**
 * Encode a payload to base64url.
 * Base64url is ~33% overhead vs the raw JSON, compared to ~200%+ for
 * encodeURIComponent which percent-encodes every { " , : } character.
 * Handles non-ASCII characters (names/places with accents) via UTF-8 encoding.
 */
function toBase64url(str: string): string {
  // Encode Unicode to safe bytes first, then base64
  const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return decodeURIComponent(
    binary.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
}

export function encodePayload(payload: SharedProfilePayload): string {
  return toBase64url(JSON.stringify(payload));
}

export function decodePayload(encoded: string): SharedProfilePayload | null {
  try {
    let json: string;
    // Try base64url first (new format), fall back to percent-encoded (legacy)
    try {
      json = fromBase64url(encoded);
    } catch {
      json = decodeURIComponent(encoded);
    }
    const parsed = JSON.parse(json) as SharedProfilePayload;
    if (parsed.version !== 1 || !parsed.id || !parsed.name || !parsed.profile) {
      return null;
    }
    return {
      ...parsed,
      birthDetails: {
        ...parsed.birthDetails,
        date: new Date(parsed.birthDetails.date),
      },
    };
  } catch {
    return null;
  }
}

/**
 * Parse a CosmicSelf deep link to extract the action and payload.
 */
export function parseDeepLink(url: string): {
  type: 'profile' | 'compat' | 'unknown';
  userId?: string;
  payload?: SharedProfilePayload;
} {
  try {
    const normalized = url.replace('cosmicself://', 'https://cosmicself.app/');
    const parsed = new URL(normalized);
    const data = parsed.searchParams.get('data');
    const payload = data ? decodePayload(data) : null;

    if (parsed.pathname.includes('/profile')) {
      return { type: 'profile', userId: payload?.id, payload: payload ?? undefined };
    }

    if (parsed.pathname.includes('/compat')) {
      return { type: 'compat', userId: payload?.id, payload: payload ?? undefined };
    }
  } catch {}

  return { type: 'unknown' };
}

/**
 * Available QR card gradient themes.
 */
export const QR_THEMES = [
  { name: 'Cosmic Night', colors: ['#17182d', '#24284a', '#46306b'] },
  { name: 'Aurora Bloom', colors: ['#12c8b2', '#7367ff', '#17182d'] },
  { name: 'Solar Pulse', colors: ['#ffe0a4', '#ff8a5b', '#ff5e7e'] },
  { name: 'Velvet Orchid', colors: ['#ffd5c6', '#b04ec7', '#24284a'] },
  { name: 'Mint Halo', colors: ['#d6fff8', '#12c8b2', '#3c366d'] },
  { name: 'Porcelain Glow', colors: ['#fff8f2', '#f4ebf8', '#ddd5ff'] },
] as const;

export type QRThemeName = (typeof QR_THEMES)[number]['name'];

export function getQRThemeColors(name: QRThemeName): string[] {
  const theme = QR_THEMES.find((t) => t.name === name);
  return theme ? [...theme.colors] : [...QR_THEMES[0].colors];
}
