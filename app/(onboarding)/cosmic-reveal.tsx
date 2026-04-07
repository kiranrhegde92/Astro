import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';

export default function CosmicRevealScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setWesternProfile = useUserStore((state) => state.setWesternProfile);
  const setVedicProfile = useUserStore((state) => state.setVedicProfile);
  const setChineseProfile = useUserStore((state) => state.setChineseProfile);
  const setKPProfile = useUserStore((state) => state.setKPProfile);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const addCosmicPoints = useUserStore((state) => state.addCosmicPoints);

  const [isCalculating, setIsCalculating] = useState(true);
  const [cosmicDNA, setCosmicDNA] = useState('');

  useEffect(() => {
    if (!user?.birthDetails) return;
    const timer = setTimeout(() => {
      const profile = calculateCosmicProfile(
        user.birthDetails.date,
        user.birthDetails.time,
        user.birthDetails.place?.lat,
        user.birthDetails.place?.lng
      );

      setWesternProfile(profile.western);
      setVedicProfile(profile.vedic);
      setChineseProfile(profile.chinese);
      if (profile.kp) setKPProfile(profile.kp);
      setCosmicDNA(getCosmicDNASummary(profile));
      addCosmicPoints(100);
      setIsCalculating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [addCosmicPoints, setChineseProfile, setKPProfile, setVedicProfile, setWesternProfile, user?.birthDetails]);

  if (isCalculating) {
    return (
      <StarField>
        <View style={styles.loadingWrap}>
          <CosmicOrb size={190} />
          <ActivityIndicator color={COLORS.sunOrange} size="small" />
          <Text style={styles.loadingTitle}>Casting your first constellation</Text>
          <Text style={styles.loadingCopy}>We are layering four traditions into one personal almanac.</Text>
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Your reveal" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.headline}>This is the shape of your sky.</Text>

        <View style={styles.hero}>
          <CosmicOrb size={188} />
          <Text style={styles.name}>{user?.name}</Text>
        </View>

        <GradientCard accentColor={COLORS.gold}>
          <Text style={styles.sectionLabel}>Cosmic DNA</Text>
          <Text style={styles.dna}>{cosmicDNA}</Text>
        </GradientCard>

        <View style={styles.systemRow}>
          {(user?.activeSystems ?? []).map((system) => (
            <View key={system} style={styles.systemChip}>
              <Text style={styles.systemChipText}>{system}</Text>
            </View>
          ))}
        </View>

        <GradientCard style={styles.rewardCard}>
          <Text style={styles.reward}>100 points added to begin your streak.</Text>
          <Text style={styles.rewardCopy}>Tomorrow the reading opens faster because your profile is already in place.</Text>
        </GradientCard>

        <CosmicButton
          title="Open today's reading"
          onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/today');
          }}
        />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  loadingTitle: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontFamily: FONTS.heading,
    letterSpacing: -0.4,
  },
  loadingCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  step: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
  },
  hero: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: FONTS.heading,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  dna: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.heading,
    letterSpacing: -0.2,
  },
  systemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  systemChip: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  systemChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  rewardCard: {
    gap: SPACING.xs,
  },
  reward: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  rewardCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
