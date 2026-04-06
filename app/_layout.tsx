import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/constants/theme';
import { useUserStore } from '../src/store/userStore';
import '../src/i18n';

export default function RootLayout() {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
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
