import { create } from 'zustand';
import type { Subscription, SubscriptionTier } from '../types/user';

interface SubscriptionState {
  subscription: Subscription;
  isPremium: () => boolean;
  isFamily: () => boolean;
  canCheckCompatibility: (checksToday: number) => boolean;
  startTrial: () => void;
  upgradeTo: (tier: SubscriptionTier) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: {
    tier: 'free',
    status: 'active',
    purchasedItems: [],
  },

  isPremium: () => {
    const { subscription } = get();
    return (
      (subscription.tier === 'premium' || subscription.tier === 'family') &&
      subscription.status === 'active'
    );
  },

  isFamily: () => {
    const { subscription } = get();
    return subscription.tier === 'family' && subscription.status === 'active';
  },

  canCheckCompatibility: (checksToday: number) => {
    const { subscription } = get();
    if (subscription.tier !== 'free') return true;
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
        purchasedItems: [],
      },
    });
  },

  upgradeTo: (tier) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    set({
      subscription: {
        tier,
        status: 'active',
        expiresAt,
        purchasedItems: [],
      },
    });
  },
}));
