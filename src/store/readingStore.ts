import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyReading } from '../types/astrology';
import { getDateKey } from '../utils/dateUtils';

interface ReadingState {
  todayReading: DailyReading | null;
  cachedReadings: Record<string, DailyReading>; // key: date string
  setTodayReading: (reading: DailyReading) => void;
  getCachedReading: (date: string) => DailyReading | null;
  getRecentReadings: (limit?: number) => DailyReading[];
  clearReadings: () => Promise<void>;
  loadReadings: () => Promise<void>;
  saveReadings: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_readings';

export const useReadingStore = create<ReadingState>((set, get) => ({
  todayReading: null,
  cachedReadings: {},

  setTodayReading: (reading) => {
    const cached = { ...get().cachedReadings, [reading.date]: reading };
    set({ todayReading: reading, cachedReadings: cached });
    get().saveReadings();
  },

  getCachedReading: (date) => {
    return get().cachedReadings[date] ?? null;
  },

  getRecentReadings: (limit = 7) => {
    return Object.values(get().cachedReadings)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  },

  clearReadings: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ todayReading: null, cachedReadings: {} });
  },

  loadReadings: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const cached = JSON.parse(data) as Record<string, DailyReading>;
        const today = getDateKey(new Date());
        set({ cachedReadings: cached, todayReading: cached[today] ?? null });
      }
    } catch {}
  },

  saveReadings: async () => {
    const { cachedReadings } = get();
    // Only keep last 30 days
    const keys = Object.keys(cachedReadings).sort().slice(-30);
    const trimmed: Record<string, DailyReading> = {};
    for (const k of keys) trimmed[k] = cachedReadings[k];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  },
}));
