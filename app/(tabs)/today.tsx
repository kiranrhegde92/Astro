import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { DailyReading } from '../../src/types/astrology';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { generatePeriodForecast, type ForecastWindow } from '../../src/content/forecastTemplates';
import { ForecastPanel } from '../../src/components/ui/ForecastPanel';
import { PredictionFeedbackCard } from '../../src/components/ui/PredictionFeedbackCard';
import { buildForecastProfile } from '../../src/content/predictionSignals';
import { fetchDailyReading } from '../../src/services/functionsService';
import { showRewardedAd } from '../../src/services/rewardedAds';
import { speakReading, stopReadingAudio } from '../../src/services/ttsService';
import { scheduleHighImpactTransitAlert, cancelTransitAlerts } from '../../src/utils/notifications';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { useAdUnlockStore } from '../../src/store/adUnlockStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { getDateKey } from '../../src/utils/dateUtils';
import { normalizeUserProfile } from '../../src/utils/normalizeUserProfile';
import { normalizeLanguage } from '../../src/i18n/language';
import { getMoonPhase } from '../../src/utils/moonPhase';
import {
  formatSignature,
  formatSkyChip,
  getGreetingLabel,
  getSpokenTodayCopy,
  getSystemPreviewCopy,
  getTodayShellCopy,
} from '../../src/i18n/spokenContent';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

const READING_VERSION = 5;

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

function getToneFallback(supportCount: number, tensionCount: number): 'Opening' | 'Mixed' | 'Pressurized' {
  if (supportCount >= tensionCount + 2) return 'Opening';
  if (tensionCount > supportCount) return 'Pressurized';
  return 'Mixed';
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

function SkyChip({ position, language }: { position: TransitPosition; language: string }) {
  return (
    <View style={styles.skyChip}>
      <Text style={styles.skyChipText}>{formatSkyChip(position, language)}</Text>
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
  const { i18n, t } = useTranslation();
  const accountUser = useUserStore((state) => state.user);
  const user = useActiveProfile();
  const transitAlertsEnabled = useSettingsStore((state) => state.transitAlertsEnabled);
  const hasSeenTutorial = useSettingsStore((state) => state.hasSeenTutorial);
  const incrementStreak = useUserStore((state) => state.incrementStreak);
  const tokens = useAdUnlockStore((state) => state.tokens);
  const grantUnlock = useAdUnlockStore((state) => state.grantUnlock);
  const consumeUnlock = useAdUnlockStore((state) => state.consumeUnlock);
  const todayReading = useReadingStore((state) => state.todayReading);
  const getCachedReading = useReadingStore((state) => state.getCachedReading);
  const setTodayReading = useReadingStore((state) => state.setTodayReading);
  const [retryKey, setRetryKey] = useState(0);
  const [activeSection, setActiveSection] = useState('brief');
  const [forecastWindow, setForecastWindow] = useState<ForecastWindow>('week');
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [forecastAdLoading, setForecastAdLoading] = useState(false);
  const [forecastUnlocked, setForecastUnlocked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();
  const today = useMemo(() => new Date(), []);
  const language = normalizeLanguage(user?.language ?? i18n.language);
  const shellCopy = useMemo(() => getTodayShellCopy(language), [language]);
  const todayKey = getDateKey(today);
  const safeUser = useMemo(() => (user ? normalizeUserProfile(user) : null), [user]);
  const forecastProfile = useMemo(() => (safeUser ? buildForecastProfile(safeUser) : null), [safeUser]);
  const isManagedProfile = Boolean(user?.isManagedProfile);
  const isPremium = hasPremiumEntitlement(accountUser?.subscription);
  const hasForecastUnlock = tokens.some((token) => token.feature === 'period_forecast' && !token.consumedAt);
  const canViewForecast = isPremium || forecastUnlocked || hasForecastUnlock;
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

  // Show retry if the reading fetch does not settle quickly.
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
        if (cancelled) return;
        try {
          const generated = generateDailyReading(today, forecastProfile);
          setTodayReading(generated);
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
    let cancelled = false;

    if (!reading || !accountUser || !isPremium || !transitAlertsEnabled) {
      cancelTransitAlerts().catch(() => {});
      return () => {
        cancelled = true;
      };
    }

    scheduleHighImpactTransitAlert(reading, accountUser)
      .catch(() => {
        if (!cancelled) {
          // ignore scheduling errors to avoid blocking the reading UI
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accountUser, isPremium, reading, transitAlertsEnabled]);

  useEffect(() => {
    return () => {
      stopReadingAudio().catch(() => {});
    };
  }, []);

  const periodForecast = useMemo(() => {
    if (!profile) return null;
    return generatePeriodForecast(today, profile, forecastWindow);
  }, [profile, today, forecastWindow]);

  const handleUseForecastUnlock = useCallback(async () => {
    const consumed = await consumeUnlock('period_forecast');
    if (consumed) setForecastUnlocked(true);
  }, [consumeUnlock]);

  const handleWatchForecastAd = useCallback(async () => {
    if (forecastAdLoading) return;
    setForecastAdLoading(true);
    try {
      const earned = await showRewardedAd('period_forecast');
      if (!earned) {
        showAlert('Ad not completed', 'The forecast was not unlocked. Try again when a rewarded ad is available.');
        return;
      }
      await grantUnlock('period_forecast');
      await consumeUnlock('period_forecast');
      setForecastUnlocked(true);
    } finally {
      setForecastAdLoading(false);
    }
  }, [consumeUnlock, forecastAdLoading, grantUnlock, showAlert]);

  const greeting = useMemo(() => getGreetingLabel(today, language), [language, today]);
  const moonPhase = useMemo(() => getMoonPhase(today), [today]);
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
  if (!user || !reading) {
    return (
      <StarField>
        <View style={styles.emptyWrap}>
          <CosmicOrb size={176} />
          <Text style={styles.emptyTitle}>{shellCopy.loadingTitle}</Text>
          <Text style={styles.emptyCopy}>{shellCopy.loadingCopy}</Text>
          {loadingTimedOut && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setLoadingTimedOut(false); setRetryKey((v) => v + 1); }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={COLORS.tide} />
              <Text style={styles.retryText}>{shellCopy.retry}</Text>
            </TouchableOpacity>
          )}
        </View>
      </StarField>
    );
  }

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

    const started = await speakReading({
      headline,
      heroBody,
      bestUse,
      watchFor,
      affirmation: reading?.unified?.affirmation,
    });

    if (!started) {
      showAlert('Audio unavailable', 'Spoken playback is available in the native app once expo-speech is installed in the build.');
      return;
    }

    setIsSpeaking(true);
  };
  const skyPreview = positions
    .filter((position) => ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(position.planet))
    .slice(0, 6);

  const systems = [
    user.activeSystems.includes('western') && reading.western
      ? { key: 'western', label: t('systems.western'), route: '/reading/western', text: getSystemPreviewCopy('western', language, reading.western.overall), accent: COLORS.western, icon: 'sunny', secondary: '#ece6ff' }
      : null,
    user.activeSystems.includes('vedic') && reading.vedic
      ? { key: 'vedic', label: t('systems.vedic'), route: '/reading/vedic', text: getSystemPreviewCopy('vedic', language, reading.vedic.dasha), accent: COLORS.vedic, icon: 'moon', secondary: '#ffe6d8' }
      : null,
    user.activeSystems.includes('chinese') && reading.chinese
      ? { key: 'chinese', label: t('systems.chinese'), route: '/reading/chinese', text: getSystemPreviewCopy('chinese', language, reading.chinese.element), accent: COLORS.chinese, icon: 'leaf', secondary: '#ffe7db' }
      : null,
    user.activeSystems.includes('kp') && reading.kp
      ? { key: 'kp', label: t('systems.kp'), route: '/reading/kp', text: getSystemPreviewCopy('kp', language, reading.kp.eventTiming), accent: COLORS.kp, icon: 'sparkles', secondary: '#e1f5ef' }
      : null,
  ].filter(Boolean) as SystemPreview[];

  const tabs = [
    { key: 'brief', label: todayCopy.tabs.brief },
    { key: 'proof', label: todayCopy.tabs.proof },
    { key: 'forecast', label: todayCopy.tabs.forecast },
    { key: 'systems', label: todayCopy.tabs.systems },
  ];

  return (
    <StarField>
      <ResetScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.tide}
            colors={[COLORS.tide]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.datePremiumRow}>
            <Text style={styles.dateLabel}>
              {today.toLocaleDateString(todayCopy.dateLocale, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={11} color={COLORS.starGold} />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.greetingText}>{greeting}, {firstName}</Text>
          <Text style={styles.headerCopy}>{todayCopy.headerCopy}</Text>
        </View>

        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'brief' && (
          <>
            <AnimatedCard index={0}>
              <LinearGradient colors={heroGradient} style={[styles.hero, isPremium && styles.heroPremium]}>
                <View style={styles.heroTopRow}>
                  <View style={[styles.heroBadge, isPremium && styles.heroBadgePremium]}>
                    {isPremium ? <Ionicons name="star" size={10} color={COLORS.starGold} style={{ marginRight: 4 }} /> : null}
                    <Text style={[styles.heroBadgeText, isPremium && styles.heroBadgeTextPremium]}>{todayCopy.heroBadge}</Text>
                  </View>
                  <View style={styles.heroActionsRow}>
                    <TouchableOpacity style={styles.heroAudioButton} onPress={() => void handleToggleAudio()} activeOpacity={0.84}>
                      <Ionicons name={isSpeaking ? 'pause-circle-outline' : 'volume-high-outline'} size={16} color="#fffaf1" />
                      <Text style={styles.heroAudioText}>{isSpeaking ? 'Stop audio' : 'Play audio'}</Text>
                    </TouchableOpacity>
                    <View style={[styles.scorePill, { borderColor: `${toneAccent}55`, backgroundColor: `${toneAccent}22` }]}>
                      <Text style={[styles.scoreText, { color: toneAccent }]}>{todayCopy.alignedText}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.heroHeadline}>{headline}</Text>
                <Text style={styles.heroBody}>{heroBody}</Text>
                <Text style={styles.heroEvidence}>{evidenceLine}</Text>

                <View style={styles.metricRow}>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>{todayCopy.tone}</Text>
                    <Text style={styles.metricValue}>{todayCopy.toneLabel}</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>{todayCopy.focus}</Text>
                    <Text style={styles.metricValue}>{focusArea}</Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Text style={styles.metricLabel}>{todayCopy.liveSignals}</Text>
                    <Text style={styles.metricValue}>{transits.length}</Text>
                  </View>
                </View>

                <View style={styles.signatureRow}>
                  {[
                    formatSignature(profile?.western?.sun, 'sun', language),
                    formatSignature(profile?.vedic?.rashi, 'rashi', language),
                    formatSignature(profile?.chinese?.animal, 'year', language),
                  ].filter(Boolean).map((item) => (
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
                  <Text style={styles.cardEyebrow}>{todayCopy.leanInto}</Text>
                  <Text style={styles.cardTitle}>{focusArea}</Text>
                  <Text style={styles.cardBody}>{bestUse}</Text>
                </GradientCard>

                <GradientCard accentColor={COLORS.coral} style={styles.duoCard}>
                  <Text style={styles.cardEyebrow}>{todayCopy.watchFor}</Text>
                  <Text style={styles.cardTitle}>{todayCopy.watchForTitle}</Text>
                  <Text style={styles.cardBody}>{watchFor}</Text>
                </GradientCard>
              </View>
            </AnimatedCard>

            <AnimatedCard index={2}>
              <GradientCard accentColor={COLORS.gold}>
                <Text style={styles.cardEyebrow}>{todayCopy.timingNote}</Text>
                <Text style={styles.timingText}>{timingNote}</Text>
                {remedyText ? <Text style={styles.timingSupport}>{todayCopy.remedyPrefix}: {remedyText}</Text> : null}
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={3}>
              <GradientCard accentColor={COLORS.gold}>
                <Text style={styles.cardEyebrow}>MOON PHASE</Text>
                <Text style={styles.cardTitle}>{moonPhase.emoji} {moonPhase.label}</Text>
                <Text style={styles.cardBody}>
                  {moonPhase.ritual}
                </Text>
                <Text style={styles.cardSupport}>Illumination {Math.round(moonPhase.illumination * 100)}% · Moon age {moonPhase.ageDays} days</Text>
                <View style={styles.actions}>
                  <CosmicButton title="Open moon calendar" onPress={() => router.push('/moon-calendar')} />
                </View>
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={4}>
              <GradientCard accentColor={COLORS.coral}>
                <Text style={styles.cardEyebrow}>RETROGRADE WATCH</Text>
                <Text style={styles.cardTitle}>Check which planets are currently retrograde.</Text>
                <Text style={styles.cardBody}>
                  Use the tracker to see which live transit positions may feel slower, more reflective, or more revision-heavy today.
                </Text>
                <View style={styles.actions}>
                  <CosmicButton title="Open retrogrades" onPress={() => router.push('/retrograde')} />
                </View>
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={5}>
              <GradientCard accentColor={COLORS.kp}>
                <Text style={styles.cardEyebrow}>LIVE TRANSITS</Text>
                <View style={styles.transitSummaryRow}>
                  <View style={styles.transitSummaryItem}>
                    <View style={[styles.transitDot, { backgroundColor: COLORS.tide }]} />
                    <Text style={styles.transitSummaryCount}>{supportCount}</Text>
                    <Text style={styles.transitSummaryLabel}>Support</Text>
                  </View>
                  <View style={styles.transitSummaryDivider} />
                  <View style={styles.transitSummaryItem}>
                    <View style={[styles.transitDot, { backgroundColor: COLORS.coral }]} />
                    <Text style={styles.transitSummaryCount}>{tensionCount}</Text>
                    <Text style={styles.transitSummaryLabel}>Tension</Text>
                  </View>
                  <View style={styles.transitSummaryDivider} />
                  <View style={styles.transitSummaryItem}>
                    <View style={[styles.transitDot, { backgroundColor: COLORS.textSecondary }]} />
                    <Text style={styles.transitSummaryCount}>{transits.length - supportCount - tensionCount}</Text>
                    <Text style={styles.transitSummaryLabel}>Neutral</Text>
                  </View>
                </View>
                {transits.slice(0, 3).map((transit, i) => (
                  <View key={`${transit.transitPlanet}-${transit.natalPlanet}-${i}`} style={styles.transitRow}>
                    <View style={[styles.transitNature, {
                      backgroundColor: transit.nature === 'support'
                        ? `${COLORS.tide}22`
                        : transit.nature === 'tension'
                        ? `${COLORS.coral}22`
                        : 'rgba(255,255,255,0.06)',
                    }]}>
                      <Text style={[styles.transitAspect, {
                        color: transit.nature === 'support'
                          ? COLORS.tide
                          : transit.nature === 'tension'
                          ? COLORS.coral
                          : COLORS.textSecondary,
                      }]}>
                        {transit.transitPlanet} {transit.aspect} {transit.natalPlanet}
                      </Text>
                    </View>
                    <Text style={styles.transitBrief} numberOfLines={2}>{transit.brief}</Text>
                  </View>
                ))}
                {transits.length === 0 && (
                  <Text style={styles.cardBody}>No major transits active right now. A quiet sky today.</Text>
                )}
                <View style={styles.actions}>
                  <CosmicButton title="View all transits" onPress={() => router.push('/reading/transits')} />
                </View>
              </GradientCard>
            </AnimatedCard>

            <AnimatedCard index={6}>
              <View style={styles.actions}>
                {user.activeSystems.length >= 2 ? (
                  <CosmicButton title={todayCopy.openFull} onPress={() => router.push('/reading/unified')} />
                ) : null}
                <CosmicButton title={todayCopy.shareReading} onPress={() => router.push('/share/card')} variant="outline" />
              </View>
            </AnimatedCard>
          </>
        )}

        {activeSection === 'proof' && (
          <>
            <AnimatedCard index={0}>
              <GradientCard accentColor={COLORS.iris}>
                <Text style={styles.cardEyebrow}>{todayCopy.why}</Text>
                <Text style={styles.proofLead}>{todayCopy.proofLead}</Text>
                <View style={styles.proofList}>
                  <ProofRow
                    icon="pulse-outline"
                    label={todayCopy.mainDriver}
                    text={todayCopy.mainDriverText}
                    color={COLORS.tide}
                  />
                  <ProofRow
                    icon="alert-circle-outline"
                    label={todayCopy.pressureLine}
                    text={todayCopy.pressureText}
                    color={COLORS.coral}
                  />
                  <ProofRow
                    icon="time-outline"
                    label={todayCopy.timingLayer}
                    text={timingNote}
                    color={COLORS.gold}
                  />
                </View>
              </GradientCard>
            </AnimatedCard>

            {skyPreview.length > 0 && (
              <AnimatedCard index={1}>
                <GradientCard accentColor={COLORS.tide}>
                  <Text style={styles.cardEyebrow}>{todayCopy.skyNow}</Text>
                  <Text style={styles.skyIntro}>{todayCopy.skyIntro}</Text>
                  <View style={styles.skyWrap}>
                    {skyPreview.map((position) => (
                      <SkyChip key={`${position.planet}-${position.sign}`} position={position} language={language} />
                    ))}
                  </View>
                </GradientCard>
              </AnimatedCard>
            )}
          </>
        )}

        {activeSection === 'forecast' && periodForecast && (
          <>
            <AnimatedCard index={0}>
              {canViewForecast ? (
                <ForecastPanel
                  forecast={periodForecast}
                  window={forecastWindow}
                  onChange={setForecastWindow}
                  language={language}
                />
              ) : (
                <GradientCard accentColor={COLORS.starGold}>
                  <Text style={styles.cardEyebrow}>PREMIUM FORECAST</Text>
                  <Text style={styles.cardTitle}>The longer view is a premium reading.</Text>
                  <Text style={styles.cardBody}>
                    Watch one rewarded ad for this forecast, or go Premium for weekly and monthly forecasts without ads.
                  </Text>
                  <View style={styles.actions}>
                    {hasForecastUnlock ? (
                      <CosmicButton title="Use ad unlock" onPress={() => void handleUseForecastUnlock()} />
                    ) : (
                      <CosmicButton
                        title={forecastAdLoading ? 'Loading ad' : 'Watch ad to unlock'}
                        onPress={() => void handleWatchForecastAd()}
                        loading={forecastAdLoading}
                      />
                    )}
                    <CosmicButton title="See Premium" onPress={() => router.push('/subscription')} variant="outline" />
                  </View>
                </GradientCard>
              )}
            </AnimatedCard>

            <AnimatedCard index={1}>
              <PredictionFeedbackCard window="week" title="Did the short-term model resonate?" />
            </AnimatedCard>
          </>
        )}

        {activeSection === 'systems' && (
          <>
            <AnimatedCard index={0}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{todayCopy.bySystem}</Text>
                <Text style={styles.sectionCopy}>{todayCopy.bySystemCopy}</Text>
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
      {alertModal}
      <TutorialOverlay visible={!hasSeenTutorial && !!reading} />
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
  datePremiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.starGold}55`,
    backgroundColor: `${COLORS.starGold}18`,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumBadgeText: {
    color: COLORS.starGold,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
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
  heroPremium: {
    borderWidth: 1,
    borderColor: `${COLORS.starGold}40`,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroBadgePremium: {
    backgroundColor: `${COLORS.starGold}20`,
    borderColor: `${COLORS.starGold}44`,
  },
  heroBadgeText: {
    color: '#fffaf1',
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  heroBadgeTextPremium: {
    color: COLORS.starGold,
  },
  heroAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroAudioText: {
    color: '#fffaf1',
    fontSize: 11,
    fontFamily: FONTS.heading,
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
  cardSupport: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.tide}44`,
    backgroundColor: `${COLORS.tide}10`,
  },
  retryText: {
    color: COLORS.tide,
    fontSize: 15,
    fontFamily: FONTS.heading,
  },
  bottomPad: {
    height: 40,
  },
  transitSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  transitSummaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  transitSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  transitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transitSummaryCount: {
    color: '#fffaf1',
    fontSize: 22,
    fontFamily: FONTS.heading,
    lineHeight: 26,
  },
  transitSummaryLabel: {
    color: 'rgba(255,250,241,0.50)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.5,
  },
  transitRow: {
    gap: 4,
    marginBottom: SPACING.sm,
  },
  transitNature: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  transitAspect: {
    fontSize: 12,
    fontFamily: FONTS.heading,
    letterSpacing: 0.3,
  },
  transitBrief: {
    color: 'rgba(255,250,241,0.68)',
    fontSize: 13,
    fontFamily: FONTS.body,
    lineHeight: 19,
  },
});
