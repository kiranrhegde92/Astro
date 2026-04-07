import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthChange, signOut } from '../services/authService';
import { getUserProfile } from '../services/firestoreService';
import { useUserStore } from './userStore';
import { requestNotificationPermissions } from '../utils/notifications';

interface AuthState {
  firebaseUser: User | null;
  authReady: boolean;
  initialize: () => () => void; // returns unsubscribe
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  authReady: false,

  initialize: () => {
    const unsubscribe = onAuthChange(async (user) => {
      set({ firebaseUser: user, authReady: true });

      if (user) {
        // Load user profile from Firestore into userStore
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            useUserStore.getState().setUser({ ...profile, id: user.uid });
          }
        } catch (e) {
          console.warn('Failed to load Firestore profile:', e);
        }
        // Request push permissions and register token (non-blocking)
        requestNotificationPermissions().catch(() => {});
      } else {
        // Signed out — clear local user
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
