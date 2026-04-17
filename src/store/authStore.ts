import { create } from 'zustand';
import type { User } from 'firebase/auth';
import Constants from 'expo-constants';
import {
  isUserEmailVerified,
  onAuthChange,
  reloadCurrentUser,
  signOut,
} from '../services/authService';
import { deleteMyAccount } from '../services/functionsService';
import { useConnectionsStore } from './connectionsStore';
import { useJournalStore } from './journalStore';
import { useAdUnlockStore } from './adUnlockStore';
import { useManagedProfilesStore } from './managedProfilesStore';
import { useReadingStore } from './readingStore';
import { useSettingsStore } from './settingsStore';
import { getChart, getUserProfile } from '../services/firestoreService';
import { useUserStore } from './userStore';
import { buildProfilesFromServerChart } from '../utils/serverChartAdapter';

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
    subscription: { tier: 'free' as const, status: 'active' as const },
    cosmicPoints: 0,
    streak: 0,
    onboardingComplete: false,
    createdAt: new Date(),
    referralCode: '',
    referralCount: 0,
  };
}

async function resolveAdminClaim(user: User | null, forceRefresh = true) {
  if (!user) return false;

  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult.claims?.admin === true;
  } catch (error) {
    console.warn('Failed to refresh auth claims:', error);
    return false;
  }
}

interface AuthState {
  firebaseUser: User | null;
  authReady: boolean;
  /** True while we are fetching the Firestore profile after sign-in. */
  profileLoading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  /** True when a new Google user needs to supply a referral code before onboarding. */
  pendingReferral: boolean;
  setPendingReferral: (val: boolean) => void;
  /** Referral code received via deep link — pre-fills the referral-entry screen. */
  pendingReferralCode: string | null;
  setPendingReferralCode: (code: string | null) => void;
  initialize: () => () => void;
  refreshClaims: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

async function hydrateVerifiedUser(user: User, set: (state: Partial<AuthState>) => void) {
  const currentLocalUser = useUserStore.getState().user;
  const hasMatchingLocalUser = currentLocalUser?.id === user.uid;

  if (currentLocalUser?.id && currentLocalUser.id !== user.uid) {
    await Promise.all([
      useUserStore.getState().clearUser(),
      useAdUnlockStore.getState().clearAdUnlocks(),
      useManagedProfilesStore.getState().clearManagedProfiles(),
    ]);
  }

  const adminClaimPromise = resolveAdminClaim(user, true);

  try {
    const [profile, chart, isAdmin] = await Promise.all([
      getUserProfile(user.uid),
      getChart(user.uid).catch(() => null),
      adminClaimPromise,
    ]);

    if (profile) {
      useUserStore.getState().setUser({
        ...profile,
        ...buildProfilesFromServerChart(chart),
        id: user.uid,
      } as any);
    } else if (!hasMatchingLocalUser) {
      // New Google user with no Firestore profile → require referral before onboarding
      const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');
      if (isGoogleUser) {
        set({ pendingReferral: true });
      } else {
        useUserStore.getState().setUser(buildPendingProfile(user) as any);
      }
    }

    set({ isAdmin });
  } catch (e) {
    console.warn('Failed to load Firestore profile:', e);
    if (!hasMatchingLocalUser) {
      useUserStore.getState().setUser(buildPendingProfile(user) as any);
    }
    set({ isAdmin: await adminClaimPromise.catch(() => false) });
  } finally {
    set({ profileLoading: false });
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  authReady: false,
  profileLoading: false,
  isAdmin: false,
  isEmailVerified: false,
  pendingReferral: false,
  setPendingReferral: (val) => set({ pendingReferral: val }),
  pendingReferralCode: null,
  setPendingReferralCode: (code) => set({ pendingReferralCode: code }),

  initialize: () => {
    const timeout = setTimeout(() => {
      set((s) => (s.authReady ? s : {
        ...s,
        authReady: true,
        profileLoading: false,
        isAdmin: false,
        isEmailVerified: false,
      }));
    }, 3000);

    const unsubscribe = onAuthChange(async (user) => {
      clearTimeout(timeout);
      const emailVerified = isUserEmailVerified(user);
      set({
        firebaseUser: user,
        authReady: true,
        profileLoading: !!user && emailVerified,
        isAdmin: false,
        isEmailVerified: emailVerified,
      });

      if (user) {
        if (!emailVerified) {
          if (useUserStore.getState().user?.id !== user.uid) {
            await useUserStore.getState().clearUser();
          }
          await Promise.all([
            useAdUnlockStore.getState().clearAdUnlocks(),
            useManagedProfilesStore.getState().clearManagedProfiles(),
          ]);
          set({ profileLoading: false, isAdmin: false });
          return;
        }

        await hydrateVerifiedUser(user, set);
        if (!IS_EXPO_GO) {
          setTimeout(() => {
            import('../utils/notifications')
              .then((m) => m.requestNotificationPermissions())
              .catch(() => {});
          }, 3000);
        }
      } else {
        set({ profileLoading: false, isAdmin: false, isEmailVerified: false });
        useUserStore.getState().clearUser();
      }
    });
    return () => { clearTimeout(timeout); unsubscribe(); };
  },

  refreshClaims: async () => {
    const firebaseUser = useAuthStore.getState().firebaseUser;
    const isAdmin = await resolveAdminClaim(firebaseUser, true);
    set({ isAdmin });
  },

  refreshEmailVerification: async () => {
    const user = await reloadCurrentUser();
    const emailVerified = isUserEmailVerified(user);
    set({ firebaseUser: user, isEmailVerified: emailVerified, profileLoading: !!user && emailVerified });

    if (user && emailVerified) {
      await hydrateVerifiedUser(user, set);
    } else {
      set({ profileLoading: false });
    }

    return emailVerified;
  },

  logout: async () => {
    await signOut();
    set({ firebaseUser: null, isAdmin: false, isEmailVerified: false, pendingReferral: false });
  },

  deleteAccount: async () => {
    const clearLocalData = async () => {
      await Promise.all([
        useUserStore.getState().clearUser(),
        useReadingStore.getState().clearReadings(),
        useConnectionsStore.getState().clearConnections(),
        useJournalStore.getState().clearJournal(),
        useAdUnlockStore.getState().clearAdUnlocks(),
        useManagedProfilesStore.getState().clearManagedProfiles(),
        useSettingsStore.getState().clearSettings(),
      ]);
    };

    if (useAuthStore.getState().firebaseUser) {
      await deleteMyAccount();
      await signOut().catch(() => {});
    }

    await clearLocalData();
    set({ firebaseUser: null, profileLoading: false, authReady: true, isAdmin: false, isEmailVerified: false });
  },
}));
