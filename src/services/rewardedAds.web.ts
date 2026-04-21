import type { PremiumFeatureKey } from '../types/entitlements';

export async function showRewardedAd(_feature: PremiumFeatureKey): Promise<boolean> {
  return false;
}
