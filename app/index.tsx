import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants/theme';

// _layout.tsx handles all auth/onboarding/tabs routing.
// This screen is just a blank loading state shown for a split second.
export default function LaunchScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={COLORS.western} />
    </View>
  );
}
