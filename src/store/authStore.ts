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
  /** True while we are fetching the Firestore profile after sign-in. */
  profileLoading: boolean;
  initialize: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  authReady: false,
  profileLoading: false,

  initialize: () => {
    // Safety net: if Firebase auth never fires (offline / emulator network),
    // unblock the loading screen after 4 seconds so the app isn't stuck forever.
    const timeout = setTimeout(() => {
      set((s) => s.authReady ? s : { authReady: true, profileLoading: false });
    }, 4000);

    const unsubscribe = onAuthChange(async (user) => {
      clearTimeout(timeout);
      // Mark profileLoading=true BEFORE authReady so routing waits.
      set({ firebaseUser: user, authReady: true, profileLoading: !!user });

      if (user) {
        // Load Firestore profile
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            useUserStore.getState().setUser({ ...profile, id: user.uid });
          }
        } catch (e) {
          console.warn('Failed to load Firestore profile:', e);
        } finally {
          set({ profileLoading: false });
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
        set({ profileLoading: false });
        useUserStore.getState().clearUser();
      }
    });
    return () => { clearTimeout(timeout); unsubscribe(); };
  },

  logout: async () => {
    await signOut();
    set({ firebaseUser: null });
  },
}));
