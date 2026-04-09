import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { ExplainPanel } from '../../src/components/ui/ExplainPanel';
import { ForecastPanel } from '../../src/components/ui/ForecastPanel';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { PredictionFeedbackCard } from '../../src/components/ui/PredictionFeedbackCard';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { generatePeriodForecast, type ForecastWindow } from '../../src/content/forecastTemplates';
import { generateLifeRoadmap } from '../../src/content/lifeRoadmap';
import { getReadingExplainers } from '../../src/content/readingExplainers';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { buildForecastProfile } from '../../src/content/predictionSignals';
import { fetchDailyReading } from '../../src/services/functionsService';
import { useJournalStore } from '../../src/store/journalStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { getDateKey } from '../../src/utils/dateUtils';
import { normalizeUserProfile } from '../../src/utils/normalizeUserProfile';

const READING_VERSION = 3;

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstSentence(text?: string, fallback = '') {
  if (!text) return fallback;
  const normalized = text.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? normalized).trim();
}

function compactText(text?: string, maxLength = 120) {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

type SystemPreview = {
  key: string;
  label: string;
  route: string;
  text: string;
  accent: string;
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  secondary: string;
};

function SignalCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.signalCell}>
      <Text style={styles.signalValue}>{value}</Text>
      <Text style={styles.signalLabel}>{label}</Text>
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
            <OrbIcon icon={icon} size={38} accentColor={accent} secondaryColor={secondary} />
        <Text style={styles.systemLabel}>{label}</Text>
          </View>
          <Text style={styles.systemArrow}>Open</Text>
        </View>
        <Text style={styles.systemText} numberOfLines={3}>{text}</Text>
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
  const getEntryForDate = useJournalStore((state) => state.getEntryForDate);
  const [retryKey, setRetryKey] = useState(0);
  const [forecastWindow, setForecastWindow] = useState<ForecastWindow>('week');
  const [activeSection, setActiveSection] = useState('overview');
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

    // Try Cloud Function first, fall back to local templates
    fetchDailyReading()
      .then(({ reading }) => {
        // Merge cloud reading into our local format
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
          references: reading.references ?? [],
          positivityScore: reading.positivityScore ?? 0.78,
        };
        setTodayReading(merged as any);
        incrementStreak().catch(() => {});
      })
      .catch(() => {
        // Firebase not configured or offline — fall back to local templates
        try {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
          incrementStreak().catch(() => {});
        } catch {
          setRetryKey((v) => v + 1);
        }
      });
  }, [
    getCachedReading,
    incrementStreak,
    retryKey,
    setTodayReading,
    today,
    todayKey,
    forecastProfile,
  ]);

  const reading = (() => {
    if (!forecastProfile?.western?.sun || !forecastProfile?.vedic?.rashi || !forecastProfile?.chinese?.animal) return null;
    if (todayReading?.date === todayKey && (todayReading.version ?? 0) >= READING_VERSION) return todayReading;
    return null; // loading — useEffect will populate todayReading
  })();

  const greeting = useMemo(() => getGreeting(today), [today]);
  const firstName = safeUser?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'you';
  const journalEntry = getEntryForDate(todayKey);
  const alignmentScore = Math.round((reading?.positivityScore ?? 0.78) * 100);
  const profile = useMemo(() => {
    if (!forecastProfile?.western || !forecastProfile?.vedic || !forecastProfile?.chinese) return null;
    return {
      western: forecastProfile.western,
      vedic: forecastProfile.vedic,
      chinese: forecastProfile.chinese,
      kp: forecastProfile.kp,
    };
  }, [forecastProfile]);
  const forecast = useMemo(
    () => (profile ? generatePeriodForecast(today, profile, forecastWindow) : null),
    [forecastWindow, profile, today]
  );
  const roadmap = useMemo(() => (profile ? generateLifeRoadmap(today, profile) : null), [profile, today]);
  const explainItems = useMemo(() => {
    if (!safeUser || !reading) return [];
    return getReadingExplainers(safeUser, reading);
  }, [reading, safeUser]);
  const heroHeadline = useMemo(
    () => firstSentence(reading?.unified?.affirmation, `${greeting}, ${firstName}`),
    [firstName, greeting, reading?.unified?.affirmation]
  );
  const heroBody = useMemo(
    () => compactText(reading?.unified?.cosmicVibe, 182),
    [reading?.unified?.cosmicVibe]
  );
  const westernFocus = useMemo(
    () => compactText(reading?.western?.overall, 108),
    [reading?.western?.overall]
  );
  const timingFocus = useMemo(
    () => compactText(reading?.kp?.eventTiming ?? reading?.vedic?.dasha, 108),
    [reading?.kp?.eventTiming, reading?.vedic?.dasha]
  );

  if (!user || !reading) {
    return (
      <StarField>
        <View style={styles.emptyWrap}>
          <CosmicOrb size={176} />
          <Text style={styles.emptyTitle}>Preparing your morning almanac</Text>
          <Text style={styles.emptyCopy}>We are arranging today's reading around your saved chart.</Text>
        </View>
      </StarField>
    );
  }

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
    { key: 'overview', label: 'Overview' },
    { key: 'forecast', label: 'Forecast' },
  ];

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateLabel}>
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'overview' && (
          <>
            <AnimatedCard index={0}>
              <View style={styles.posterWrap}>
                <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
                  <View style={styles.posterTopRow}>
                    <View style={styles.posterBadge}>
                      <Text style={styles.posterBadgeText}>TODAY</Text>
                    </View>
                    <View style={styles.heroScorePill}>
                      <Text style={styles.heroScoreText}>{alignmentScore}% aligned</Text>
                    </View>
                  </View>
                  <Text style={styles.posterKicker}>{greeting}, {firstName}</Text>
                  <Text style={styles.posterTitle}>{heroHeadline}</Text>
                  <Text style={styles.posterBody}>{heroBody}</Text>

                  <View style={styles.posterInsightGrid}>
                    <View style={styles.posterInsightCard}>
                      <Text style={styles.posterInsightLabel}>Focus</Text>
                      <Text style={styles.posterInsightText}>{westernFocus}</Text>
                    </View>
                    <View style={styles.posterInsightCard}>
                      <Text style={styles.posterInsightLabel}>Timing</Text>
                      <Text style={styles.posterInsightText}>{timingFocus}</Text>
                    </View>
                  </View>

                  <View style={styles.posterSignatureRow}>
                    {[
                      `${profile?.western?.sun} Sun`,
                      `${profile?.vedic?.rashi} Rashi`,
                      `${profile?.chinese?.animal} Year`,
                    ].map((item) => (
                      <View key={item} style={styles.posterSignatureChip}>
                        <Text style={styles.posterSignatureText}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  {user.activeSystems.length >= 2 ? (
                    <View style={styles.posterButtonWrap}>
                      <CosmicButton title="Open full blend" onPress={() => router.push('/reading/unified')} />
                    </View>
                  ) : null}
                </LinearGradient>

                <View style={styles.posterOrb}>
                  <CosmicOrb size={194} />
                </View>
              </View>
            </AnimatedCard>

            <AnimatedCard index={1}>
              <LinearGradient colors={COLORS.gradientInkSoft} style={styles.signalBoard}>
                <SignalCell label="Day streak" value={user.streak} />
                <View style={styles.signalDivider} />
                <SignalCell label="Alignment" value={`${alignmentScore}%`} />
                <View style={styles.signalDivider} />
                <SignalCell label="Cosmic points" value={user.cosmicPoints} />
              </LinearGradient>
            </AnimatedCard>

            <AnimatedCard index={2}>
              <GradientCard accentColor={COLORS.gold} colors={COLORS.gradientDawn}>
                <Text style={styles.panelLabel}>Anchor</Text>
                <Text style={styles.pullQuote}>"{compactText(reading.unified.affirmation, 110)}"</Text>
                <Text style={styles.pullBody}>Keep this close when the day speeds up. It is the shortest useful version of your reading.</Text>
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={3}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Read each system</Text>
                <Text style={styles.sectionCopy}>Every lens has its own emphasis today. Open the one that matches the choice you need to make.</Text>
              </View>

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

            <AnimatedCard index={4}>
              <View style={styles.actions}>
                <CosmicButton title="Share today's reading" onPress={() => router.push('/share/card')} variant="outline" />
                <CosmicButton title={journalEntry ? 'Open journal + archive' : 'Write tonight\'s note'} onPress={() => router.push('/(tabs)/cosmos')} variant="secondary" />
              </View>
            </AnimatedCard>

            <AnimatedCard index={5}>
              <PredictionFeedbackCard window="today" title="Rate today's AI score layer" />
            </AnimatedCard>
          </>
        )}

        {activeSection === 'forecast' && (
          <>
            <AnimatedCard index={0}>
              {forecast ? (
                <ForecastPanel forecast={forecast} window={forecastWindow} onChange={setForecastWindow} />
              ) : null}
            </AnimatedCard>

            <AnimatedCard index={1}>
              <ExplainPanel items={explainItems} />
            </AnimatedCard>

            <AnimatedCard index={2}>
              <PredictionFeedbackCard
                window={forecastWindow === 'week' ? 'week' : 'month'}
                title={forecastWindow === 'week' ? 'Rate the 7-day AI outlook' : 'Rate the 30-day AI outlook'}
              />
            </AnimatedCard>

            {roadmap ? (
              <AnimatedCard index={3}>
                <GradientCard accentColor={COLORS.vedic}>
                  <Text style={styles.panelLabel}>Long-range chapter</Text>
                  <Text style={styles.roadmapTitle}>{roadmap.currentChapter.title}</Text>
                  <Text style={styles.roadmapRange}>{roadmap.currentChapter.range}</Text>
                  <Text style={styles.roadmapBody}>{roadmap.currentChapter.guidance}</Text>
                  <View style={styles.roadmapButtonWrap}>
                    <CosmicButton title="Open life roadmap" onPress={() => router.push('/reading/unified')} variant="outline" />
                  </View>
                </GradientCard>
              </AnimatedCard>
            ) : null}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
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
    fontSize: 30,
    lineHeight: 36,
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
  retryWrap: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  dateLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  posterWrap: {
    position: 'relative',
    minHeight: 410,
  },
  poster: {
    minHeight: 392,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
    overflow: 'hidden',
  },
  posterOrb: {
    position: 'absolute',
    right: -18,
    top: 84,
    opacity: 0.7,
  },
  posterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  posterBadge: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  posterBadgeText: {
    color: '#fffaf1',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  heroScorePill: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,190,110,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,190,110,0.22)',
  },
  heroScoreText: {
    color: '#ffdba0',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  posterKicker: {
    color: 'rgba(255,250,241,0.76)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  posterTitle: {
    color: '#fffaf1',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
    maxWidth: 280,
  },
  posterBody: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 285,
  },
  posterInsightGrid: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  posterInsightCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 4,
    maxWidth: 285,
  },
  posterInsightLabel: {
    color: 'rgba(255,250,241,0.60)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.9,
  },
  posterInsightText: {
    color: '#fffaf1',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONTS.body,
  },
  posterSignatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  posterSignatureChip: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  posterSignatureText: {
    color: '#fffaf1',
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.5,
  },
  posterButtonWrap: {
    marginTop: SPACING.xs,
    maxWidth: 180,
  },
  signalBoard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.ruleLight,
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  signalCell: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    gap: 2,
  },
  signalDivider: {
    width: 1,
    backgroundColor: COLORS.ruleLight,
  },
  signalValue: {
    color: '#fffaf1',
    fontSize: 24,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  signalLabel: {
    color: 'rgba(255,250,241,0.68)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  panelLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  pullQuote: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: FONTS.display,
  },
  pullBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  roadmapTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  roadmapRange: {
    color: COLORS.vedic,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  roadmapBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  roadmapButtonWrap: {
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 29,
    fontFamily: FONTS.heading,
  },
  sectionCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
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
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  systemText: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 13,
    lineHeight: 19,
  },
  systemArrow: {
    color: 'rgba(255,250,241,0.62)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  actions: {
    gap: SPACING.md,
  },
  bottomPad: {
    height: 40,
  },
});
