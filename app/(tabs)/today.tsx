import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { generateDailyReading } from '../../src/content/dailyTemplates';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.74;

const SYSTEM_META: Record<string, {
  icon: any; gradient: readonly string[]; color: string; route: string; accentBorder: string;
}> = {
  western: { icon: 'planet-outline',   gradient: COLORS.gradientWestern, color: COLORS.western, route: '/reading/western', accentBorder: 'rgba(124,109,255,0.5)' },
  vedic:   { icon: 'flame-outline',    gradient: COLORS.gradientVedic,   color: COLORS.vedic,   route: '/reading/vedic',   accentBorder: 'rgba(255,107,53,0.5)' },
  chinese: { icon: 'navigate-outline', gradient: COLORS.gradientChinese, color: COLORS.chinese, route: '/reading/chinese', accentBorder: 'rgba(255,58,92,0.5)' },
  kp:      { icon: 'telescope-outline',gradient: COLORS.gradientKP,      color: COLORS.kp,      route: '/reading/kp',      accentBorder: 'rgba(0,229,209,0.5)' },
};

function getCosmicEnergy(date: Date): number {
  const day = date.getFullYear() * 1000 + date.getMonth() * 32 + date.getDate();
  const x = Math.sin(day * 9973) * 10000;
  return 0.62 + (x - Math.floor(x)) * 0.33;
}

// ── Shimmer skeleton block ──────────────────────────────────────────────────
function SkeletonBlock({ width: w, height: h, style }: { width: number | string; height: number; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.18] });
  return (
    <Animated.View style={[{ width: w as any, height, borderRadius: 8, backgroundColor: '#ffffff', opacity }, style]} />
  );
}

function TodaySkeleton() {
  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
        {/* Hero */}
        <View style={[styles.hero, { gap: 12 }]}>
          <SkeletonBlock width={92} height={92} style={{ borderRadius: 46 }} />
          <SkeletonBlock width={140} height={13} />
          <SkeletonBlock width={220} height={22} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonBlock width={90} height={40} style={{ borderRadius: 20 }} />
            <SkeletonBlock width={90} height={40} style={{ borderRadius: 20 }} />
          </View>
        </View>
        {/* Energy card */}
        <SkeletonBlock width="100%" height={84} style={{ borderRadius: 16 }} />
        {/* Affirmation */}
        <View style={{ gap: 8 }}>
          <SkeletonBlock width="90%" height={17} />
          <SkeletonBlock width="70%" height={17} />
        </View>
        {/* System cards */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonBlock width={CARD_W} height={255} style={{ borderRadius: 16 }} />
          <SkeletonBlock width={40} height={255} style={{ borderRadius: 16 }} />
        </View>
      </ScrollView>
    </StarField>
  );
}

// ── Error state ─────────────────────────────────────────────────────────────
function TodayError({ onRetry }: { onRetry: () => void }) {
  return (
    <StarField>
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.35)" />
        <Text style={styles.errorTitle}>Reading Unavailable</Text>
        <Text style={styles.errorSub}>Your cosmic data couldn't be loaded right now.</Text>
        <TouchableOpacity onPress={onRetry} activeOpacity={0.75} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </StarField>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const today = new Date();
  const [retryKey, setRetryKey] = useState(0);

  const reading = useMemo(() => {
    if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) return null;
    try {
      return generateDailyReading(today, user.western.sun, user.vedic.rashi, user.chinese.animal);
    } catch {
      return 'error' as const;
    }
  }, [today.toDateString(), user?.western?.sun, retryKey]);

  const cosmicEnergy = useMemo(() => getCosmicEnergy(today), [today.toDateString()]);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(28)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const affirmOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroY, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]),
      Animated.timing(cardsOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(affirmOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const timeOfDay = (() => {
    const h = today.getHours();
    if (h < 12) return t('common.morning');
    if (h < 17) return t('common.afternoon');
    return t('common.evening');
  })();

  if (!user) return <TodaySkeleton />;
  if (reading === 'error') return <TodayError onRetry={() => setRetryKey(k => k + 1)} />;
  if (!reading) return <TodaySkeleton />;

  const systemReadings = [
    user.activeSystems.includes('western') && reading.western && {
      key: 'western',
      title: `Western · ${user.western?.sun}`,
      lines: [
        { label: 'OVERALL', text: reading.western.overall },
        { label: 'LOVE', text: reading.western.love },
        { label: 'CAREER', text: reading.western.career },
      ],
      extra: `Lucky #${reading.western.luckyNumber}`,
    },
    user.activeSystems.includes('vedic') && reading.vedic && {
      key: 'vedic',
      title: `Vedic · ${user.vedic?.rashi}`,
      lines: [
        { label: 'DASHA', text: reading.vedic.dasha },
        { label: 'NAKSHATRA', text: reading.vedic.nakshatra },
        { label: 'MANTRA', text: reading.vedic.mantra },
      ],
      extra: reading.vedic.remedy.source,
    },
    user.activeSystems.includes('chinese') && reading.chinese && {
      key: 'chinese',
      title: `Chinese · ${user.chinese?.element} ${user.chinese?.animal}`,
      lines: [
        { label: 'ANIMAL', text: reading.chinese.animal },
        { label: 'ELEMENT', text: reading.chinese.element },
      ],
      extra: `Lucky: ${reading.chinese.luckyDirection}`,
    },
    user.activeSystems.includes('kp') && reading.kp && {
      key: 'kp',
      title: 'KP Insight',
      lines: [
        { label: 'TIMING', text: reading.kp.eventTiming },
        { label: 'SIGNIFICATOR', text: reading.kp.significatorInsight },
      ],
      extra: reading.kp.sublordGuidance,
    },
  ].filter(Boolean) as Array<{
    key: string; title: string;
    lines: Array<{ label: string; text: string }>;
    extra: string;
  }>;

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroY }] }]}>
          <CosmicOrb size={92} />
          <Text style={styles.dateText}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.greeting}>
            {t('today.greeting', { timeOfDay, name: user.name })}
          </Text>

          {/* Stats */}
          <View style={styles.pillsRow}>
            {user.streak > 0 && (
              <View style={styles.statPill}>
                <Ionicons name="flame" size={14} color={COLORS.vedic} />
                <Text style={[styles.statVal, { color: COLORS.vedic }]}>{user.streak}</Text>
                <Text style={styles.statLabel}>streak</Text>
              </View>
            )}
            <View style={[styles.statPill, styles.statPillWhite]}>
              <Ionicons name="sparkles" size={13} color={COLORS.gold} />
              <Text style={[styles.statVal, { color: COLORS.gold }]}>{user.cosmicPoints}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Cosmic Energy ── */}
        <Animated.View style={{ opacity: cardsOpacity }}>
          <GradientCard accentColor={COLORS.gold}>
            <View style={styles.energyRow}>
              <ProgressRing
                progress={cosmicEnergy}
                size={74}
                strokeWidth={4}
                color={COLORS.gold}
                value={`${Math.round(cosmicEnergy * 100)}%`}
                label="ENERGY"
              />
              <View style={styles.energyText}>
                <Text style={styles.vibeLabel}>TODAY'S COSMIC VIBE</Text>
                <Text style={styles.vibeText}>{reading.unified.cosmicVibe}</Text>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* ── Affirmation ── */}
        <Animated.View style={[styles.affirmSection, { opacity: affirmOpacity }]}>
          <View style={styles.affirmBar} />
          <Text style={styles.affirmQuote}>"{reading.unified.affirmation}"</Text>
          <Text style={styles.affirmLabel}>Daily Affirmation</Text>
        </Animated.View>

        {/* ── Unified CTA ── */}
        {user.activeSystems.length >= 2 && (
          <AnimatedPressable onPress={() => router.push('/reading/unified')}>
            <View style={styles.unifiedShadow}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.unifiedCta}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
                  pointerEvents="none"
                />
                <Ionicons name="planet" size={32} color={COLORS.western} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.unifiedTitle}>Unified Cosmic Reading</Text>
                  <Text style={styles.unifiedSub}>All systems aligned into one insight</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.40)" />
              </LinearGradient>
            </View>
          </AnimatedPressable>
        )}

        {/* ── System Cards ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR SYSTEMS</Text>
          <Text style={styles.sectionHint}>swipe →</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
          decelerationRate="fast"
          snapToInterval={CARD_W + SPACING.md}
        >
          {systemReadings.map((sr) => {
            const meta = SYSTEM_META[sr.key];
            return (
              <AnimatedPressable
                key={sr.key}
                onPress={() => router.push(meta.route as any)}
                style={{ width: CARD_W }}
              >
                <View style={[styles.sysCardShadow, { shadowColor: meta.color }]}>
                  <LinearGradient
                    colors={meta.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sysCard}
                  >
                    {/* Glossy top highlight */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
                      pointerEvents="none"
                    />
                    <Ionicons name={meta.icon} size={28} color="rgba(255,255,255,0.90)" />
                    <Text style={styles.sysTitle}>{sr.title}</Text>
                    {sr.lines.map((l, i) => (
                      <View key={i} style={styles.sysLine}>
                        <Text style={styles.sysLineLabel}>{l.label}</Text>
                        <Text style={styles.sysLineText} numberOfLines={2}>{l.text}</Text>
                      </View>
                    ))}
                    <View style={styles.sysExtra}>
                      <Text style={styles.sysExtraText}>{sr.extra}</Text>
                    </View>
                    <View style={styles.sysReadMore}>
                      <Text style={styles.sysReadMoreText}>Read more</Text>
                      <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.6)" />
                    </View>
                  </LinearGradient>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {/* ── Pagination dots ── */}
        {systemReadings.length > 1 && (
          <View style={styles.paginationRow}>
            {systemReadings.map((_, i) => (
              <View key={i} style={styles.paginationDot} />
            ))}
          </View>
        )}

        {/* ── Share ── */}
        <AnimatedPressable onPress={() => router.push('/share/card')}>
          <View style={styles.shareShadow}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareBtn}
            >
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.85)" />
              <Text style={styles.shareBtnText}>Share Today's Vibe</Text>
            </LinearGradient>
          </View>
        </AnimatedPressable>

        {/* ── Sources ── */}
        <View style={styles.sources}>
          <Text style={styles.sourcesTitle}>SOURCES</Text>
          {reading.references.map((ref, i) => (
            <Text key={i} style={styles.sourceText}>
              {ref.tradition.charAt(0).toUpperCase() + ref.tradition.slice(1)}: {ref.source}
              {ref.chapter ? ` · ${ref.chapter}` : ''}
            </Text>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  errorSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    minHeight: 44,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },

  hero: { alignItems: 'center', gap: SPACING.sm },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  greeting: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.15)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
    letterSpacing: 0.5,
  },
  pillsRow: { flexDirection: 'row', gap: SPACING.sm },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 44,
  },
  statPillWhite: {
    borderColor: 'rgba(255,215,0,0.22)',
    backgroundColor: 'rgba(255,215,0,0.05)',
  },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },

  energyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  energyText: { flex: 1 },
  vibeLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2,
    marginBottom: 5,
  },
  vibeText: { color: COLORS.white, fontSize: 15, fontWeight: '600', lineHeight: 22 },

  affirmSection: { paddingLeft: SPACING.lg, gap: SPACING.xs },
  affirmBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5,
    borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  affirmQuote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 17,
    color: 'rgba(255,255,255,0.80)',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  affirmLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2,
  },

  unifiedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
    elevation: 16,
  },
  unifiedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  unifiedTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0.3,
  },
  unifiedSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: 'Cinzel_400Regular',
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2.5,
  },
  sectionHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  hScroll: { paddingRight: SPACING.lg, gap: SPACING.md },

  sysCardShadow: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.50,
    shadowRadius: 22,
    elevation: 16,
  },
  sysCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    minHeight: 255,
    justifyContent: 'flex-start',
    gap: 5,
    overflow: 'hidden',
  },
  sysTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sysLine: { marginBottom: 3 },
  sysLineLabel: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 1.5,
  },
  sysLineText: { color: '#fff', fontSize: 13, lineHeight: 18 },
  sysExtra: {
    marginTop: 'auto' as any,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  sysExtraText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  sysReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  sysReadMoreText: { color: 'rgba(255,255,255,0.50)', fontSize: 12, letterSpacing: 0.5 },

  shareShadow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  shareBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0.5,
  },

  sources: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sourcesTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: -SPACING.xs,
  },
  paginationDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sourceText: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17 },
});
