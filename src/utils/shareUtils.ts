import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

/**
 * Capture a ViewShot ref as a PNG and share it via the native share sheet.
 */
export async function captureAndShare(
  viewShotRef: React.RefObject<ViewShot | null>,
  message?: string,
): Promise<void> {
  if (!viewShotRef.current?.capture) return;

  const uri = await viewShotRef.current.capture();

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return;

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: message ?? 'Share your Cosmic DNA',
  });
}

/**
 * Generate a deep link URL for a user's cosmic profile.
 */
export function getProfileDeepLink(userId: string): string {
  return `https://cosmicself.app/profile/${userId}`;
}

/**
 * Generate share text for different card types.
 */
export function getShareText(
  type: 'cosmic-dna' | 'compatibility' | 'daily-vibe',
  data: Record<string, string>,
): string {
  switch (type) {
    case 'cosmic-dna':
      return `My Cosmic DNA: ${data.cosmicDNA} - Discover yours at CosmicSelf!`;
    case 'compatibility':
      return `${data.name1} + ${data.name2} = ${data.score}% cosmic match! Check your compatibility at CosmicSelf`;
    case 'daily-vibe':
      return `Today's cosmic vibe: ${data.vibe} - ${data.sign} | CosmicSelf`;
    default:
      return 'Discover your Cosmic DNA at CosmicSelf!';
  }
}
