import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, BirthDetails, AstrologySystem, Subscription } from '../types/user';
import type { WesternProfile, VedicProfile, ChineseProfile, KPProfile } from '../types/astrology';

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
  completeOnboarding: () => void;
  addCosmicPoints: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
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

  incrementStreak: () => {
    const { user } = get();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      set({ user: { ...user, streak: user.streak + 1, lastCheckIn: today } });
      get().saveUser();
    }
  },

  resetStreak: () => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, streak: 0 } });
      get().saveUser();
    }
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
        set({ user, isLoading: false });
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
