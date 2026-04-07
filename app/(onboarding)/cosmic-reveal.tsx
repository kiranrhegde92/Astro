import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { calculateUserChart } from '../../src/services/functionsService';
import type { ChineseProfile, DashaPeriod, KPProfile, PlanetPosition, WesternProfile } from '../../src/types/astrology';

type Status = 'calculating' | 'done' | 'error';

const STEPS = [
  'Geocoding birth location…',
  'Computing planetary positions…',
  'Casting Western chart…',
  'Applying Lahiri ayanamsa for Vedic…',
  'Deriving Four Pillars…',
  'Calculating KP sub-lords…',
  'Weaving your cosmic profile…',
];

const PLANET_NAME_MAP: Record<string, PlanetPosition['planet']> = {
  SUN: 'Sun',
  MOON: 'Moon',
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn',
  URANUS: 'Uranus',
  NEPTUNE: 'Neptune',
  PLUTO: 'Pluto',
  NORTHNODE: 'NorthNode',
  SOUTHNODE: 'SouthNode',
};

function toDate(value?: string) {
  return value ? new Date(value) : new Date();
}

export default function CosmicRevealScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setWesternProfile = useUserStore((s) => s.setWesternProfile);
  const setVedicProfile = useUserStore((s) => s.setVedicProfile);
  const setChineseProfile = useUserStore((s) => s.setChineseProfile);
  const setKPProfile = useUserStore((s) => s.setKPProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const addCosmicPoints = useUserStore((s) => s.addCosmicPoints);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [status, setStatus] = useState<Status>('calculating');
  const [stepIndex, setStepIndex] = useState(0);
  const [chart, setChart] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user?.birthDetails) return;

    // Cycle through progress steps visually
    const stepTimer = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    }, 900);

    const bd = user.birthDetails as any;
    const birthDateStr: string = bd.birthDateStr
      ?? user.birthDetails.date.toISOString().split('T')[0];
    const birthTimeStr: string = bd.birthTimeStr ?? '12:00';
    const birthPlace: string = bd.birthPlace ?? user.birthDetails.place?.name ?? 'London, UK';

    calculateUserChart({ birthDate: birthDateStr, birthTime: birthTimeStr, birthPlace })
      .then((result) => {
        clearInterval(stepTimer);
        const c = result.chart;

        // Push real data into userStore
        if (c.western) {
          const planets: PlanetPosition[] = Object.entries(c.western.planets ?? {})
            .map(([planet, value]: [string, any]) => {
              const mapped = PLANET_NAME_MAP[planet];
              if (!mapped) return null;
              return {
                planet: mapped,
                sign: value.sign,
                degree: value.degree,
                house: value.house,
                retrograde: value.retrograde,
              };
            })
            .filter(Boolean) as PlanetPosition[];

          const westernProfile: WesternProfile = {
            sun: c.western.sun,
            moon: c.western.moon,
            rising: c.western.rising,
            element: c.western.dominantElement,
            modality: c.western.dominantModality,
            planets,
            houses: c.western.houses,
          };

          setWesternProfile(westernProfile);
        }
        if (c.vedic) {
          const currentDasha: DashaPeriod = {
            planet: c.vedic.currentDasha?.planet,
            startDate: toDate(c.vedic.currentDasha?.startDate),
            endDate: toDate(c.vedic.currentDasha?.endDate),
          };

          setVedicProfile({
            rashi: c.vedic.rashi,
            nakshatra: c.vedic.nakshatra,
            nakshatraPada: c.vedic.nakshatraPada,
            moonSign: c.vedic.rashi,
            dashas: [currentDasha],
            currentDasha,
            remedies: [],
          });
        }
        if (c.chinese) {
          const chineseProfile: ChineseProfile = {
            animal: c.chinese.animal,
            element: c.chinese.element,
            yinYang: c.chinese.yinYang,
            pillars: c.chinese.yearPillar
              ? {
                  year: { stem: c.chinese.yearPillar.stem, branch: c.chinese.yearPillar.animal, element: c.chinese.yearPillar.element },
                  month: { stem: c.chinese.monthPillar.stem, branch: c.chinese.monthPillar.animal, element: c.chinese.monthPillar.element },
                  day: { stem: c.chinese.dayPillar.stem, branch: c.chinese.dayPillar.animal, element: c.chinese.dayPillar.element },
                  hour: { stem: c.chinese.hourPillar.stem, branch: c.chinese.hourPillar.animal, element: c.chinese.hourPillar.element },
                }
              : undefined,
            luckyNumbers: c.chinese.luckyNumbers ?? [],
            luckyColors: c.chinese.luckyColors,
            compatibleAnimals: [],
            incompatibleAnimals: [],
          };

          setChineseProfile(chineseProfile);
        }
        if (c.kp) {
          const kpProfile: KPProfile = {
            sublords: [],
            cusps: (c.kp.houseCusps ?? []).map((house: any) => ({
              house: house.house,
              degree: 0,
              sign: house.sign,
              starLord: house.nakshatraLord,
              subLord: house.subLord,
            })),
            significators: Object.entries(c.kp.significators ?? {}).map(([house, planets]: [string, any]) => ({
              planet: (Array.isArray(planets) && planets[0] ? planets[0] : 'Sun'),
              houses: [Number(house)],
              strength: 'moderate',
            })),
            predictions: [],
          };

          setKPProfile(kpProfile);
        }

        setChart(c);
        addCosmicPoints(100);
        setStatus('done');
      })
      .catch((err) => {
        clearInterval(stepTimer);
        console.warn('Chart calculation failed:', err);
        setErrorMsg('Could not connect to the calculation server. Your local profile has been saved — real chart data will sync when you are online.');
        setStatus('error');
      });

    return () => clearInterval(stepTimer);
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'calculating') {
    return (
      <StarField>
        <View style={styles.loadingWrap}>
          <CosmicOrb size={180} />
          <Text style={styles.loadingTitle}>Casting your constellation</Text>
          <Text style={styles.loadingStep}>{STEPS[stepIndex]}</Text>
          <View style={styles.stepDots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      </StarField>
    );
  }

  // ── Error (offline / Firebase not configured) ────────────────────────────────
  if (status === 'error') {
    return (
      <StarField>
        <View style={styles.loadingWrap}>
          <Ionicons name="cloud-offline-outline" size={52} color={COLORS.textMuted} />
          <Text style={styles.loadingTitle}>Calculation pending</Text>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
          <AnimatedPressable haptic onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/today');
          }}>
            <View style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>Continue Anyway</Text>
            </View>
          </AnimatedPressable>
        </View>
      </StarField>
    );
  }

  // ── Reveal ───────────────────────────────────────────────────────────────────
  const w = chart?.western;
  const v = chart?.vedic;
  const ch = chart?.chinese;
  const kp = chart?.kp;

  return (
    <StarField>
      <ScreenHeader title="Your reveal" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.headline}>This is the shape of your sky.</Text>

        {/* Hero orb + name */}
        <View style={styles.hero}>
          <CosmicOrb size={188} />
          <Text style={styles.name}>{user?.name}</Text>
        </View>

        {/* Western */}
        {w && (
          <GradientCard accentColor={COLORS.western}>
            <Text style={styles.sectionLabel}>WESTERN · TROPICAL</Text>
            <View style={styles.signRow}>
              <SignBadge label="SUN" value={w.sun} color={COLORS.vedic} />
              <SignBadge label="MOON" value={w.moon} color={COLORS.western} />
              <SignBadge label="RISING" value={w.rising} color={COLORS.kp} />
            </View>
            <Text style={styles.detail}>{w.dominantElement} element · {w.dominantModality} modality</Text>
          </GradientCard>
        )}

        {/* Vedic */}
        {v && (
          <GradientCard accentColor={COLORS.vedic}>
            <Text style={styles.sectionLabel}>VEDIC · SIDEREAL</Text>
            <View style={styles.signRow}>
              <SignBadge label="RASHI" value={v.rashi} color={COLORS.vedic} />
              <SignBadge label="LAGNA" value={v.lagna} color={COLORS.western} />
              <SignBadge label="NAKSHATRA" value={v.nakshatra} color={COLORS.kp} />
            </View>
            <Text style={styles.detail}>{v.currentDasha?.planet} Mahadasha · {v.subDasha?.planet} Antardasha</Text>
          </GradientCard>
        )}

        {/* Chinese */}
        {ch && (
          <GradientCard accentColor={COLORS.chinese}>
            <Text style={styles.sectionLabel}>CHINESE · FOUR PILLARS</Text>
            <View style={styles.signRow}>
              <SignBadge label="ANIMAL" value={ch.animal} color={COLORS.chinese} />
              <SignBadge label="ELEMENT" value={ch.element} color={COLORS.western} />
              <SignBadge label="POLARITY" value={ch.yinYang} color={COLORS.kp} />
            </View>
            <Text style={styles.detail}>Lucky: {ch.luckyDirections?.[0]} · {ch.luckyColors?.[0]}</Text>
          </GradientCard>
        )}

        {/* KP */}
        {kp && (
          <GradientCard accentColor={COLORS.kp}>
            <Text style={styles.sectionLabel}>KP · SUB-LORD SYSTEM</Text>
            <View style={styles.signRow}>
              <SignBadge label="LAGNA" value={kp.lagna} color={COLORS.kp} />
              <SignBadge label="SUB-LORD" value={kp.lagnaSubLord} color={COLORS.western} />
            </View>
          </GradientCard>
        )}

        {/* Reward */}
        <GradientCard>
          <View style={styles.rewardRow}>
            <Ionicons name="sparkles" size={20} color={COLORS.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reward}>100 Cosmic Points added</Text>
              <Text style={styles.rewardCopy}>Your chart is saved. Daily readings open tomorrow at midnight.</Text>
            </View>
          </View>
        </GradientCard>

        <CosmicButton
          title="Open today's reading"
          onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/today');
          }}
        />
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </StarField>
  );
}

function SignBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeLabel, { color: COLORS.textMuted }]}>{label}</Text>
      <Text style={[styles.badgeValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: SPACING.md, paddingHorizontal: SPACING.xl,
  },
  loadingTitle: {
    color: COLORS.textPrimary, fontSize: 26,
    fontFamily: FONTS.heading, textAlign: 'center',
  },
  loadingStep: {
    color: COLORS.textMuted, fontSize: 13,
    letterSpacing: 0.5, textAlign: 'center',
  },
  stepDots: { flexDirection: 'row', gap: 5, marginTop: SPACING.sm },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: { backgroundColor: COLORS.western },
  errorMsg: {
    color: COLORS.textSecondary, fontSize: 14, lineHeight: 22,
    textAlign: 'center', maxWidth: 300,
  },
  continueBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 14, paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    minHeight: 44,
  },
  continueBtnText: {
    color: COLORS.white, fontSize: 14,
    fontFamily: FONTS.heading, letterSpacing: 1,
  },
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.lg },
  step: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.2 },
  headline: {
    color: COLORS.textPrimary, fontSize: 36, lineHeight: 44,
    fontFamily: FONTS.display, letterSpacing: -0.5,
  },
  hero: { alignItems: 'center', gap: SPACING.sm },
  name: { color: COLORS.textPrimary, fontSize: 26, fontFamily: FONTS.heading },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11,
    fontFamily: FONTS.accent, letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  signRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.md, paddingVertical: 8, paddingHorizontal: 12,
    gap: 3, minWidth: 80,
  },
  badgeLabel: { fontSize: 10, fontFamily: FONTS.accent, letterSpacing: 1.2 },
  badgeValue: { fontSize: 14, fontFamily: FONTS.heading, fontWeight: '700' },
  detail: { color: COLORS.textMuted, fontSize: 12, marginTop: SPACING.xs, letterSpacing: 0.3 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  reward: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading },
  rewardCopy: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 2 },
});
