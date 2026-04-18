import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { DailyReading } from '../../src/types/astrology';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SectionLabel } from '../../src/components/ui/SectionLabel';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { NetworkBanner } from '../../src/components/ui/NetworkBanner';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  SHADOWS,
  SPACING,
  TYPE,
} from '../../src/constants/theme';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { buildForecastProfile } from '../../src/content/predictionSignals';
import { fetchDailyReading } from '../../src/services/functionsService';
import { speakReading, stopReadingAudio } from '../../src/services/ttsService';
import {
  cancelTransitAlerts,
  getHighImpactTransit,
  scheduleHighImpactTransitAlert,
} from '../../src/utils/notifications';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { useReadingStore } from '../../src/store/readingStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { getDateKey } from '../../src/utils/dateUtils';
import { normalizeUserProfile } from '../../src/utils/normalizeUserProfile';
import { normalizeLanguage } from '../../src/i18n/language';
import {
  formatSignature,
  getGreetingLabel,
  getSpokenTodayCopy,
  getSystemPreviewCopy,
  getTodayShellCopy,
} from '../../src/i18n/spokenContent';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

const READING_VERSION = 5;

const TONE_GRADIENTS: Record<'Opening' | 'Mixed' | 'Pressurized', readonly [string, string, string]> = {
  Opening: ['#0f2739', '#13576b', '#1e8a76'],
  Mixed: ['#1b1535', '#3b256f', '#7a3f60'],
  Pressurized: ['#220d2c', '#5a1d4a', '#a4414b'],
};

const TONE_ACCENTS: Record<'Opening' | 'Mixed' | 'Pressurized', string> = {
  Opening: COLORS.tide,
  Mixed: COLORS.gold,
  Pressurized: COLORS.coral,
};

type SystemKey = 'western' | 'vedic' | 'chinese' | 'kp';

type SystemPreview = {
  key: SystemKey;
  label: string;
  route: string;
  text: string;
  accent: string;
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  secondary: string;
};

function getToneFallback(supportCount: number, tensionCount: number): 'Opening' | 'Mixed' | 'Pressurized' {
  if (supportCount >= tensionCount + 2) return 'Opening';
  if (tensionCount > supportCount) return 'Pressurized';
  return 'Mixed';
}

export default function TodayScreen() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const accountUser = useUserStore((state) => state.user);
  const user = useActiveProfile();
  const transitAlertsEnabled = useSettingsStore((state) => state.transitAlertsEnabled);
  const hasSeenTutorial = useSettingsStore((state) => state.hasSeenTutorial);
  const incrementStreak = useUserStore((state) => state.incrementStreak);
  const todayReading = useReadingStore((state) => state.todayReading);
  const getCachedReading = useReadingStore((state) => state.getCachedReading);
  const setTodayReading = useReadingStore((state) => state.setTodayReading);
  const [retryKey, setRetryKey] = useState(0);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const [fallbackDismissed, setFallbackDismissed] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();

  const today = useMemo(() => new Date(), []);
  const language = normalizeLanguage(user?.language ?? i18n.language);
  const shellCopy = useMemo(() => getTodayShellCopy(language), [language]);
  const todayKey = getDateKey(today);
  const safeUser = useMemo(() => (user ? normalizeUserProfile(user) : null), [user]);
  const forecastProfile = useMemo(
    () => (safeUser ? buildForecastProfile(safeUser) : null),
    [safeUser],
  );
  const isManagedProfile = Boolean(user?.isManagedProfile);
  const isPremium = hasPremiumEntitlement(accountUser?.subscription);

  const profile = useMemo(() => {
    if (!forecastProfile?.western || !forecastProfile?.vedic || !forecastProfile?.chinese) return null;
    return {
      western: forecastProfile.western,
      vedic: forecastProfile.vedic,
      chinese: forecastProfile.chinese,
      kp: forecastProfile.kp,
    };
  }, [forecastProfile]);

  const reading = useMemo(() => {
    if (!profile) return null;
    if (isManagedProfile && forecastProfile) return generateDailyReading(today, forecastProfile);
    if (todayReading?.date === todayKey && (todayReading.version ?? 0) >= READING_VERSION) return todayReading;
    return null;
  }, [forecastProfile, isManagedProfile, profile, today, todayKey, todayReading]);

  useEffect(() => {
    if (reading) {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [reading, retryKey]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoadingTimedOut(false);
    setRetryKey((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (isManagedProfile) {
      if (refreshing) setRefreshing(false);
      return;
    }
    if (!forecastProfile?.western?.sun || !forecastProfile?.vedic?.rashi || !forecastProfile?.chinese?.animal) {
      if (refreshing) setRefreshing(false);
      return;
    }
    const finish = () => {
      if (!cancelled) setRefreshing(false);
    };
    const cached = refreshing ? null : getCachedReading(todayKey);
    if (cached?.unified?.shareText && cached.references?.length && (cached.version ?? 0) >= READING_VERSION) {
      setTodayReading(cached);
      incrementStreak().catch(() => {});
      finish();
      return;
    }
    fetchDailyReading()
      .then(({ reading }) => {
        if (cancelled) return;
        if ((reading?.version ?? 0) < READING_VERSION) {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
          setUsedLocalFallback(true);
          incrementStreak().catch(() => {});
          return;
        }
        setUsedLocalFallback(false);
        setFallbackDismissed(false);
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
        if (cancelled) return;
        try {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
          setUsedLocalFallback(true);
          incrementStreak().catch(() => {});
        } catch {
          setRetryKey((value) => value + 1);
        }
      })
      .finally(finish);
    return () => {
      cancelled = true;
    };
  }, [
    forecastProfile,
    getCachedReading,
    incrementStreak,
    isManagedProfile,
    retryKey,
    setTodayReading,
    today,
    todayKey,
    refreshing,
  ]);

  useEffect(() => {
    if (!reading || !accountUser || !isPremium || !transitAlertsEnabled) {
      cancelTransitAlerts().catch(() => {});
      return;
    }
    scheduleHighImpactTransitAlert(reading, accountUser).catch(() => {});
  }, [accountUser, isPremium, reading, transitAlertsEnabled]);

  useEffect(() => () => { stopReadingAudio().catch(() => {}); }, []);

  const greeting = useMemo(() => getGreetingLabel(today, language), [language, today]);
  const firstName = safeUser?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'you';

  if (!user || !reading) {
    return (
      <StarField>
        <View style={styles.emptyWrap}>
          <EmptyState
            variant="loading"
            title={shellCopy.loadingTitle}
            body={shellCopy.loadingCopy}
            ctaLabel={loadingTimedOut ? shellCopy.retry : undefined}
            onCta={loadingTimedOut ? () => { setLoadingTimedOut(false); setRetryKey((v) => v + 1); } : undefined}
          />
        </View>
      </StarField>
    );
  }

  const transits = reading.activeTransits ?? [];
  const supportCount = transits.filter((transit) => transit.nature === 'support').length;
  const tensionCount = transits.filter((transit) => transit.nature === 'tension').length;
  const tone = (reading.unified?.tone ?? getToneFallback(supportCount, tensionCount)) as 'Opening' | 'Mixed' | 'Pressurized';
  const alignmentScore = Math.round((reading.positivityScore ?? 0.78) * 100);
  const heroGradient = TONE_GRADIENTS[tone];
  const toneAccent = TONE_ACCENTS[tone];
  const topSupport = transits.find((transit) => transit.nature === 'support') ?? transits[0];
  const topTension = transits.find((transit) => transit.nature === 'tension');
  const highImpactTransit = !isPremium ? getHighImpactTransit(reading) : undefined;
  const subscription = accountUser?.subscription;
  const trialDaysLeft = (() => {
    if (subscription?.status !== 'trial' || !subscription.trialEndsAt) return null;
    const end = new Date(subscription.trialEndsAt).getTime();
    const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const todayCopy = getSpokenTodayCopy({
    language,
    reading,
    firstName,
    tone,
    focusArea: reading.unified.focusArea,
    alignmentScore,
    transitsCount: transits.length,
    topSupport,
    topTension,
    timingFallback: reading.kp?.eventTiming ?? reading.vedic?.dasha,
  });

  const headline = todayCopy.headline;
  const heroBody = todayCopy.heroBody;
  const evidenceLine = todayCopy.evidenceLine;
  const bestUse = todayCopy.bestUse;
  const watchFor = todayCopy.watchForText;
  const timingNote = todayCopy.timingNoteText;
  const remedyText = todayCopy.remedyText;
  const focusArea = todayCopy.focusArea;

  const handleToggleAudio = async () => {
    if (isSpeaking) {
      await stopReadingAudio();
      setIsSpeaking(false);
      return;
    }
    const started = await speakReading(
      {
        headline,
        heroBody,
        bestUse,
        watchFor,
        affirmation: reading?.unified?.affirmation,
      },
      {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
    if (!started) {
      showAlert('Audio unavailable', 'Spoken playback is not supported on this device.');
      return;
    }
    setIsSpeaking(true);
  };

  const signatureChips = [
    formatSignature(profile?.western?.sun, 'sun', language),
    formatSignature(profile?.vedic?.rashi, 'rashi', language),
    formatSignature(profile?.chinese?.animal, 'year', language),
  ].filter(Boolean) as string[];

  const systems = [
    user.activeSystems.includes('western') && reading.western
      ? { key: 'western', label: t('systems.western'), route: '/reading/western', text: getSystemPreviewCopy('western', language, reading.western.overall), accent: COLORS.western, icon: 'sunny', secondary: '#d6d1ff' }
      : null,
    user.activeSystems.includes('vedic') && reading.vedic
      ? { key: 'vedic', label: t('systems.vedic'), route: '/reading/vedic', text: getSystemPreviewCopy('vedic', language, reading.vedic.dasha), accent: COLORS.vedic, icon: 'moon', secondary: '#ffd9c2' }
      : null,
    user.activeSystems.includes('chinese') && reading.chinese
      ? { key: 'chinese', label: t('systems.chinese'), route: '/reading/chinese', text: getSystemPreviewCopy('chinese', language, reading.chinese.element), accent: COLORS.chinese, icon: 'leaf', secondary: '#ffd3e0' }
      : null,
    user.activeSystems.includes('kp') && reading.kp
      ? { key: 'kp', label: t('systems.kp'), route: '/reading/kp', text: getSystemPreviewCopy('kp', language, reading.kp.eventTiming), accent: COLORS.kp, icon: 'sparkles', secondary: '#c6f5ea' }
      : null,
  ].filter(Boolean) as SystemPreview[];

  return (
    <StarField>
      <ResetScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
      >
        {usedLocalFallback && !fallbackDismissed ? (
          <NetworkBanner
            variant="info"
            title="Using offline reading"
            body="We couldn't reach the server, so today's reading was generated locally. Pull down to retry."
            ctaLabel="Retry"
            onCta={handleRefresh}
            onDismiss={() => setFallbackDismissed(true)}
          />
        ) : null}

        {refreshing ? (
          <View style={styles.refreshPill} accessibilityRole="progressbar" accessibilityLabel="Regenerating today's reading">
            <Ionicons name="sync" size={12} color={COLORS.gold} />
            <Text style={styles.refreshPillText}>Regenerating reading</Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.datePremiumRow}>
            <Text style={styles.dateLabel}>
              {today.toLocaleDateString(todayCopy.dateLocale, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
            </Text>
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={10} color={COLORS.starGold} />
                <Text style={styles.premiumBadgeText}>
                  {trialDaysLeft !== null
                    ? `TRIAL · ${trialDaysLeft}D LEFT`
                    : 'PREMIUM'}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.greetingText}>
            {greeting}, <Text style={styles.greetingName}>{firstName}</Text>
          </Text>
          <Text style={styles.headerCopy}>{todayCopy.headerCopy}</Text>
        </View>

        <AnimatedCard index={0}>
          <View style={[styles.hero, { shadowColor: toneAccent }]}>
            <LinearGradient colors={heroGradient} style={StyleSheet.absoluteFillObject} />
            <View style={styles.heroTopHighlight} pointerEvents="none" />

            <View style={styles.heroTopRow}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.toneDot, { backgroundColor: toneAccent }]} />
                <Text style={styles.heroBadgeText}>{todayCopy.heroBadge}</Text>
              </View>
              <ProgressRing
                progress={alignmentScore / 100}
                size={56}
                strokeWidth={5}
                color={toneAccent}
                value={`${alignmentScore}`}
                label="align"
              />
            </View>

            <Text style={styles.heroHeadline}>{headline}</Text>
            <Text style={styles.heroBody}>{heroBody}</Text>
            <Text style={styles.heroEvidence}>{evidenceLine}</Text>

            <Pressable
              onPress={handleToggleAudio}
              style={({ pressed }) => [styles.heroAudioButton, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={isSpeaking ? 'Stop audio playback' : 'Play reading audio'}
            >
              <Ionicons name={isSpeaking ? 'pause-circle' : 'play-circle'} size={18} color={COLORS.textPrimary} />
              <Text style={styles.heroAudioText}>{isSpeaking ? 'Stop' : todayCopy.alignedText ? 'Listen' : 'Play'}</Text>
            </Pressable>

            <View style={styles.metricRow}>
              <MetricPill label={todayCopy.tone} value={todayCopy.toneLabel} />
              <MetricPill label={todayCopy.focus} value={focusArea} />
              <MetricPill label={todayCopy.liveSignals} value={String(transits.length)} />
            </View>

            {signatureChips.length > 0 ? (
              <View style={styles.signatureRow}>
                {signatureChips.map((item) => (
                  <View key={item} style={styles.signatureChip}>
                    <Text style={styles.signatureChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <View style={styles.duoGrid}>
            <GlassCard accentColor={COLORS.tide} style={styles.duoCard}>
              <SectionLabel accent={COLORS.tide}>{todayCopy.leanInto}</SectionLabel>
              <Text style={styles.cardTitle}>{focusArea}</Text>
              <Text style={styles.cardBody}>{bestUse}</Text>
            </GlassCard>
            <GlassCard accentColor={COLORS.coral} style={styles.duoCard}>
              <SectionLabel accent={COLORS.coral}>{todayCopy.watchFor}</SectionLabel>
              <Text style={styles.cardTitle}>{todayCopy.watchForTitle}</Text>
              <Text style={styles.cardBody}>{watchFor}</Text>
            </GlassCard>
          </View>
        </AnimatedCard>

        {!isPremium ? (
          <AnimatedCard index={2}>
            <Pressable
              onPress={() => router.push('/subscription')}
              style={({ pressed }) => [styles.upgradeCard, pressed && { opacity: 0.92 }]}
              accessibilityRole="button"
              accessibilityLabel="See Premium"
            >
              <LinearGradient
                colors={['rgba(255,208,120,0.18)', 'rgba(172,132,255,0.14)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.upgradeRow}>
                <View style={styles.upgradeIcon}>
                  <Ionicons name="sparkles" size={18} color={COLORS.starGold} />
                </View>
                <View style={styles.upgradeBody}>
                  <Text style={styles.upgradeTitle}>Try Premium free for 7 days</Text>
                  <Text style={styles.upgradeCopy}>
                    Unlock the 3-phase 30-day forecast, Antardasha sub-chapters, journal insights, and an ad-free experience.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.starGold} />
              </View>
            </Pressable>
          </AnimatedCard>
        ) : null}

        {highImpactTransit ? (
          <AnimatedCard index={3}>
            <Pressable
              onPress={() => router.push('/subscription')}
              style={({ pressed }) => [styles.alertCard, pressed && { opacity: 0.92 }]}
              accessibilityRole="button"
              accessibilityLabel="Unlock transit alerts with Premium"
            >
              <LinearGradient
                colors={['rgba(172,132,255,0.22)', 'rgba(255,120,150,0.14)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.alertHeaderRow}>
                <View style={styles.alertIcon}>
                  <Ionicons name="notifications" size={16} color={COLORS.iris} />
                </View>
                <Text style={styles.alertKicker}>High-impact transit · Premium alert</Text>
              </View>
              <Text style={styles.alertTitle}>
                {highImpactTransit.transitPlanet} {highImpactTransit.aspect} {highImpactTransit.natalPlanet}
              </Text>
              <Text style={styles.alertBody} numberOfLines={3}>{highImpactTransit.brief}</Text>
              <Text style={styles.alertCta}>
                Premium would send you a push the moment this peaks → upgrade
              </Text>
            </Pressable>
          </AnimatedCard>
        ) : null}

        <AnimatedCard index={!isPremium ? 4 : 2}>
          <GlassCard accentColor={COLORS.gold}>
            <SectionLabel accent={COLORS.gold}>{todayCopy.timingNote}</SectionLabel>
            <Text style={styles.timingText}>{timingNote}</Text>
            {remedyText ? (
              <Text style={styles.timingSupport}>
                <Text style={styles.timingSupportStrong}>{todayCopy.remedyPrefix}: </Text>
                {remedyText}
              </Text>
            ) : null}
          </GlassCard>
        </AnimatedCard>

        {transits.length > 0 ? (
          <AnimatedCard index={3}>
            <GlassCard accentColor={COLORS.iris}>
              <SectionLabel accent={COLORS.iris}>LIVE TRANSITS</SectionLabel>
              <View style={styles.transitSummaryRow}>
                <SummaryCell count={supportCount} label="Support" color={COLORS.tide} />
                <View style={styles.transitSummaryDivider} />
                <SummaryCell count={tensionCount} label="Tension" color={COLORS.coral} />
                <View style={styles.transitSummaryDivider} />
                <SummaryCell
                  count={Math.max(0, transits.length - supportCount - tensionCount)}
                  label="Neutral"
                  color={COLORS.textSecondary}
                />
              </View>
              {transits.slice(0, 2).map((transit, i) => (
                <View
                  key={`${transit.transitPlanet}-${transit.natalPlanet}-${i}`}
                  style={styles.transitRow}
                >
                  <View
                    style={[
                      styles.transitNature,
                      {
                        backgroundColor:
                          transit.nature === 'support'
                            ? `${COLORS.tide}22`
                            : transit.nature === 'tension'
                            ? `${COLORS.coral}22`
                            : 'rgba(255,255,255,0.06)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.transitAspect,
                        {
                          color:
                            transit.nature === 'support'
                              ? COLORS.tide
                              : transit.nature === 'tension'
                              ? COLORS.coral
                              : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {transit.transitPlanet} {transit.aspect} {transit.natalPlanet}
                    </Text>
                  </View>
                  <Text style={styles.transitBrief} numberOfLines={2}>{transit.brief}</Text>
                </View>
              ))}
            </GlassCard>
          </AnimatedCard>
        ) : null}

        {systems.length > 0 ? (
          <AnimatedCard index={4}>
            <View style={styles.systemsHeader}>
              <SectionLabel>{todayCopy.bySystem}</SectionLabel>
            </View>
            <View style={styles.systemList}>
              {systems.map((system) => (
                <Pressable
                  key={system.key}
                  onPress={() => router.push(system.route as never)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${system.label} reading`}
                  style={({ pressed }) => [
                    styles.systemRow,
                    { borderColor: `${system.accent}55` },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <OrbIcon icon={system.icon} size={36} accentColor={system.accent} secondaryColor={system.secondary} />
                  <View style={styles.systemBody}>
                    <Text style={styles.systemLabel}>{system.label}</Text>
                    <Text style={styles.systemText} numberOfLines={2}>{system.text}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </Pressable>
              ))}
            </View>
          </AnimatedCard>
        ) : null}

        <AnimatedCard index={5}>
          <View style={styles.actions}>
            {user.activeSystems.length >= 2 ? (
              <CosmicButton title={todayCopy.openFull} onPress={() => router.push('/reading/unified')} />
            ) : null}
            <CosmicButton title={todayCopy.shareReading} onPress={() => router.push('/share/card')} variant="outline" />
          </View>
        </AnimatedCard>

        <AnimatedCard index={6}>
          <View style={styles.quickLinks}>
            <QuickLink
              icon="moon-outline"
              label="Moon calendar"
              onPress={() => router.push('/moon-calendar')}
            />
            <QuickLink
              icon="refresh-outline"
              label="Retrograde"
              onPress={() => router.push('/retrograde')}
            />
            <QuickLink
              icon="sparkles-outline"
              label="Archive"
              onPress={() => router.push('/reading/archive')}
            />
          </View>
        </AnimatedCard>

        <View style={styles.bottomPad} />
      </ResetScrollView>
      {alertModal}
      <TutorialOverlay visible={!hasSeenTutorial && !!reading} />
    </StarField>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SummaryCell({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <View style={styles.transitSummaryItem}>
      <View style={[styles.transitDot, { backgroundColor: color }]} />
      <Text style={styles.transitSummaryCount}>{count}</Text>
      <Text style={styles.transitSummaryLabel}>{label}</Text>
    </View>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickLink, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={18} color={COLORS.gold} />
      <Text style={styles.quickLinkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    gap: 6,
  },
  datePremiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateLabel: {
    ...TYPE.label,
    color: COLORS.textMuted,
    fontFamily: FONTS.accent,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.starGold}66`,
    backgroundColor: `${COLORS.starGold}1f`,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  refreshPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.gold}55`,
    backgroundColor: `${COLORS.gold}14`,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  refreshPillText: {
    color: COLORS.gold,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  premiumBadgeText: {
    color: COLORS.starGold,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  greetingText: {
    ...TYPE.hero,
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  greetingName: {
    color: COLORS.gold,
  },
  headerCopy: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    maxWidth: 360,
  },
  hero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    gap: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    ...SHADOWS.deep,
  },
  heroTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroBadgeText: {
    color: 'rgba(255,250,241,0.84)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  scorePill: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreText: {
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  heroHeadline: {
    color: '#fff8ea',
    ...TYPE.title,
    fontFamily: FONTS.display,
  },
  heroBody: {
    color: 'rgba(255,248,234,0.88)',
    ...TYPE.body,
    fontFamily: FONTS.body,
  },
  heroEvidence: {
    color: 'rgba(255,248,234,0.68)',
    ...TYPE.caption,
    fontFamily: FONTS.body,
    fontStyle: 'italic',
  },
  heroAudioButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroAudioText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
    borderColor: 'rgba(255,255,255,0.14)',
    minWidth: 96,
    gap: 3,
  },
  metricLabel: {
    color: 'rgba(255,248,234,0.56)',
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.3,
  },
  metricValue: {
    color: '#fff8ea',
    ...TYPE.subhead,
    fontFamily: FONTS.heading,
  },
  signatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  signatureChip: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  signatureChipText: {
    color: '#fff8ea',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
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
  upgradeCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,208,120,0.35)',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,208,120,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBody: {
    flex: 1,
    gap: 2,
  },
  upgradeTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  upgradeCopy: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  alertCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(172,132,255,0.35)',
    overflow: 'hidden',
    padding: SPACING.md,
    gap: 6,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  alertIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(172,132,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertKicker: {
    color: COLORS.iris,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  alertTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  alertBody: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  alertCta: {
    color: COLORS.starGold,
    fontSize: 12,
    fontFamily: FONTS.heading,
    marginTop: 4,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    ...TYPE.heading,
    fontFamily: FONTS.heading,
  },
  cardBody: {
    color: COLORS.textSecondary,
    ...TYPE.body,
    fontFamily: FONTS.body,
  },
  timingText: {
    color: COLORS.textPrimary,
    ...TYPE.subhead,
    fontFamily: FONTS.heading,
  },
  timingSupport: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
    fontFamily: FONTS.body,
  },
  timingSupportStrong: {
    color: COLORS.gold,
    fontFamily: FONTS.accentBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  transitSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  transitSummaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  transitSummaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.rule,
  },
  transitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transitSummaryCount: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.heading,
    lineHeight: 26,
  },
  transitSummaryLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  transitRow: {
    gap: 4,
    marginTop: SPACING.xs,
  },
  transitNature: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  transitAspect: {
    fontSize: 12,
    fontFamily: FONTS.accentBold,
    letterSpacing: 0.6,
  },
  transitBrief: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
    fontFamily: FONTS.body,
  },
  systemsHeader: {
    marginBottom: SPACING.sm,
  },
  systemList: {
    gap: SPACING.sm,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    backgroundColor: COLORS.glassBg,
  },
  systemBody: {
    flex: 1,
    gap: 2,
  },
  systemLabel: {
    color: COLORS.textPrimary,
    ...TYPE.subhead,
    fontFamily: FONTS.heading,
  },
  systemText: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
    fontFamily: FONTS.body,
  },
  actions: {
    gap: SPACING.md,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
  },
  quickLinkText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  bottomPad: {
    height: 20,
  },
});
