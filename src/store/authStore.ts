import { create } from 'zustand';
import type { User } from 'firebase/auth';
import Constants from 'expo-constants';
import { onAuthChange, signOut } from '../services/authService';
import { deleteMyAccount } from '../services/functionsService';
import { useConnectionsStore } from './connectionsStore';
import { useJournalStore } from './journalStore';
import { useReadingStore } from './readingStore';
import { useSettingsStore } from './settingsStore';
import { getUserProfile } from '../services/firestoreService';
import { useUserStore } from './userStore';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

function buildPendingProfile(user: User) {
  const fallbackName =
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    'Cosmic User';

  return {
    id: user.uid,
    name: fallbackName,
    language: 'en',
    birthDetails: {} as any,
    activeSystems: [],
    subscription: { tier: 'free' as const, status: 'active' as const, purchasedItems: [] },
    cosmicPoints: 0,
    streak: 0,
    onboardingComplete: false,
    createdAt: new Date(),
  };
}

interface AuthState {
  firebaseUser: User | null;
  authReady: boolean;
  /** True while we are fetching the Firestore profile after sign-in. */
  profileLoading: boolean;
  initialize: () => () => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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
    }, 3000);

    const unsubscribe = onAuthChange(async (user) => {
      clearTimeout(timeout);
      // Mark profileLoading=true BEFORE authReady so routing waits.
      set({ firebaseUser: user, authReady: true, profileLoading: !!user });

      if (user) {
        const currentLocalUser = useUserStore.getState().user;
        const hasMatchingLocalUser = currentLocalUser?.id === user.uid;

        if (currentLocalUser?.id && currentLocalUser.id !== user.uid) {
          await useUserStore.getState().clearUser();
        }

        // Load Firestore profile
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            useUserStore.getState().setUser({ ...profile, id: user.uid });
          } else if (!hasMatchingLocalUser) {
            useUserStore.getState().setUser(buildPendingProfile(user) as any);
          }
        } catch (e) {
          console.warn('Failed to load Firestore profile:', e);
          if (!hasMatchingLocalUser) {
            useUserStore.getState().setUser(buildPendingProfile(user) as any);
          }
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

  deleteAccount: async () => {
    const clearLocalData = async () => {
      await Promise.all([
        useUserStore.getState().clearUser(),
        useReadingStore.getState().clearReadings(),
        useConnectionsStore.getState().clearConnections(),
        useJournalStore.getState().clearJournal(),
        useSettingsStore.getState().clearSettings(),
      ]);
    };

    if (useAuthStore.getState().firebaseUser) {
      await deleteMyAccount();
      await signOut().catch(() => {});
    }

    await clearLocalData();
    set({ firebaseUser: null, profileLoading: false, authReady: true });
  },
}));
