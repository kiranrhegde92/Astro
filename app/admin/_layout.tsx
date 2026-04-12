import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bgDeep },
        animation: 'fade',
      }}
    />
  );
}
