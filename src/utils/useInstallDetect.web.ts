import { useEffect, useState } from 'react';

export type DetectedPlatform = 'android' | 'ios' | 'other';

function detectPlatform(): DetectedPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'other';
}

export function useInstallDetect(): { platform: DetectedPlatform; isInstalled: boolean } {
  const [state, setState] = useState({ platform: 'other' as DetectedPlatform, isInstalled: false });
  useEffect(() => {
    const installed =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true);
    setState({ platform: detectPlatform(), isInstalled: !!installed });
  }, []);
  return state;
}
