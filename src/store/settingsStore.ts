import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  setNotifications: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveSettings();
  },

  setNotificationTime: (time) => {
    set({ dailyNotificationTime: time });
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const settings = JSON.parse(data);
        set(settings);
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
