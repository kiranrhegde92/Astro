import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

// Lazy-load notifications to avoid crashing in Expo Go (push tokens removed in SDK 53+)
const getNotifications = () => import('../utils/notifications');

interface SettingsState {
  language: string;
  notificationsEnabled: boolean;
  dailyNotificationTime: string; // HH:mm
  theme: 'aurora';
  setLanguage: (lang: string) => void;
  setNotifications: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  clearSettings: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_settings';
const DEFAULT_SETTINGS = {
  language: 'en',
  notificationsEnabled: true,
  dailyNotificationTime: '08:00',
  theme: 'aurora' as const,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  setLanguage: (lang) => {
    set({ language: lang });
    get().saveSettings();
  },

  setNotifications: async (enabled) => {
    if (enabled) {
      try {
        const { requestNotificationPermissions, scheduleDailyNotification } = await getNotifications();
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleDailyNotification(get().dailyNotificationTime, useUserStore.getState().user);
          set({ notificationsEnabled: true });
        } else {
          set({ notificationsEnabled: false });
        }
      } catch {
        set({ notificationsEnabled: false });
      }
    } else {
      try {
        const { cancelAllNotifications } = await getNotifications();
        await cancelAllNotifications();
      } catch {}
      set({ notificationsEnabled: false });
    }
    get().saveSettings();
  },

  setNotificationTime: async (time) => {
    set({ dailyNotificationTime: time });
    if (get().notificationsEnabled) {
      try {
        const { scheduleDailyNotification } = await getNotifications();
        await scheduleDailyNotification(time, useUserStore.getState().user);
      } catch {}
    }
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const settings = JSON.parse(data);
        set(settings);
        // Re-schedule notification if enabled
        if (settings.notificationsEnabled) {
          getNotifications()
            .then(({ scheduleDailyNotification }) =>
              scheduleDailyNotification(settings.dailyNotificationTime, useUserStore.getState().user)
            )
            .catch(() => {});
        }
      }
    } catch {}
  },

  saveSettings: async () => {
    const { language, notificationsEnabled, dailyNotificationTime } = get();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, notificationsEnabled, dailyNotificationTime })
    );
  },

  clearSettings: async () => {
    try {
      const { cancelAllNotifications } = await getNotifications();
      await cancelAllNotifications();
    } catch {}
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ ...DEFAULT_SETTINGS });
  },
}));
