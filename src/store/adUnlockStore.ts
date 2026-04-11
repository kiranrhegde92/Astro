import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AdUnlockToken, PremiumFeatureKey } from '../types/entitlements';

interface AdUnlockState {
  tokens: AdUnlockToken[];
  loadAdUnlocks: () => Promise<void>;
  grantUnlock: (feature: PremiumFeatureKey) => Promise<AdUnlockToken>;
  consumeUnlock: (feature: PremiumFeatureKey) => Promise<boolean>;
  hasUnlock: (feature: PremiumFeatureKey) => boolean;
  clearAdUnlocks: () => Promise<void>;
  saveAdUnlocks: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_ad_unlocks';

function isAvailable(token: AdUnlockToken, feature: PremiumFeatureKey) {
  return token.feature === feature && !token.consumedAt;
}

export const useAdUnlockStore = create<AdUnlockState>((set, get) => ({
  tokens: [],

  loadAdUnlocks: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;
      const parsed = JSON.parse(data) as AdUnlockToken[];
      set({ tokens: Array.isArray(parsed) ? parsed : [] });
    } catch {}
  },

  grantUnlock: async (feature) => {
    const token: AdUnlockToken = {
      id: `ad_unlock_${feature}_${Date.now()}`,
      feature,
      grantedAt: new Date().toISOString(),
    };
    set({ tokens: [token, ...get().tokens] });
    await get().saveAdUnlocks();
    return token;
  },

  consumeUnlock: async (feature) => {
    const token = get().tokens.find((item) => isAvailable(item, feature));
    if (!token) return false;
    const consumedAt = new Date().toISOString();
    set({
      tokens: get().tokens.map((item) =>
        item.id === token.id ? { ...item, consumedAt } : item
      ),
    });
    await get().saveAdUnlocks();
    return true;
  },

  hasUnlock: (feature) => get().tokens.some((token) => isAvailable(token, feature)),

  clearAdUnlocks: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ tokens: [] });
  },

  saveAdUnlocks: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().tokens));
  },
}));
