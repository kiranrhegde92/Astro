export type PremiumFeatureKey =
  | 'extra_compatibility_check'
  | 'compatibility_deep_dive'
  | 'full_blended_reading'
  | 'period_forecast'
  | 'premium_share_card';

export interface AdUnlockToken {
  id: string;
  feature: PremiumFeatureKey;
  grantedAt: string;
  consumedAt?: string;
}

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeatureKey, string> = {
  extra_compatibility_check: 'extra compatibility check',
  compatibility_deep_dive: 'compatibility deep dive',
  full_blended_reading: 'full blended reading',
  period_forecast: 'weekly/monthly forecast',
  premium_share_card: 'premium share card',
};
