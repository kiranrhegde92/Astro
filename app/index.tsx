import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../src/constants/theme';
import { useUserStore } from '../src/store/userStore';
import { GlowText } from '../src/components/ui/GlowText';

export default function SplashScreen() {
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
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <LinearGradient colors={COLORS.gradientPrimary as unknown as [string, string, ...string[]]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>&#x2728;</Text>
        <GlowText size="hero" align="center" color={COLORS.starGold}>
          CosmicSelf
        </GlowText>
        <Text style={styles.tagline}>Discover Your Cosmic DNA</Text>
        <ActivityIndicator
          size="small"
          color={COLORS.violet}
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
});
