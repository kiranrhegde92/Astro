import { create } from 'zustand';
import type { User } from 'firebase/auth';
import Constants from 'expo-constants';
import { onAuthChange, signOut } from '../services/authService';
import { getUserProfile } from '../services/firestoreService';
import { useUserStore } from './userStore';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

interface AuthState {
  firebaseUser: User | null;
  authReady: boolean;
  initialize: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  authReady: false,

  initialize: () => {
    const unsubscribe = onAuthChange(async (user) => {
      set({ firebaseUser: user, authReady: true });

      if (user) {
        // Load Firestore profile
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            useUserStore.getState().setUser({ ...profile, id: user.uid });
          }
        } catch (e) {
          console.warn('Failed to load Firestore profile:', e);
        }
        // Request push permissions — skip entirely in Expo Go (SDK 53+ removed push support)
        if (!IS_EXPO_GO) {
          setTimeout(() => {
            import('../utils/notifications')
              .then(m => m.requestNotificationPermissions())
              .catch(() => {});
          }, 3000);
        }
      } else {
        useUserStore.getState().clearUser();
      }
    });
    return unsubscribe;
  },

  logout: async () => {
    await signOut();
    set({ firebaseUser: null });
  },
}));
