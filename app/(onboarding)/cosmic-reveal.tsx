import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';

export default function CosmicRevealScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const setWesternProfile = useUserStore((s) => s.setWesternProfile);
  const setVedicProfile = useUserStore((s) => s.setVedicProfile);
  const setChineseProfile = useUserStore((s) => s.setChineseProfile);
  const setKPProfile = useUserStore((s) => s.setKPProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const addCosmicPoints = useUserStore((s) => s.addCosmicPoints);

  const [isCalculating, setIsCalculating] = useState(true);
  const [cosmicDNA, setCosmicDNA] = useState('');
  const [profileData, setProfileData] = useState<{
    western: string;
    vedic: string;
    chinese: string;
    kp: string;
  } | null>(null);

  useEffect(() => {
    if (!user?.birthDetails) return;

    // Small delay for dramatic effect
    const timer = setTimeout(() => {
      const profile = calculateCosmicProfile(
        user.birthDetails.date,
        user.birthDetails.time,
        user.birthDetails.place?.lat,
        user.birthDetails.place?.lng,
      );

      // Save profiles to store
      setWesternProfile(profile.western);
      setVedicProfile(profile.vedic);
      setChineseProfile(profile.chinese);
      if (profile.kp) setKPProfile(profile.kp);

      setCosmicDNA(getCosmicDNASummary(profile));
      setProfileData({
        western: `${profile.western.sun} Sun${profile.western.rising ? ` / ${profile.western.rising} Rising` : ''} / ${profile.western.moon} Moon`,
        vedic: `${profile.vedic.rashi} Rashi / ${profile.vedic.nakshatra} Nakshatra (Pada ${profile.vedic.nakshatraPada})`,
        chinese: `${profile.chinese.element} ${profile.chinese.animal} (${profile.chinese.yinYang})`,
        kp: profile.kp
          ? `${profile.kp.cusps.length} cusps analyzed / ${profile.kp.predictions.length} cosmic insights`
          : 'Enable for precise timing',
      });

      addCosmicPoints(100); // Welcome bonus!
      setIsCalculating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [user?.birthDetails]);

  const handleContinue = () => {
    completeOnboarding();
    router.replace('/(tabs)/today');
  };

  if (isCalculating) {
    return (
      <StarField>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>{'\u{1F30C}'}</Text>
          <GlowText size="lg" align="center">
            {t('common.loading')}
          </GlowText>
          <Text style={styles.loadingSubtext}>
            Consulting the stars across 4 ancient traditions...
          </Text>
          <ActivityIndicator size="large" color={COLORS.violet} style={styles.spinner} />
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.spacer} />

        <Text style={styles.emoji}>{'\u2728'}</Text>
        <GlowText size="xl" align="center" color={COLORS.starGold}>
          {t('onboarding.reveal.title')}
        </GlowText>
        <Text style={styles.subtitle}>
          {t('onboarding.reveal.subtitle')}
        </Text>

        {/* Cosmic DNA Summary */}
        <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
          <Text style={styles.dnaLabel}>My Cosmic DNA</Text>
          <Text style={styles.dnaValue}>{cosmicDNA}</Text>
        </GradientCard>

        {/* System Cards */}
        {user?.activeSystems.includes('western') && profileData && (
          <SystemRevealCard
            emoji={'\u2648'}
            system={t('onboarding.reveal.western')}
            detail={profileData.western}
            colors={COLORS.gradientWestern}
          />
        )}

        {user?.activeSystems.includes('vedic') && profileData && (
          <SystemRevealCard
            emoji={'\u{1F549}\uFE0F'}
            system={t('onboarding.reveal.vedic')}
            detail={profileData.vedic}
            colors={COLORS.gradientVedic}
          />
        )}

        {user?.activeSystems.includes('chinese') && profileData && (
          <SystemRevealCard
            emoji={'\u{1F409}'}
            system={t('onboarding.reveal.chinese')}
            detail={profileData.chinese}
            colors={COLORS.gradientChinese}
          />
        )}

        {user?.activeSystems.includes('kp') && profileData && (
          <SystemRevealCard
            emoji={'\u{1F52D}'}
            system={t('onboarding.reveal.kp')}
            detail={profileData.kp}
            colors={COLORS.gradientKP}
          />
        )}

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{'\u{1F31F}'} +100 Cosmic Points earned!</Text>
        </View>

        <View style={styles.buttons}>
          <CosmicButton
            title={t('onboarding.reveal.continue')}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </StarField>
  );
}

function SystemRevealCard({
  emoji,
  system,
  detail,
  colors,
}: {
  emoji: string;
  system: string;
  detail: string;
  colors: readonly string[];
}) {
  return (
    <GradientCard colors={colors} style={styles.systemCard}>
      <View style={styles.systemRow}>
        <Text style={styles.systemEmoji}>{emoji}</Text>
        <View style={styles.systemText}>
          <Text style={styles.systemName}>{system}</Text>
          <Text style={styles.systemDetail}>{detail}</Text>
        </View>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  spacer: { height: 50 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  loadingSubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  spinner: { marginTop: SPACING.xl },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  dnaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  dnaValue: {
    color: COLORS.starGold,
    fontSize: 18,
    fontWeight: '700',
  },
  systemCard: {
    marginTop: SPACING.xs,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  systemEmoji: { fontSize: 32 },
  systemText: { flex: 1 },
  systemName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  systemDetail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  pointsBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  pointsText: {
    color: COLORS.starGold,
    fontSize: 14,
    fontWeight: '600',
  },
  buttons: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
});
