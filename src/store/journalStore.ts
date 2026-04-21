import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry } from '../types/appData';

interface JournalState {
  entries: JournalEntry[];
  upsertEntry: (entry: JournalEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  getEntryForDate: (date: string) => JournalEntry | null;
  loadJournal: () => Promise<void>;
  clearJournal: () => Promise<void>;
  saveJournal: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_journal';

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],

  upsertEntry: async (entry) => {
    const existing = get().entries.find((item) => item.id === entry.id);
    const entries = existing
      ? get().entries.map((item) => (item.id === entry.id ? entry : item))
      : [entry, ...get().entries];
    set({
      entries: entries
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 90),
    });
    await get().saveJournal();
  },

  removeEntry: async (id) => {
    set({ entries: get().entries.filter((entry) => entry.id !== id) });
    await get().saveJournal();
  },

  getEntryForDate: (date) => {
    return get().entries.find((entry) => entry.date === date) ?? null;
  },

  loadJournal: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;
      set({ entries: JSON.parse(data) as JournalEntry[] });
    } catch {}
  },

  clearJournal: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ entries: [] });
  },

  saveJournal: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().entries));
  },
}));
