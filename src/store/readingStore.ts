import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyReading } from '../types/astrology';
import { getDateKey } from '../utils/dateUtils';

interface ReadingState {
  activeUid: string | null;
  todayReading: DailyReading | null;
  cachedReadings: Record<string, DailyReading>; // key: `${uid}:${date}`
  setActiveUid: (uid: string | null) => void;
  setTodayReading: (reading: DailyReading) => void;
  getCachedReading: (date: string) => DailyReading | null;
  getRecentReadings: (limit?: number) => DailyReading[];
  clearReadings: () => Promise<void>;
  loadReadings: () => Promise<void>;
  saveReadings: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_readings';
const ANON = '__anon__';

function cacheKey(uid: string | null, date: string): string {
  return `${uid ?? ANON}:${date}`;
}

function readingsForUid(
  cached: Record<string, DailyReading>,
  uid: string | null,
): Record<string, DailyReading> {
  const prefix = `${uid ?? ANON}:`;
  const out: Record<string, DailyReading> = {};
  for (const [k, v] of Object.entries(cached)) {
    if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
  }
  return out;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  activeUid: null,
  todayReading: null,
  cachedReadings: {},

  setActiveUid: (uid) => {
    if (get().activeUid === uid) return;
    const todayKey = getDateKey(new Date());
    const entry = get().cachedReadings[cacheKey(uid, todayKey)] ?? null;
    set({ activeUid: uid, todayReading: entry });
  },

  setTodayReading: (reading) => {
    const { activeUid } = get();
    const cached = {
      ...get().cachedReadings,
      [cacheKey(activeUid, reading.date)]: reading,
    };
    set({ todayReading: reading, cachedReadings: cached });
    get().saveReadings();
  },

  getCachedReading: (date) => {
    return get().cachedReadings[cacheKey(get().activeUid, date)] ?? null;
  },

  getRecentReadings: (limit = 7) => {
    const mine = readingsForUid(get().cachedReadings, get().activeUid);
    return Object.values(mine)
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
      if (!data) return;
      const parsed = JSON.parse(data) as Record<string, DailyReading>;
      const migrated: Record<string, DailyReading> = {};
      for (const [k, v] of Object.entries(parsed)) {
        migrated[k.includes(':') ? k : cacheKey(null, k)] = v;
      }
      const todayKey = getDateKey(new Date());
      const today = migrated[cacheKey(get().activeUid, todayKey)] ?? null;
      set({ cachedReadings: migrated, todayReading: today });
    } catch {}
  },

  saveReadings: async () => {
    const { cachedReadings } = get();
    // Keep last 30 entries per-user bucket.
    const groups: Record<string, Array<[string, DailyReading]>> = {};
    for (const [k, v] of Object.entries(cachedReadings)) {
      const [uid = ANON] = k.split(':', 1);
      (groups[uid] ??= []).push([k, v]);
    }
    const trimmed: Record<string, DailyReading> = {};
    for (const entries of Object.values(groups)) {
      entries.sort(([a], [b]) => a.localeCompare(b));
      for (const [k, v] of entries.slice(-30)) trimmed[k] = v;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  },
}));
