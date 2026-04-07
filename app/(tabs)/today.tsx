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
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { generatePeriodForecast, type ForecastWindow } from '../../src/content/forecastTemplates';
import { getReadingExplainers } from '../../src/content/readingExplainers';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { fetchDailyReading } from '../../src/services/functionsService';
import { useJournalStore } from '../../src/store/journalStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { formatDisplayDate, getDateKey } from '../../src/utils/dateUtils';

function getCosmicEnergy(date: Date): number {
  const day = date.getFullYear() * 1000 + date.getMonth() * 32 + date.getDate();
  const seed = Math.sin(day * 9973) * 10000;
  return 62 + Math.floor((seed - Math.floor(seed)) * 34);
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
          <Text style={styles.systemArrow}>Read</Text>
        </View>
        <Text style={styles.systemText}>{text}</Text>
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
  const getRecentReadings = useReadingStore((state) => state.getRecentReadings);
  const getEntryForDate = useJournalStore((state) => state.getEntryForDate);
  const [retryKey, setRetryKey] = useState(0);
  const [forecastWindow, setForecastWindow] = useState<ForecastWindow>('week');
  const [activeSection, setActiveSection] = useState('overview');
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);

  useEffect(() => {
    if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) return;

    const cached = getCachedReading(todayKey);
    if (cached) {
      setTodayReading(cached);
      incrementStreak().catch(() => {});
      return;
    }

    // Try Cloud Function first, fall back to local templates
    fetchDailyReading()
      .then(({ reading }) => {
        // Merge cloud reading into our local format
        const merged = {
          date: todayKey,
          western: reading.western,
          vedic: reading.vedic,
          chinese: reading.chinese,
          kp: reading.kp,
          unified: reading.unified,
          references: [],
        };
        setTodayReading(merged as any);
        incrementStreak().catch(() => {});
      })
      .catch(() => {
        // Firebase not configured or offline — fall back to local templates
        try {
          const generated = generateDailyReading(today, user.western!.sun, user.vedic!.rashi, user.chinese!.animal);
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
    user?.chinese?.animal,
    user?.vedic?.rashi,
    user?.western?.sun,
  ]);

  const reading = (() => {
    if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) return null;
    if (todayReading?.date === todayKey) return todayReading;
    return null; // loading — useEffect will populate todayReading
  })();

  const energy = useMemo(() => getCosmicEnergy(today), [today]);
  const greeting = useMemo(() => getGreeting(today), [today]);
  const firstName = user?.name?.split(' ')[0] ?? 'you';
  const journalEntry = getEntryForDate(todayKey);
  const profile = useMemo(() => {
    if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) return null;
    return {
      western: user.western,
      vedic: user.vedic,
      chinese: user.chinese,
      kp: user.kp,
    };
  }, [user?.chinese, user?.kp, user?.vedic, user?.western]);
  const recentReadings = useMemo(
    () => getRecentReadings(3).filter((item) => item.date !== todayKey),
    [getRecentReadings, todayKey, todayReading]
  );
  const forecast = useMemo(
    () => (profile ? generatePeriodForecast(today, profile, forecastWindow) : null),
    [forecastWindow, profile, today]
  );
  const explainItems = useMemo(() => {
    if (!user || !reading) return [];
    return getReadingExplainers(user, reading);
  }, [reading, user]);

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
    { key: 'archive', label: 'Archive' },
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
                  <Text style={styles.posterKicker}>{greeting}, {firstName}</Text>
                  <Text style={styles.posterTitle}>{reading.unified.cosmicVibe}</Text>
                  <Text style={styles.posterBody}>{reading.unified.shareText}</Text>

                  <View style={styles.posterSignature}>
                    <Text style={styles.posterSignatureText}>
                      {user.western?.sun} sun - {user.vedic?.rashi} rashi - {user.chinese?.animal} year
                    </Text>
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
                <SignalCell label="Energy" value={`${energy}%`} />
                <View style={styles.signalDivider} />
                <SignalCell label="Streak" value={user.streak} />
                <View style={styles.signalDivider} />
                <SignalCell label="Points" value={user.cosmicPoints} />
              </LinearGradient>
            </AnimatedCard>

            <AnimatedCard index={2}>
              <GradientCard accentColor={COLORS.gold} colors={COLORS.gradientDawn}>
                <Text style={styles.panelLabel}>Today's pull</Text>
                <Text style={styles.pullQuote}>"{reading.unified.affirmation}"</Text>
                <Text style={styles.pullBody}>Use this as your anchor before the day starts moving too quickly.</Text>
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={3}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Each lens for today</Text>
                <Text style={styles.sectionCopy}>Open the systems one by one when you want a deeper read.</Text>
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
          </>
        )}

        {activeSection === 'archive' && (
          <AnimatedCard index={0}>
            <GradientCard style={styles.archiveCard} accentColor={COLORS.tide}>
              <Text style={styles.panelLabel}>Reading archive</Text>
              {recentReadings.length ? (
                recentReadings.map((item) => (
                  <View key={item.date} style={styles.archiveRow}>
                    <Text style={styles.archiveDate}>{formatDisplayDate(item.date)}</Text>
                    <Text style={styles.archiveText}>{item.unified.cosmicVibe}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.archiveEmpty}>Your recent readings will stack here as you build a rhythm.</Text>
              )}
            </GradientCard>
          </AnimatedCard>
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
    minHeight: 350,
  },
  poster: {
    minHeight: 320,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    overflow: 'hidden',
  },
  posterOrb: {
    position: 'absolute',
    right: -6,
    top: 92,
  },
  posterKicker: {
    color: 'rgba(255,250,241,0.76)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  posterTitle: {
    color: '#fffaf1',
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FONTS.display,
    letterSpacing: -0.7,
    maxWidth: 230,
    marginTop: SPACING.sm,
  },
  posterBody: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 230,
    marginTop: SPACING.sm,
  },
  posterSignature: {
    marginTop: SPACING.lg,
    alignSelf: 'flex-start',
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
    marginTop: SPACING.lg,
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
    fontSize: 27,
    lineHeight: 31,
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
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FONTS.display,
  },
  pullBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionHeader: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 33,
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
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  systemText: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 14,
    lineHeight: 21,
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
  archiveCard: {
    gap: SPACING.sm,
  },
  archiveRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  archiveDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  archiveText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FONTS.heading,
  },
  archiveEmpty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPad: {
    height: 40,
  },
});
