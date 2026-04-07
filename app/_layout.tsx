import React, { useEffect } from 'react';
import { Alert, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
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
import { useConnectionsStore } from '../src/store/connectionsStore';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { parseDeepLink } from '../src/utils/qrCodeUtils';
import '../src/i18n';

export default function RootLayout() {
  const loadUser = useUserStore((s) => s.loadUser);
  const syncSubscriptionStatus = useUserStore((s) => s.syncSubscriptionStatus);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadReadings = useReadingStore((s) => s.loadReadings);
  const loadConnections = useConnectionsStore((s) => s.loadConnections);
  const importSharedProfile = useConnectionsStore((s) => s.importSharedProfile);
  const loadJournal = useJournalStore((s) => s.loadJournal);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
  });

  useEffect(() => {
    const boot = async () => {
      await loadUser();
      syncSubscriptionStatus();
      await Promise.all([
        loadSettings(),
        loadReadings(),
        loadConnections(),
        loadJournal(),
      ]);
    };
    boot();
  }, [loadConnections, loadJournal, loadReadings, loadSettings, loadUser, syncSubscriptionStatus]);

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

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [importSharedProfile, router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.sunOrange} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
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
