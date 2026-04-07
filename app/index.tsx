import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../src/components/ui/StarField';
import { CosmicOrb } from '../src/components/ui/CosmicOrb';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { useUserStore } from '../src/store/userStore';

export default function LaunchScreen() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user?.onboardingComplete) {
        router.replace('/(tabs)/today');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [isLoading, router, user]);

  return (
    <StarField>
      <View style={styles.container}>
        <Text style={styles.brand}>COSMICSELF</Text>
        <CosmicOrb size={220} />
        <Text style={styles.headline}>Open your chart like a morning ritual.</Text>
        <Text style={styles.copy}>
          A calmer astrology app built around rhythm, reflection, and the feeling of beginning again.
        </Text>
        <Text style={styles.status}>{isLoading ? 'Preparing your almanac' : "Entering today's sky"}</Text>
      </View>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  brand: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 2.8,
    fontFamily: FONTS.accent,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 42,
    lineHeight: 48,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    maxWidth: 300,
    textAlign: 'center',
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 280,
    textAlign: 'center',
  },
  status: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
});
