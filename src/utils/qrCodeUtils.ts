/**
 * QR Code Utilities for CosmicSelf
 *
 * Handles deep link encoding, URL generation, and QR card customization.
 */

/**
 * Generate a CosmicSelf deep link for a user profile.
 * Non-app users are redirected to a web preview + download CTA.
 */
export function generateProfileLink(userId: string): string {
  return `https://cosmicself.app/profile/${userId}`;
}

/**
 * Generate a compatibility deep link.
 * When scanned, instantly calculates compatibility with the scanner's profile.
 */
export function generateCompatibilityLink(userId: string): string {
  return `https://cosmicself.app/compat/${userId}`;
}

/**
 * Parse a CosmicSelf deep link to extract the user ID and action.
 */
export function parseDeepLink(url: string): {
  type: 'profile' | 'compat' | 'unknown';
  userId?: string;
} {
  const profileMatch = url.match(/cosmicself\.app\/profile\/(.+)/);
  if (profileMatch) {
    return { type: 'profile', userId: profileMatch[1] };
  }

  const compatMatch = url.match(/cosmicself\.app\/compat\/(.+)/);
  if (compatMatch) {
    return { type: 'compat', userId: compatMatch[1] };
  }

  return { type: 'unknown' };
}

/**
 * Available QR card gradient themes.
 */
export const QR_THEMES = [
  { name: 'Cosmic Night', colors: ['#0a0a2e', '#2d1b69', '#4a00e0'] },
  { name: 'Aurora', colors: ['#00d2ff', '#7b2fbe', '#0a0a2e'] },
  { name: 'Golden Hour', colors: ['#f7971e', '#ffd200', '#ff6b35'] },
  { name: 'Rose Nebula', colors: ['#ee5a24', '#ff6b6b', '#c44569'] },
  { name: 'Ocean Deep', colors: ['#006266', '#009432', '#A3CB38'] },
  { name: 'Midnight', colors: ['#0a0a2e', '#0a0a2e', '#1a1a4e'] },
] as const;

export type QRThemeName = (typeof QR_THEMES)[number]['name'];

/**
 * Get gradient colors for a QR theme by name.
 */
export function getQRThemeColors(name: QRThemeName): string[] {
  const theme = QR_THEMES.find((t) => t.name === name);
  return theme ? [...theme.colors] : [...QR_THEMES[0].colors];
}
