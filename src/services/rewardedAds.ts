import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PremiumFeatureKey } from '../types/entitlements';

let initialized = false;

type AdMobExtra = {
  useProductionAds?: boolean;
  rewardedAndroidUnitId?: string;
  rewardedIosUnitId?: string;
};

function getAdMobExtra(): AdMobExtra {
  return ((Constants.expoConfig?.extra as { adMob?: AdMobExtra } | undefined)?.adMob) ?? {};
}

export async function showRewardedAd(_feature: PremiumFeatureKey): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const ads = await import('react-native-google-mobile-ads');
    const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = ads;
    const extra = getAdMobExtra();
    const productionUnit =
      Platform.OS === 'ios' ? extra.rewardedIosUnitId : extra.rewardedAndroidUnitId;
    const adUnitId =
      extra.useProductionAds && productionUnit ? productionUnit : TestIds.REWARDED;

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
