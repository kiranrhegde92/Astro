import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, BirthDetails, AstrologySystem, Subscription } from '../types/user';
import type { WesternProfile, VedicProfile, ChineseProfile, KPProfile } from '../types/astrology';
import { getDateKey, getDayDifference } from '../utils/dateUtils';

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
  upgradeSubscription: (tier: Subscription['tier']) => void;
  syncSubscriptionStatus: () => void;
  clearUser: () => Promise<void>;
  loadUser: () => Promise<void>;
  saveUser: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_user';

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => {
    set({ user });
    get().saveUser();
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
          purchasedItems: [],
          trialEndsAt: trialEnd,
          expiresAt: trialEnd,
        },
      },
    });
    get().saveUser();
  },

  upgradeSubscription: (tier) => {
    const { user } = get();
    if (!user) return;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    set({
      user: {
        ...user,
        subscription: {
          tier,
          status: 'active',
          expiresAt,
          purchasedItems: user.subscription.purchasedItems,
        },
      },
    });
    get().saveUser();
  },

  syncSubscriptionStatus: () => {
    const { user } = get();
    if (!user) return;

    const now = Date.now();
    const expiresAt = user.subscription.expiresAt?.getTime();
    if (!expiresAt || expiresAt > now) return;

    set({
      user: {
        ...user,
        subscription: {
          tier: 'free',
          status: 'expired',
          purchasedItems: [],
        },
      },
    });
    get().saveUser();
  },

  clearUser: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null, isLoading: false });
  },

  loadUser: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const user = JSON.parse(data) as UserProfile;
        user.birthDetails.date = new Date(user.birthDetails.date);
        user.createdAt = new Date(user.createdAt);
        if (user.subscription.expiresAt) {
          user.subscription.expiresAt = new Date(user.subscription.expiresAt);
        }
        if (user.subscription.trialEndsAt) {
          user.subscription.trialEndsAt = new Date(user.subscription.trialEndsAt);
        }
        set({ user, isLoading: false });
        get().syncSubscriptionStatus();
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveUser: async () => {
    const { user } = get();
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  },
}));
