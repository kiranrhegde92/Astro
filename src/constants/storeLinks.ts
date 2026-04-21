export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.cosmicself';
export const APP_STORE_URL = 'https://apps.apple.com/app/cosmicself/id0000000000';
export const WEB_URL = 'https://cosmicself.app';

export function pickStoreUrl(platform: 'android' | 'ios' | 'other'): string {
  if (platform === 'android') return PLAY_STORE_URL;
  if (platform === 'ios') return APP_STORE_URL;
  return WEB_URL;
}
