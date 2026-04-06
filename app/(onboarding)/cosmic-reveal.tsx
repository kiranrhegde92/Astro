import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';

const { width } = Dimensions.get('window');

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
  const [profileData, setProfileData] = useState<{ western: string; vedic: string; chinese: string; kp: string } | null>(null);

  // Loading anims
  const loadPulse = useRef(new Animated.Value(0.4)).current;
  // Reveal anims
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(loadPulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!user?.birthDetails) return;
    const timer = setTimeout(() => {
      const profile = calculateCosmicProfile(user.birthDetails.date, user.birthDetails.time, user.birthDetails.place?.lat, user.birthDetails.place?.lng);
      setWesternProfile(profile.western);
      setVedicProfile(profile.vedic);
      setChineseProfile(profile.chinese);
      if (profile.kp) setKPProfile(profile.kp);
      setCosmicDNA(getCosmicDNASummary(profile));
      setProfileData({
        western: `${profile.western.sun} Sun${profile.western.rising ? ` / ${profile.western.rising} Rising` : ''} / ${profile.western.moon} Moon`,
        vedic: `${profile.vedic.rashi} Rashi / ${profile.vedic.nakshatra} Nakshatra (Pada ${profile.vedic.nakshatraPada})`,
        chinese: `${profile.chinese.element} ${profile.chinese.animal} (${profile.chinese.yinYang})`,
        kp: profile.kp ? `${profile.kp.cusps.length} cusps / ${profile.kp.predictions.length} insights` : 'Enable for precise timing',
      });
      addCosmicPoints(100);
      setIsCalculating(false);

      // Reveal entrance
      Animated.parallel([
        Animated.timing(revealOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(revealScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 1500);
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
          <CosmicOrb size={200} />
          <Animated.View style={{ opacity: loadPulse }}>
            <Text style={styles.loadingTitle}>Consulting the stars...</Text>
          </Animated.View>
          <Text style={styles.loadingSubtext}>Analyzing 4 ancient traditions for your cosmic profile</Text>
        </View>
      </StarField>
    );
  }

  const SYSTEMS: Array<{ key: string; emoji: string; gradient: readonly string[]; detail: string }> = [
    user?.activeSystems.includes('western') && profileData ? { key: 'western', emoji: '♈', gradient: COLORS.gradientWestern, detail: profileData.western } : null,
    user?.activeSystems.includes('vedic') && profileData ? { key: 'vedic', emoji: '🕉️', gradient: COLORS.gradientVedic, detail: profileData.vedic } : null,
    user?.activeSystems.includes('chinese') && profileData ? { key: 'chinese', emoji: '🐉', gradient: COLORS.gradientChinese, detail: profileData.chinese } : null,
    user?.activeSystems.includes('kp') && profileData ? { key: 'kp', emoji: '🔭', gradient: COLORS.gradientKP, detail: profileData.kp } : null,
  ].filter(Boolean) as Array<{ key: string; emoji: string; gradient: readonly string[]; detail: string }>;

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.revealContent, { opacity: revealOpacity, transform: [{ scale: revealScale }] }]}>
          <CosmicOrb size={140} />

          <GlowText size="hero" align="center" color={COLORS.starGold}>
            {t('onboarding.reveal.title')}
          </GlowText>
          <Text style={styles.subtitle}>{t('onboarding.reveal.subtitle')}</Text>

          {/* Cosmic DNA */}
          <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
            <Text style={styles.dnaLabel}>MY COSMIC DNA</Text>
            <Text style={styles.dnaValue}>{cosmicDNA}</Text>
          </GradientCard>

          {/* System cards */}
          {SYSTEMS.map((sys) => (
            <View key={sys.key} style={styles.sysCardShadow}>
              <LinearGradient
                colors={sys.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sysCard}
              >
                <Text style={styles.sysEmoji}>{sys.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sysName}>{t(`onboarding.reveal.${sys.key}`)}</Text>
                  <Text style={styles.sysDetail}>{sys.detail}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}

          {/* Points badge */}
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>🌟 +100 Cosmic Points earned!</Text>
          </View>

          {/* CTA */}
          <AnimatedPressable onPress={handleContinue}>
            <LinearGradient colors={['#8b2fc9', '#00d2ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Text style={styles.ctaText}>{t('onboarding.reveal.continue')}  →</Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  loadingTitle: { color: COLORS.white, fontSize: 22, fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
  loadingSubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },

  container: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 58 },
  revealContent: { alignItems: 'center', gap: SPACING.lg },

  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },

  dnaLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  dnaValue: { color: COLORS.starGold, fontSize: 18, fontFamily: 'PlayfairDisplay_700Bold' },

  sysCardShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  sysCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  sysEmoji: { fontSize: 30 },
  sysName: { color: '#fff', fontSize: 15, fontFamily: 'PlayfairDisplay_700Bold' },
  sysDetail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },

  pointsBadge: {
    backgroundColor: 'rgba(245,200,66,0.12)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.3)',
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
  },
  pointsText: { color: COLORS.starGold, fontSize: 14, fontWeight: '700' },

  ctaBtn: {
    width: width - SPACING.lg * 2,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700', fontFamily: 'PlayfairDisplay_700Bold' },
});
