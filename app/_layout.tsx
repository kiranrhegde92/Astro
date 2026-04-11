import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  Cinzel_400Regular,
  Cinzel_700Bold,
  Cinzel_900Black,
} from '@expo-google-fonts/cinzel';
import { COLORS } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { useConnectionsStore } from '../src/store/connectionsStore';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { parseDeepLink } from '../src/utils/qrCodeUtils';
import '../src/i18n';
import '../src/services/firebase';

function hasBirthDate(user: ReturnType<typeof useUserStore.getState>['user']) {
  const birthDate = user?.birthDetails?.date;
  return birthDate instanceof Date && !Number.isNaN(birthDate.getTime());
}

function isAllowedOnboardingScreen(
  user: ReturnType<typeof useUserStore.getState>['user'],
  screen?: string
) {
  if (!screen) return false;

  if (!hasBirthDate(user)) {
    return screen === 'welcome' || screen === 'birth-details';
  }

  if (!Array.isArray(user?.activeSystems) || user.activeSystems.length === 0) {
    return screen === 'system-picker';
  }

  return screen === 'cosmic-reveal';
}

function hasCompletedProfile(user: ReturnType<typeof useUserStore.getState>['user']) {
  if (!user) return false;
  if (user.onboardingComplete) return true;
  return Boolean(
    hasBirthDate(user) &&
    (user.western || user.vedic || user.chinese || user.kp)
  );
}

function getEntryRoute(user: ReturnType<typeof useUserStore.getState>['user']) {
  if (!user) return null;
  if (hasCompletedProfile(user)) return '/(tabs)/today';
  if (!hasBirthDate(user)) return '/(onboarding)/welcome';
  if (Array.isArray(user.activeSystems) && user.activeSystems.length > 0) {
    return '/(onboarding)/cosmic-reveal';
  }
  return '/(onboarding)/system-picker';
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const authReady = useAuthStore((s) => s.authReady);
  const profileLoading = useAuthStore((s) => s.profileLoading);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const loadUser = useUserStore((s) => s.loadUser);
  const user = useUserStore((s) => s.user);
  const syncSubscriptionStatus = useUserStore((s) => s.syncSubscriptionStatus);

  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadReadings = useReadingStore((s) => s.loadReadings);
  const loadConnections = useConnectionsStore((s) => s.loadConnections);
  const importSharedProfile = useConnectionsStore((s) => s.importSharedProfile);
  const loadJournal = useJournalStore((s) => s.loadJournal);

  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
  });
  const atRoot = !segments[0]; // root index.tsx
  const onWebLanding = Platform.OS === 'web' && atRoot;
  const fontReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    loadUser().catch(() => {});
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize, loadUser]);

  useEffect(() => {
    if (!authReady) return;
    syncSubscriptionStatus();
    Promise.all([loadSettings(), loadReadings(), loadConnections(), loadJournal()]).catch(() => {});
  }, [authReady, loadConnections, loadJournal, loadReadings, loadSettings, syncSubscriptionStatus]);

  useEffect(() => {
    if (!authReady || profileLoading || (!fontReady && !onWebLanding)) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const onboardingScreen = segments.slice(1)[0];
    const entryRoute = getEntryRoute(user);

    const inTabs = segments[0] === '(tabs)';

    if (onWebLanding) {
      return;
    }

    if (!firebaseUser) {
      if (!inAuth) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (entryRoute === '/(tabs)/today') {
      if (inAuth || inOnboarding || atRoot) router.replace(entryRoute);
      return;
    }

    if (entryRoute?.startsWith('/(onboarding)/')) {
      if (!inOnboarding || !isAllowedOnboardingScreen(user, onboardingScreen)) {
        router.replace(entryRoute);
      }
      return;
    }
  }, [authReady, firebaseUser, fontReady, onWebLanding, profileLoading, router, segments, user]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = parseDeepLink(event.url);
      if ((parsed.type === 'profile' || parsed.type === 'compat') && parsed.payload) {
        importSharedProfile(parsed.payload, 'qr')
          .then((savedProfile) => {
            router.push({
              pathname: '/(tabs)/compatibility',
              params: { profileId: savedProfile.id },
            });
          })
          .catch(() => {});
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [importSharedProfile, router]);


  if ((!authReady || !fontReady) && !onWebLanding) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.western} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bgDeep },
          animation: 'fade',
        }}
      />
    </>
  );
}
