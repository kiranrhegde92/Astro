import { create } from 'zustand';
import type { Subscription } from '../types/user';

interface SubscriptionState {
  subscription: Subscription;
  isPremium: () => boolean;
  canCheckCompatibility: (checksToday: number) => boolean;
  startTrial: () => void;
  upgradeTo: (billingPeriod?: Subscription['billingPeriod']) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: {
    tier: 'free',
    status: 'active',
  },

  isPremium: () => {
    const { subscription } = get();
    return (
      subscription.tier === 'premium' &&
      (subscription.status === 'active' || subscription.status === 'trial')
    );
  },

  canCheckCompatibility: (checksToday: number) => {
    const { subscription } = get();
    if (subscription.tier === 'premium' && (subscription.status === 'active' || subscription.status === 'trial')) return true;
    return checksToday < 1; // Free tier: 1 check per day
  },

  startTrial: () => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    set({
      subscription: {
        tier: 'premium',
        status: 'trial',
        trialEndsAt: trialEnd,
        expiresAt: trialEnd,
        billingPeriod: 'yearly',
        productId: 'cosmicself_premium_yearly',
      },
    });
  },

  upgradeTo: (billingPeriod = 'monthly') => {
    const expiresAt = new Date();
    if (billingPeriod === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    set({
      subscription: {
        tier: 'premium',
        status: 'active',
        billingPeriod,
        productId: billingPeriod === 'yearly' ? 'cosmicself_premium_yearly' : 'cosmicself_premium_monthly',
        expiresAt,
      },
    });
  },
}));
