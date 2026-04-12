import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, BirthDetails, AstrologySystem, Subscription } from '../types/user';
import type { WesternProfile, VedicProfile, ChineseProfile, KPProfile } from '../types/astrology';
import { getDateKey, getDayDifference } from '../utils/dateUtils';
import { normalizeUserProfile } from '../utils/normalizeUserProfile';
import { updateUserProfile } from '../services/firestoreService';
import { currentUser } from '../services/authService';
import {
  configure as configureRevenueCat,
  fetchSubscriptionStatus as fetchRevenueCatSubscriptionStatus,
  getSetupIssue as getRevenueCatSetupIssue,
  isConfigured as isRevenueCatConfigured,
} from '../services/revenueCat';
import { getPremiumProductId } from '../utils/subscription';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;

  // Actions
  setUser: (user: UserProfile) => void;
  updateBirthDetails: (details: BirthDetails) => void;
  setActiveSystems: (systems: AstrologySystem[]) => void;
  setWesternProfile: (profile: WesternProfile) => void;
  setVedicProfile: (profile: VedicProfile) => void;
  setChineseProfile: (profile: ChineseProfile) => void;
  setKPProfile: (profile: KPProfile) => void;
  setLanguage: (lang: string) => void;
  setSubscription: (subscription: Subscription) => void;
  completeOnboarding: () => void;
  addCosmicPoints: (points: number) => void;
  incrementStreak: () => Promise<boolean>;
  resetStreak: () => void;
  startTrial: () => void;
  upgradeSubscription: (billingPeriod?: Subscription['billingPeriod']) => void;
  syncSubscriptionStatus: () => Promise<void>;
  clearUser: () => Promise<void>;
  loadUser: () => Promise<void>;
  saveUser: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_user';

function getDateTime(value?: Date | string | number | null): number | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
}

function isSameSubscription(a: Subscription, b: Subscription): boolean {
  return (
    a.tier === b.tier &&
    a.status === b.status &&
    a.billingPeriod === b.billingPeriod &&
    a.productId === b.productId &&
    getDateTime(a.expiresAt) === getDateTime(b.expiresAt) &&
    getDateTime(a.trialEndsAt) === getDateTime(b.trialEndsAt)
  );
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => {
    set({ user: normalizeUserProfile(user) });
    get().saveUser();
    void get().syncSubscriptionStatus();
  },

  updateBirthDetails: (details) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, birthDetails: details } });
      get().saveUser();
    }
  },

  setActiveSystems: (systems) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, activeSystems: systems } });
      get().saveUser();
    }
  },

  setWesternProfile: (profile) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, western: profile } });
      get().saveUser();
    }
  },

  setVedicProfile: (profile) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, vedic: profile } });
      get().saveUser();
    }
  },

  setChineseProfile: (profile) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, chinese: profile } });
      get().saveUser();
    }
  },

  setKPProfile: (profile) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, kp: profile } });
      get().saveUser();
    }
  },

  setLanguage: (lang) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, language: lang } });
      get().saveUser();
    }
  },

  setSubscription: (subscription) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, subscription } });
      get().saveUser();
    }
  },

  completeOnboarding: () => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, onboardingComplete: true } });
      get().saveUser();
    }
  },

  addCosmicPoints: (points) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, cosmicPoints: user.cosmicPoints + points } });
      get().saveUser();
    }
  },

  incrementStreak: async () => {
    const { user } = get();
    if (!user) return false;

    const today = getDateKey(new Date());
    if (user.lastCheckIn === today) {
      return false;
    }

    const nextStreak =
      user.lastCheckIn && getDayDifference(user.lastCheckIn, today) === 1
        ? user.streak + 1
        : 1;

    set({
      user: {
        ...user,
        streak: nextStreak,
        lastCheckIn: today,
        cosmicPoints: user.cosmicPoints + 10,
      },
    });
    await get().saveUser();
    return true;
  },

  resetStreak: () => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, streak: 0 } });
      get().saveUser();
    }
  },

  startTrial: () => {
    const { user } = get();
    if (!user) return;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    set({
      user: {
        ...user,
        subscription: {
          tier: 'premium',
          status: 'trial',
          billingPeriod: 'yearly',
          productId: getPremiumProductId('yearly'),
          trialEndsAt: trialEnd,
          expiresAt: trialEnd,
        },
      },
    });
    get().saveUser();
  },

  upgradeSubscription: (billingPeriod = 'monthly') => {
    const { user } = get();
    if (!user) return;
    const expiresAt = new Date();
    if (billingPeriod === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    set({
      user: {
        ...user,
        subscription: {
          tier: 'premium',
          status: 'active',
          billingPeriod,
          productId: getPremiumProductId(billingPeriod),
          expiresAt,
        },
      },
    });
    get().saveUser();
  },

  syncSubscriptionStatus: async () => {
    const applySubscription = async (subscription: Subscription) => {
      const latestUser = get().user;
      if (!latestUser || isSameSubscription(latestUser.subscription, subscription)) return;
      set({ user: { ...latestUser, subscription } });
      await get().saveUser();
    };

    const { user } = get();
    if (!user) return;

    const fbUser = currentUser();
    if (fbUser?.uid && !getRevenueCatSetupIssue()) {
      try {
        await configureRevenueCat(fbUser.uid);
        if (isRevenueCatConfigured()) {
          await applySubscription(await fetchRevenueCatSubscriptionStatus());
          return;
        }
      } catch (e) {
        console.warn('[UserStore] RevenueCat subscription sync failed:', e);
      }
    }

    const latestUser = get().user;
    if (!latestUser) return;

    const expiresAt = getDateTime(latestUser.subscription.expiresAt);
    if (!expiresAt || expiresAt > Date.now()) return;

    await applySubscription({
      tier: 'free',
      status: 'expired',
    });
  },

  clearUser: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null, isLoading: false });
  },

  loadUser: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const user = normalizeUserProfile(JSON.parse(data) as UserProfile);
        set({ user, isLoading: false });
        void get().syncSubscriptionStatus();
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveUser: async () => {
    const { user } = get();
    if (!user) return;
    // Save locally
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Sync to Firestore if signed in
    const fbUser = currentUser();
    if (fbUser) {
      // Firestore rejects `undefined` values — strip them before writing
      const clean = JSON.parse(JSON.stringify(user));
      updateUserProfile(fbUser.uid, clean).catch((e) => {
        console.warn('[UserStore] Firestore sync failed:', e);
      });
    }
  },
}));
