export type DetectedPlatform = 'android' | 'ios' | 'other';

export function useInstallDetect(): { platform: DetectedPlatform; isInstalled: boolean } {
  return { platform: 'other', isInstalled: true };
}
