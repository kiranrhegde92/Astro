import { Platform } from 'react-native';
import type { PremiumFeatureKey } from '../types/entitlements';
import { AdMobConfig } from '../config';

let initialized = false;

export async function showRewardedAd(_feature: PremiumFeatureKey): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const ads = await import('react-native-google-mobile-ads');
    const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = ads;
    const productionUnit =
      Platform.OS === 'ios' ? AdMobConfig.rewardedIosUnitId : AdMobConfig.rewardedAndroidUnitId;
    const adUnitId =
      AdMobConfig.useProductionAds && productionUnit ? productionUnit : TestIds.REWARDED;

    if (!initialized) {
      await ads.default().initialize();
      initialized = true;
    }

    return await new Promise<boolean>((resolve) => {
      let settled = false;
      let earned = false;
      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      const cleanups: Array<() => void> = [];

      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        cleanups.forEach((cleanup) => cleanup());
        resolve(value);
      };

      cleanups.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          rewarded.show().catch(() => finish(false));
        })
      );
      cleanups.push(
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        })
      );
      cleanups.push(
        rewarded.addAdEventListener(AdEventType.CLOSED, () => finish(earned))
      );
      cleanups.push(
        rewarded.addAdEventListener(AdEventType.ERROR, () => finish(false))
      );

      rewarded.load();
      setTimeout(() => finish(false), 30000);
    });
  } catch {
    return false;
  }
}
