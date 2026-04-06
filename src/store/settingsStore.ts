import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestNotificationPermissions,
  scheduleDailyNotification,
  cancelAllNotifications,
} from '../utils/notifications';

interface SettingsState {
  language: string;
  notificationsEnabled: boolean;
  dailyNotificationTime: string; // HH:mm
  theme: 'dark'; // Only dark theme for cosmic vibe
  setLanguage: (lang: string) => void;
  setNotifications: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const STORAGE_KEY = '@cosmicself_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  notificationsEnabled: true,
  dailyNotificationTime: '08:00',
  theme: 'dark',

  setLanguage: (lang) => {
    set({ language: lang });
    get().saveSettings();
  },

  setNotifications: async (enabled) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyNotification(get().dailyNotificationTime);
        set({ notificationsEnabled: true });
      } else {
        set({ notificationsEnabled: false });
      }
    } else {
      await cancelAllNotifications();
      set({ notificationsEnabled: false });
    }
    get().saveSettings();
  },

  setNotificationTime: async (time) => {
    set({ dailyNotificationTime: time });
    if (get().notificationsEnabled) {
      await scheduleDailyNotification(time);
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
          scheduleDailyNotification(settings.dailyNotificationTime).catch(() => {});
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
}));
