import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ManagedProfile } from '../types/appData';

interface ManagedProfilesState {
  managedProfiles: ManagedProfile[];
  activeProfileId: string | null;
  loadManagedProfiles: () => Promise<void>;
  addManagedProfile: (profile: ManagedProfile) => Promise<void>;
  updateManagedProfile: (id: string, updates: Partial<ManagedProfile>) => Promise<void>;
  removeManagedProfile: (id: string) => Promise<void>;
  setActiveProfileId: (id: string | null) => Promise<void>;
  clearManagedProfiles: () => Promise<void>;
  saveManagedProfiles: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_managed_profiles';

export const MAX_EXTRA_MANAGED_PROFILES = 4;
export const MAX_TOTAL_MANAGED_PROFILES = 5;

function hydrateManagedProfile(profile: ManagedProfile): ManagedProfile {
  return {
    ...profile,
    birthDetails: {
      ...profile.birthDetails,
      date: new Date(profile.birthDetails.date),
    },
  };
}

export const useManagedProfilesStore = create<ManagedProfilesState>((set, get) => ({
  managedProfiles: [],
  activeProfileId: null,

  loadManagedProfiles: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;
      const parsed = JSON.parse(data) as {
        managedProfiles?: ManagedProfile[];
        activeProfileId?: string | null;
      };
      const managedProfiles = (parsed.managedProfiles ?? []).map(hydrateManagedProfile);
      const activeProfileId =
        parsed.activeProfileId && managedProfiles.some((profile) => profile.id === parsed.activeProfileId)
          ? parsed.activeProfileId
          : null;
      set({ managedProfiles, activeProfileId });
    } catch {}
  },

  addManagedProfile: async (profile) => {
    const current = get().managedProfiles;
    const existing = current.find((item) => item.id === profile.id);
    const managedProfiles = existing
      ? current.map((item) => (item.id === profile.id ? profile : item))
      : [profile, ...current].slice(0, MAX_EXTRA_MANAGED_PROFILES);
    set({ managedProfiles });
    await get().saveManagedProfiles();
  },

  updateManagedProfile: async (id, updates) => {
    set({
      managedProfiles: get().managedProfiles.map((profile) =>
        profile.id === id ? { ...profile, ...updates, updatedAt: new Date().toISOString() } : profile
      ),
    });
    await get().saveManagedProfiles();
  },

  removeManagedProfile: async (id) => {
    const activeProfileId = get().activeProfileId === id ? null : get().activeProfileId;
    set({
      managedProfiles: get().managedProfiles.filter((profile) => profile.id !== id),
      activeProfileId,
    });
    await get().saveManagedProfiles();
  },

  setActiveProfileId: async (id) => {
    const activeProfileId = id && get().managedProfiles.some((profile) => profile.id === id) ? id : null;
    set({ activeProfileId });
    await get().saveManagedProfiles();
  },

  clearManagedProfiles: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ managedProfiles: [], activeProfileId: null });
  },

  saveManagedProfiles: async () => {
    const { managedProfiles, activeProfileId } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ managedProfiles, activeProfileId }));
  },
}));
