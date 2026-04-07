import React, { useEffect } from 'react';
import { Alert, View, ActivityIndicator } from 'react-native';
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
import { useUserStore } from '../src/store/userStore';
import { useConnectionsStore } from '../src/store/connectionsStore';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { parseDeepLink } from '../src/utils/qrCodeUtils';
import '../src/i18n';
// Initialize Firebase
import '../src/services/firebase';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const authReady = useAuthStore((s) => s.authReady);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const user = useUserStore((s) => s.user);
  const syncSubscriptionStatus = useUserStore((s) => s.syncSubscriptionStatus);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadReadings = useReadingStore((s) => s.loadReadings);
  const loadConnections = useConnectionsStore((s) => s.loadConnections);
  const importSharedProfile = useConnectionsStore((s) => s.importSharedProfile);
  const loadJournal = useJournalStore((s) => s.loadJournal);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
  });

  // Boot Firebase auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  // Load local stores after auth ready
  useEffect(() => {
    if (!authReady) return;
    syncSubscriptionStatus();
    Promise.all([loadSettings(), loadReadings(), loadConnections(), loadJournal()]);
  }, [authReady]);

  // Auth-based routing
  useEffect(() => {
    if (!authReady || !fontsLoaded) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!firebaseUser) {
      // Not signed in → go to login
      if (!inAuth) router.replace('/(auth)/login');
    } else if (!user?.onboardingComplete) {
      // Signed in but no profile/onboarding → go to onboarding
      if (!inOnboarding) router.replace('/(onboarding)/welcome');
    } else {
      // Fully set up → main tabs
      if (inAuth || inOnboarding) router.replace('/(tabs)/today');
    }
  }, [authReady, fontsLoaded, firebaseUser, user?.onboardingComplete]);

  // Deep link handler
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
          .catch(() => {
            Alert.alert('Shared profile', 'Unable to open that shared chart.');
          });
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [importSharedProfile, router]);

  if (!fontsLoaded || !authReady) {
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
