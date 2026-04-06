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
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { parseDeepLink } from '../src/utils/qrCodeUtils';
import '../src/i18n';

export default function RootLayout() {
  const loadUser = useUserStore((s) => s.loadUser);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
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
    loadUser();
    loadSettings();
  }, []);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = parseDeepLink(event.url);
      if (parsed.type === 'profile' && parsed.userId) {
        Alert.alert('Cosmic Profile', `Opening profile: ${parsed.userId}`);
      } else if (parsed.type === 'compat' && parsed.userId) {
        router.push('/(tabs)/compatibility');
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.deepSpace, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.violet} />
      </View>
    );
  }

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
