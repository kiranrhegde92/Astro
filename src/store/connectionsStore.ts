import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CompatibilityHistoryEntry,
  SavedProfile,
  SharedProfilePayload,
} from '../types/appData';

interface ConnectionsState {
  savedProfiles: SavedProfile[];
  compatibilityHistory: CompatibilityHistoryEntry[];
  addSavedProfile: (profile: SavedProfile) => Promise<void>;
  importSharedProfile: (payload: SharedProfilePayload, source?: SavedProfile['source']) => Promise<SavedProfile>;
  updateSavedProfile: (id: string, updates: Partial<SavedProfile>) => Promise<void>;
  removeSavedProfile: (id: string) => Promise<void>;
  addCompatibilityHistory: (entry: CompatibilityHistoryEntry) => Promise<void>;
  loadConnections: () => Promise<void>;
  clearConnections: () => Promise<void>;
  saveConnections: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_connections';

function hydrateSavedProfile(profile: SavedProfile): SavedProfile {
  return {
    ...profile,
    birthDetails: {
      ...profile.birthDetails,
      date: new Date(profile.birthDetails.date),
    },
  };
}

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  savedProfiles: [],
  compatibilityHistory: [],

  addSavedProfile: async (profile) => {
    const existing = get().savedProfiles.find((item) => item.id === profile.id);
    const savedProfiles = existing
      ? get().savedProfiles.map((item) => (item.id === profile.id ? profile : item))
      : [profile, ...get().savedProfiles];
    set({ savedProfiles });
    await get().saveConnections();
  },

  importSharedProfile: async (payload, source = 'qr') => {
    const savedProfile: SavedProfile = {
      id: payload.id,
      name: payload.name,
      relation: 'other',
      birthDetails: payload.birthDetails,
      activeSystems: payload.activeSystems,
      profile: payload.profile,
      source,
      cosmicDNA: payload.cosmicDNA,
      createdAt: new Date().toISOString(),
    };
    await get().addSavedProfile(savedProfile);
    return savedProfile;
  },

  updateSavedProfile: async (id, updates) => {
    set({
      savedProfiles: get().savedProfiles.map((profile) =>
        profile.id === id ? { ...profile, ...updates } : profile
      ),
    });
    await get().saveConnections();
  },

  removeSavedProfile: async (id) => {
    set({
      savedProfiles: get().savedProfiles.filter((profile) => profile.id !== id),
      compatibilityHistory: get().compatibilityHistory.filter((entry) => entry.partnerId !== id),
    });
    await get().saveConnections();
  },

  addCompatibilityHistory: async (entry) => {
    const history = [entry, ...get().compatibilityHistory].slice(0, 30);
    set({ compatibilityHistory: history });
    await get().saveConnections();
  },

  loadConnections: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;
      const parsed = JSON.parse(data) as {
        savedProfiles: SavedProfile[];
        compatibilityHistory: CompatibilityHistoryEntry[];
      };
      set({
        savedProfiles: (parsed.savedProfiles ?? []).map(hydrateSavedProfile),
        compatibilityHistory: parsed.compatibilityHistory ?? [],
      });
    } catch {}
  },

  clearConnections: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ savedProfiles: [], compatibilityHistory: [] });
  },

  saveConnections: async () => {
    const { savedProfiles, compatibilityHistory } = get();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedProfiles, compatibilityHistory })
    );
  },
}));
