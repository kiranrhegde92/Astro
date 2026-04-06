import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { COLORS } from '../src/constants/theme';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { parseDeepLink } from '../src/utils/qrCodeUtils';
import '../src/i18n';

export default function RootLayout() {
  const loadUser = useUserStore((s) => s.loadUser);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const router = useRouter();

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = parseDeepLink(event.url);
      if (parsed.type === 'profile' && parsed.userId) {
        // In production, fetch the profile and show it
        Alert.alert('Cosmic Profile', `Opening profile: ${parsed.userId}`);
      } else if (parsed.type === 'compat' && parsed.userId) {
        // Navigate to compatibility with pre-filled data
        router.push('/(tabs)/compatibility');
      }
    };

    // Handle URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for URLs while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.deepSpace },
          animation: 'fade',
        }}
      />
    </>
  );
}
