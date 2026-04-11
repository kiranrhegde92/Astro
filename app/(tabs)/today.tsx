import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { DailyReading } from '../../src/types/astrology';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { buildForecastProfile } from '../../src/content/predictionSignals';
import { fetchDailyReading } from '../../src/services/functionsService';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { getDateKey } from '../../src/utils/dateUtils';
import { normalizeUserProfile } from '../../src/utils/normalizeUserProfile';

const READING_VERSION = 4;

const TONE_GRADIENTS: Record<'Opening' | 'Mixed' | 'Pressurized', readonly [string, string, string]> = {
  Opening: ['#16223c', '#25496a', '#217063'],
  Mixed: ['#17182d', '#342a5b', '#7a3f60'],
  Pressurized: ['#23172d', '#5b2448', '#94494f'],
};

const TONE_ACCENTS: Record<'Opening' | 'Mixed' | 'Pressurized', string> = {
  Opening: COLORS.tide,
  Mixed: COLORS.gold,
  Pressurized: COLORS.coral,
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Conjunction',
  trine: 'Trine',
  sextile: 'Sextile',
  square: 'Square',
  opposition: 'Opposition',
};

const PLANET_LABELS: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  NorthNode: 'Rahu',
  SouthNode: 'Ketu',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto',
};

type SystemPreview = {
  key: string;
  label: string;
  route: string;
  text: string;
  accent: string;
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  secondary: string;
};

type TransitItem = NonNullable<DailyReading['activeTransits']>[number];
type TransitPosition = NonNullable<DailyReading['transitPositions']>[number];

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function compactText(text?: string, maxLength = 120) {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function titleCase(value?: string) {
  if (!value) return '';
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getToneFallback(supportCount: number, tensionCount: number): 'Opening' | 'Mixed' | 'Pressurized' {
  if (supportCount >= tensionCount + 2) return 'Opening';
  if (tensionCount > supportCount) return 'Pressurized';
  return 'Mixed';
}

function formatTransitTitle(transit: TransitItem) {
  const left = PLANET_LABELS[transit.transitPlanet] ?? transit.transitPlanet;
  const right = PLANET_LABELS[transit.natalPlanet] ?? transit.natalPlanet;
  const aspect = ASPECT_LABELS[transit.aspect] ?? titleCase(transit.aspect);
  return `${left} ${aspect} ${right}`;
}

function formatSkyChip(position: TransitPosition) {
  const planet = PLANET_LABELS[position.planet] ?? position.planet;
  const degree = Number.isFinite(position.degree) ? position.degree.toFixed(1) : '0.0';
  return `${planet} in ${position.sign} ${degree}${position.retrograde ? ' R' : ''}`;
}

function ProofRow({
  icon,
  label,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.proofRow}>
      <View style={[styles.proofIconWrap, { backgroundColor: `${color}1f` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.proofBody}>
        <Text style={styles.proofLabel}>{label}</Text>
        <Text style={styles.proofText}>{text}</Text>
      </View>
    </View>
  );
}

function SkyChip({ position }: { position: TransitPosition }) {
  return (
    <View style={styles.skyChip}>
      <Text style={styles.skyChipText}>{formatSkyChip(position)}</Text>
    </View>
  );
}

function SystemStrip({
  label,
  text,
  accent,
  icon,
  secondary,
  onPress,
}: {
  label: string;
  text: string;
  accent: string;
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  secondary: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress}>
      <LinearGradient colors={COLORS.gradientInkSoft} style={[styles.systemStrip, { borderColor: accent }]}>
        <View style={styles.systemTop}>
          <View style={styles.systemHeading}>
            <OrbIcon icon={icon} size={34} accentColor={accent} secondaryColor={secondary} />
            <Text style={styles.systemLabel}>{label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,250,241,0.54)" />
        </View>
        <Text style={styles.systemText} numberOfLines={3}>
          {text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const incrementStreak = useUserStore((state) => state.incrementStreak);
  const todayReading = useReadingStore((state) => state.todayReading);
  const getCachedReading = useReadingStore((state) => state.getCachedReading);
  const setTodayReading = useReadingStore((state) => state.setTodayReading);
  const [retryKey, setRetryKey] = useState(0);
  const [activeSection, setActiveSection] = useState('brief');
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);
  const safeUser = useMemo(() => (user ? normalizeUserProfile(user) : null), [user]);
  const forecastProfile = useMemo(() => (safeUser ? buildForecastProfile(safeUser) : null), [safeUser]);

  useEffect(() => {
    if (!forecastProfile?.western?.sun || !forecastProfile?.vedic?.rashi || !forecastProfile?.chinese?.animal) return;

    const cached = getCachedReading(todayKey);
    if (cached?.unified?.shareText && cached.references?.length && (cached.version ?? 0) >= READING_VERSION) {
      setTodayReading(cached);
      incrementStreak().catch(() => {});
      return;
    }

    fetchDailyReading()
      .then(({ reading }) => {
        if ((reading?.version ?? 0) < READING_VERSION) {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
          incrementStreak().catch(() => {});
          return;
        }

        const merged = {
          version: typeof reading.version === 'number' ? reading.version : READING_VERSION,
          date: todayKey,
          western: reading.western,
          vedic: reading.vedic,
          chinese: reading.chinese,
          kp: reading.kp,
          unified: {
            shareText: reading.unified?.shareText ?? reading.unified?.cosmicVibe ?? "Today's reading is ready.",
            ...reading.unified,
          },
          activeTransits: reading.activeTransits ?? [],
          transitPositions: reading.transitPositions ?? [],
          references: reading.references ?? [],
          positivityScore: reading.positivityScore ?? 0.78,
        };
        setTodayReading(merged as DailyReading);
        incrementStreak().catch(() => {});
      })
      .catch(() => {
        try {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
          incrementStreak().catch(() => {});
        } catch {
          setRetryKey((value) => value + 1);
        }
      });
  }, [
    forecastProfile,
    getCachedReading,
    incrementStreak,
    retryKey,
    setTodayReading,
    today,
    todayKey,
  ]);

  const reading = (() => {
    if (!forecastProfile?.western?.sun || !forecastProfile?.vedic?.rashi || !forecastProfile?.chinese?.animal) return null;
    if (todayReading?.date === todayKey && (todayReading.version ?? 0) >= READING_VERSION) return todayReading;
    return null;
  })();

  const greeting = useMemo(() => getGreeting(today), [today]);
  const firstName = safeUser?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'you';
  const transits = reading?.activeTransits ?? [];
  const positions = reading?.transitPositions ?? [];
  const supportCount = transits.filter((transit) => transit.nature === 'support').length;
  const tensionCount = transits.filter((transit) => transit.nature === 'tension').length;
  const tone = (reading?.unified?.tone ?? getToneFallback(supportCount, tensionCount)) as 'Opening' | 'Mixed' | 'Pressurized';
  const alignmentScore = Math.round((reading?.positivityScore ?? 0.78) * 100);
  const heroGradient = TONE_GRADIENTS[tone];
  const toneAccent = TONE_ACCENTS[tone];
  const topSupport = transits.find((transit) => transit.nature === 'support') ?? transits[0];
  const topTension = transits.find((transit) => transit.nature === 'tension');
  const profile = useMemo(() => {
    if (!forecastProfile?.western || !forecastProfile?.vedic || !forecastProfile?.chinese) return null;
    return {
      western: forecastProfile.western,
      vedic: forecastProfile.vedic,
      chinese: forecastProfile.chinese,
      kp: forecastProfile.kp,
    };
  }, [forecastProfile]);

  if (!user || !reading) {
    return (
      <StarField>
        <View style={styles.emptyWrap}>
          <CosmicOrb size={176} />
          <Text style={styles.emptyTitle}>Preparing your daily reading</Text>
          <Text style={styles.emptyCopy}>Calibrating today's transits against your saved chart.</Text>
        </View>
      </StarField>
    );
  }

  const headline = reading.unified.headline ?? 'Today wants a more deliberate pace than usual.';
  const heroBody = compactText(reading.unified.cosmicVibe, 210);
  const evidenceLine = compactText(reading.unified.evidenceLine ?? reading.western?.overall, 180);
  const bestUse = compactText(reading.unified.bestUse ?? reading.unified.focusAdvice ?? 'Back the clean, consequential move.', 116);
  const watchFor = compactText(reading.unified.watchFor ?? topTension?.brief ?? reading.western?.wellness, 124);
  const timingNote = compactText(reading.unified.timingNote ?? reading.kp?.eventTiming ?? reading.vedic?.dasha, 130);
  const remedyText = compactText(reading.vedic?.remedy?.description, 108);
  const focusArea = titleCase(reading.unified.focusArea ?? 'main focus');
  const skyPreview = positions
    .filter((position) => ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(position.planet))
    .slice(0, 6);

  const systems = [
    user.activeSystems.includes('western') && reading.western
      ? { key: 'western', label: 'Western', route: '/reading/western', text: reading.western.overall, accent: COLORS.western, icon: 'sunny', secondary: '#ece6ff' }
      : null,
    user.activeSystems.includes('vedic') && reading.vedic
      ? { key: 'vedic', label: 'Vedic', route: '/reading/vedic', text: reading.vedic.dasha, accent: COLORS.vedic, icon: 'moon', secondary: '#ffe6d8' }
      : null,
    user.activeSystems.includes('chinese') && reading.chinese
      ? { key: 'chinese', label: 'Chinese', route: '/reading/chinese', text: reading.chinese.element, accent: COLORS.chinese, icon: 'leaf', secondary: '#ffe7db' }
      : null,
    user.activeSystems.includes('kp') && reading.kp
      ? { key: 'kp', label: 'KP', route: '/reading/kp', text: reading.kp.eventTiming, accent: COLORS.kp, icon: 'sparkles', secondary: '#e1f5ef' }
      : null,
  ].filter(Boolean) as SystemPreview[];

  const tabs = [
    { key: 'brief', label: 'Brief' },
    { key: 'proof', label: 'Proof' },
    { key: 'systems', label: 'Systems' },
  ];

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.dateLabel}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.greetingText}>{greeting}, {firstName}</Text>
          <Text style={styles.headerCopy}>A cleaner daily brief built from live transits, dasha timing, and your natal chart.</Text>
        </View>

        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'brief' && (
          <>
            <AnimatedCard index={0}>
              <LinearGradient colors={heroGradient} style={styles.hero}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>DAILY BRIEF</Text>
                  </View>
                  <View style={[styles.scorePill, { borderColor: `${toneAccent}55`, backgroundColor: `${toneAccent}22` }]}>
                    <Text style={[styles.scoreText, { color: toneAccent }]}>{alignmentScore}% aligned</Text>
                  </View>
                </View>

                <Text style={styles.heroHeadline}>{headline}</Text>
                <Text style={styles.heroBody}>{heroBody}</Text>
                <Text style={styles.heroEvidence}>{evidenceLine}</Text>

                <View style={styles.metricRow}>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>Tone</Text>
                    <Text style={styles.metricValue}>{tone}</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>Focus</Text>
                    <Text style={styles.metricValue}>{focusArea}</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>Live signals</Text>
                    <Text style={styles.metricValue}>{transits.length}</Text>
                  </View>
                </View>

                <View style={styles.signatureRow}>
                  {[
                    `${profile?.western?.sun} Sun`,
                    `${profile?.vedic?.rashi} Rashi`,
                    `${profile?.chinese?.animal} Year`,
                  ].map((item) => (
                    <View key={item} style={styles.signatureChip}>
                      <Text style={styles.signatureChipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </AnimatedCard>

            <AnimatedCard index={1}>
              <View style={styles.duoGrid}>
                <GradientCard accentColor={COLORS.tide} style={styles.duoCard}>
                  <Text style={styles.cardEyebrow}>LEAN INTO</Text>
                  <Text style={styles.cardTitle}>{focusArea}</Text>
                  <Text style={styles.cardBody}>{bestUse}</Text>
                </GradientCard>

                <GradientCard accentColor={COLORS.coral} style={styles.duoCard}>
                  <Text style={styles.cardEyebrow}>WATCH FOR</Text>
                  <Text style={styles.cardTitle}>{tone === 'Pressurized' ? 'Pressure line' : 'Blind spot'}</Text>
                  <Text style={styles.cardBody}>{watchFor}</Text>
                </GradientCard>
              </View>
            </AnimatedCard>

            <AnimatedCard index={2}>
              <GradientCard accentColor={COLORS.gold}>
                <Text style={styles.cardEyebrow}>TIMING NOTE</Text>
                <Text style={styles.timingText}>{timingNote}</Text>
                {remedyText ? <Text style={styles.timingSupport}>Remedy: {remedyText}</Text> : null}
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={3}>
              <View style={styles.actions}>
                {user.activeSystems.length >= 2 ? (
                  <CosmicButton title="Open full blended reading" onPress={() => router.push('/reading/unified')} />
                ) : null}
                <CosmicButton title="Share today's reading" onPress={() => router.push('/share/card')} variant="outline" />
              </View>
            </AnimatedCard>
          </>
        )}

        {activeSection === 'proof' && (
          <>
            <AnimatedCard index={0}>
              <GradientCard accentColor={COLORS.iris}>
                <Text style={styles.cardEyebrow}>WHY THIS READING</Text>
                <Text style={styles.proofLead}>{reading.unified.evidenceLine ?? evidenceLine}</Text>
                <View style={styles.proofList}>
                  <ProofRow
                    icon="pulse-outline"
                    label="Main driver"
                    text={topSupport ? `${formatTransitTitle(topSupport)}. ${compactText(topSupport.brief, 96)}` : compactText(reading.western?.overall, 110)}
                    color={COLORS.tide}
                  />
                  <ProofRow
                    icon="alert-circle-outline"
                    label="Pressure line"
                    text={topTension ? `${formatTransitTitle(topTension)}. ${compactText(topTension.brief, 96)}` : compactText(reading.western?.wellness ?? reading.kp?.sublordGuidance, 110)}
                    color={COLORS.coral}
                  />
                  <ProofRow
                    icon="time-outline"
                    label="Timing layer"
                    text={timingNote}
                    color={COLORS.gold}
                  />
                </View>
              </GradientCard>
            </AnimatedCard>

            {skyPreview.length > 0 && (
              <AnimatedCard index={1}>
                <GradientCard accentColor={COLORS.tide}>
                  <Text style={styles.cardEyebrow}>SKY NOW</Text>
                  <Text style={styles.skyIntro}>The fastest check on the current atmosphere.</Text>
                  <View style={styles.skyWrap}>
                    {skyPreview.map((position) => (
                      <SkyChip key={`${position.planet}-${position.sign}`} position={position} />
                    ))}
                  </View>
                </GradientCard>
              </AnimatedCard>
            )}
          </>
        )}

        {activeSection === 'systems' && (
          <>
            <AnimatedCard index={0}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>By system</Text>
                <Text style={styles.sectionCopy}>Open the lens that best matches the decision you need to make today.</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard index={1}>
              <View style={styles.systemList}>
                {systems.map((system) => (
                  <SystemStrip
                    key={system.key}
                    label={system.label}
                    text={system.text}
                    accent={system.accent}
                    icon={system.icon}
                    secondary={system.secondary}
                    onPress={() => router.push(system.route as never)}
                  />
                ))}
              </View>
            </AnimatedCard>
          </>
        )}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  emptyCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  header: {
    gap: 4,
  },
  dateLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  greetingText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: FONTS.heading,
  },
  headerCopy: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 320,
  },
  hero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    gap: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  heroBadge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroBadgeText: {
    color: '#fffaf1',
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  scorePill: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  heroHeadline: {
    color: '#fffaf1',
    fontSize: 29,
    lineHeight: 35,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
  },
  heroBody: {
    color: 'rgba(255,250,241,0.88)',
    fontSize: 14,
    lineHeight: 21,
  },
  heroEvidence: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 12,
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricPill: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 92,
    gap: 2,
  },
  metricLabel: {
    color: 'rgba(255,250,241,0.6)',
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  metricValue: {
    color: '#fffaf1',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: FONTS.heading,
  },
  signatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  signatureChip: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  signatureChipText: {
    color: '#fffaf1',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.5,
  },
  duoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  duoCard: {
    flexGrow: 1,
    flexBasis: 150,
  },
  cardEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 21,
    lineHeight: 25,
    fontFamily: FONTS.heading,
  },
  cardBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  timingText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontFamily: FONTS.heading,
  },
  timingSupport: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  proofLead: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  proofList: {
    gap: SPACING.md,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  proofIconWrap: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  proofBody: {
    flex: 1,
    gap: 2,
  },
  proofLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  proofText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  skyIntro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  skyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skyChip: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  skyChipText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 23,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  sectionCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  systemList: {
    gap: SPACING.sm,
  },
  systemStrip: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  systemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  systemHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  systemLabel: {
    color: '#fffaf1',
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  systemText: {
    color: 'rgba(255,250,241,0.8)',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: SPACING.md,
  },
  bottomPad: {
    height: 40,
  },
});
