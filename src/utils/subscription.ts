import type { Subscription, SubscriptionPlanPeriod } from '../types/user';

export const PREMIUM_MONTHLY_PRICE = '$5';
export const PREMIUM_YEARLY_PRICE = '$50';
export const PREMIUM_MONTHLY_PRODUCT_ID = 'cosmicself_premium_monthly';
export const PREMIUM_YEARLY_PRODUCT_ID = 'cosmicself_premium_yearly';

export function hasPremiumEntitlement(subscription?: Subscription | null): boolean {
  return subscription?.tier === 'premium' && (subscription.status === 'active' || subscription.status === 'trial');
}

export function getPremiumProductId(period: SubscriptionPlanPeriod): string {
  return period === 'yearly' ? PREMIUM_YEARLY_PRODUCT_ID : PREMIUM_MONTHLY_PRODUCT_ID;
}

export function getSubscriptionPlanLabel(subscription?: Subscription | null): string {
  if (!subscription || subscription.tier === 'free') return 'free';
  if (subscription.status === 'trial') return 'premium trial';
  return subscription.billingPeriod === 'yearly' ? 'premium yearly' : 'premium monthly';
}
