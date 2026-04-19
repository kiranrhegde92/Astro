import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { ExplainPanel } from '../../src/components/ui/ExplainPanel';
import { ForecastPanel } from '../../src/components/ui/ForecastPanel';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { LifeRoadmapPanel } from '../../src/components/ui/LifeRoadmapPanel';
import { PredictionFeedbackCard } from '../../src/components/ui/PredictionFeedbackCard';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { generatePeriodForecast, type ForecastWindow } from '../../src/content/forecastTemplates';
import { generateLifeRoadmap } from '../../src/content/lifeRoadmap';
import { getReadingExplainers } from '../../src/content/readingExplainers';
import { generateDailyReading } from '../../src/content/dailyTemplates';
import { buildForecastProfile } from '../../src/content/predictionSignals';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { showRewardedAd } from '../../src/services/rewardedAds';
import { useAdUnlockStore } from '../../src/store/adUnlockStore';
import { useUserStore } from '../../src/store/userStore';
import { useReadingStore } from '../../src/store/readingStore';
import { getCosmicDNASummary } from '../../src/engines/unified';
import { getDateKey } from '../../src/utils/dateUtils';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

const READING_VERSION = 5;

export default function UnifiedReadingScreen() {
  const router = useRouter();
  const accountUser = useUserStore((s) => s.user);
  const user = useActiveProfile();
  const getCachedReading = useReadingStore((s) => s.getCachedReading);
  const tokens = useAdUnlockStore((s) => s.tokens);
  const grantUnlock = useAdUnlockStore((s) => s.grantUnlock);
  const consumeUnlock = useAdUnlockStore((s) => s.consumeUnlock);
  const [forecastWindow, setForecastWindow] = useState<ForecastWindow>('month');
  const [activeSection, setActiveSection] = useState('summary');
  const [blendUnlocked, setBlendUnlocked] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();
  const forecastProfile = useMemo(() => (user ? buildForecastProfile(user) : null), [user]);
  const hasBlendUnlock = tokens.some((token) => token.feature === 'full_blended_reading' && !token.consumedAt);
  const canViewBlend = hasPremiumEntitlement(accountUser?.subscription) || blendUnlocked;

  if (!user || !forecastProfile?.western || !forecastProfile.vedic || !forecastProfile.chinese) return null;

  const handleUseBlendUnlock = async () => {
    const consumed = await consumeUnlock('full_blended_reading');
    if (consumed) setBlendUnlocked(true);
  };

  const handleWatchAd = async () => {
    if (adLoading) return;
    setAdLoading(true);
    try {
      const earned = await showRewardedAd('full_blended_reading');
      if (!earned) {
        showAlert('Ad not completed', 'The full reading was not unlocked. Try again when a rewarded ad is available.');
        return;
      }
      await grantUnlock('full_blended_reading');
      await consumeUnlock('full_blended_reading');
      setBlendUnlocked(true);
    } finally {
      setAdLoading(false);
    }
  };

  if (!canViewBlend) {
    return (
      <StarField>
        <ScreenHeader title="Daily Blend" accentColor={COLORS.starGold} />
        <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>Daily blend</Text>
          <Text style={styles.headline}>The deeper, blended reading.</Text>
          <Text style={styles.copy}>Unlock once with a rewarded ad — or go Premium for all blended readings.</Text>
          <GradientCard accentColor={COLORS.starGold}>
            <Text style={styles.cardTitle}>Unlock one full reading</Text>
            <Text style={styles.insightText}>
              Use a rewarded-ad unlock for this reading, or go Premium for all blended readings, forecasts, profiles, and alerts without ads.
            </Text>
            {hasBlendUnlock ? (
              <CosmicButton title="Use ad unlock" onPress={() => void handleUseBlendUnlock()} />
            ) : (
              <CosmicButton title={adLoading ? 'Loading ad' : 'Watch ad to unlock'} onPress={() => void handleWatchAd()} loading={adLoading} />
            )}
            <CosmicButton title="See Premium" onPress={() => router.push('/subscription')} variant="outline" />
          </GradientCard>
        </ResetScrollView>
        {alertModal}
      </StarField>
    );
  }

  const western = forecastProfile.western;
  const vedic = forecastProfile.vedic;
  const chinese = forecastProfile.chinese;
  const currentDashaPlanet = vedic.currentDasha?.planet ?? vedic.dashas[0]?.planet ?? 'Sun';
  const profile = useMemo(
    () => ({ western, vedic, chinese, kp: forecastProfile.kp }),
    [western, vedic, chinese, forecastProfile.kp],
  );
  const cosmicDNA = getCosmicDNASummary(profile);
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);
  const reading = useMemo(
    () => {
      const cached = getCachedReading(todayKey);
      if (cached?.unified?.shareText && cached.references?.length && (cached.version ?? 0) >= READING_VERSION) return cached;
      return generateDailyReading(today, profile);
    },
    [getCachedReading, profile, today, todayKey]
  );
  const forecast = useMemo(() => generatePeriodForecast(today, profile, forecastWindow), [forecastWindow, profile, today]);
  const birthDate = useMemo(() => {
    const raw = user?.birthDetails?.date;
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [user?.birthDetails?.date]);
  const roadmap = useMemo(() => generateLifeRoadmap(today, profile, birthDate), [birthDate, profile, today]);
  const explainItems = useMemo(() => getReadingExplainers(user, reading), [reading, user]);
  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'timing', label: 'Timing' },
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'explore', label: 'Explore' },
  ];

  const overallAlignment = Math.round((reading.positivityScore ?? 0.75) * 100);
  const activeTransits = reading.activeTransits ?? [];
  const supportCount = activeTransits.filter((t) => t.nature === 'support').length;
  const tensionCount = activeTransits.filter((t) => t.nature === 'tension').length;
  const neutralCount = activeTransits.filter((t) => t.nature === 'neutral').length;
  const topSupport = activeTransits.find((t) => t.nature === 'support');
  const topTension = activeTransits.find((t) => t.nature === 'tension');
  const toneKey = reading.unified.tone ?? (overallAlignment >= 72 ? 'Opening' : overallAlignment >= 55 ? 'Mixed' : 'Pressurized');
  const moonTransit = reading.transitPositions?.find((p) => p.planet === 'Moon');
  const retroPlanets = (reading.transitPositions ?? []).filter((p) => p.retrograde).map((p) => p.planet);
  const bestUseCopy = reading.unified.bestUse ?? reading.unified.focusAdvice ?? reading.unified.cosmicVibe;
  const watchForCopy = reading.unified.watchFor ?? topTension?.brief ?? 'No notable tensions — a steady day.';
  const timingCopy = reading.unified.timingNote
    ?? (topSupport ? topSupport.brief : moonTransit ? `Moon in ${moonTransit.sign} shapes today's emotional timing.` : 'Energy stays steady all day.');

  return (
    <StarField>
      <ScreenHeader title="Daily Blend" accentColor={COLORS.starGold} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Daily blend</Text>
        <Text style={styles.headline}>Four traditions, one honest read on today.</Text>
        <Text style={styles.copy}>
          Western chemistry, Vedic timing, Chinese wisdom, KP precision — folded together.
        </Text>
        <SectionTabs
          tabs={tabs}
          activeKey={activeSection}
          onChange={(key) => {
            Haptics.selectionAsync().catch(() => {});
            setActiveSection(key);
          }}
        />

        {activeSection === 'summary' && (
          <>
            <View style={styles.hero}>
              <LinearGradient
                colors={[
                  overallAlignment >= 85 ? '#f5c66a' : overallAlignment >= 70 ? '#9b91ff' : '#6f7ae0',
                  overallAlignment >= 85 ? '#ff7896' : overallAlignment >= 70 ? '#3ee0c8' : '#3ee0c8',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroHighlight} pointerEvents="none" />
              <View style={styles.heroRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroLabel}>Today's cosmic alignment</Text>
                  <Text style={styles.heroScore}>{overallAlignment}%</Text>
                  <Text style={styles.heroDNA}>{cosmicDNA}</Text>
                </View>
                <ProgressRing
                  progress={overallAlignment / 100}
                  size={104}
                  color="#fff"
                  value={`${overallAlignment}`}
                  label=""
                />
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroBreakdownRow}>
                <View style={styles.toneBadge}>
                  <Text style={styles.toneBadgeText}>{toneKey}</Text>
                </View>
                {moonTransit ? (
                  <Text style={styles.heroMoonText}>Moon in {moonTransit.sign}</Text>
                ) : null}
              </View>
              <View style={styles.transitCountsRow}>
                <TransitCount label="Support" count={supportCount} color="#d4ffe7" />
                <TransitCount label="Tension" count={tensionCount} color="#ffd8b8" />
                <TransitCount label="Neutral" count={neutralCount} color="#ffe5a8" />
              </View>
              {retroPlanets.length > 0 ? (
                <View style={styles.retroRow}>
                  <Text style={styles.retroLabel}>Retrograde</Text>
                  <View style={styles.retroChips}>
                    {retroPlanets.slice(0, 4).map((p) => (
                      <View key={p} style={styles.retroChip}>
                        <Text style={styles.retroChipText}>{p} ℞</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <GradientCard accentColor={COLORS.starGold}>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={18} color={COLORS.starGold} />
                <Text style={styles.cardTitle}>Cross-System Insight</Text>
              </View>
              <Text style={styles.insightText}>
                Your {western.sun} Sun energy combines beautifully with your {vedic.rashi} Rashi
                and {chinese.element} {chinese.animal} nature. This unique blend gives you:
              </Text>
              <View style={styles.blendList}>
                <BlendRow
                  accent={COLORS.western}
                  icon="flame"
                  text={`${western.element} element drive from the Western tradition — passion and initiative.`}
                />
                <BlendRow
                  accent={COLORS.vedic}
                  icon="compass"
                  text={`${vedic.nakshatra} Nakshatra sensitivity — deep intuition and spiritual awareness.`}
                />
                <BlendRow
                  accent={COLORS.chinese}
                  icon="leaf"
                  text={`${chinese.animal}'s ${chinese.yinYang} wisdom — ${chinese.yinYang === 'Yin' ? 'receptive strength and inner power' : 'dynamic energy and outward expression'}.`}
                />
              </View>
            </GradientCard>

            <View style={styles.vibeHero}>
              <LinearGradient
                colors={['#ffd572', '#ff9a8b', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroHighlight} pointerEvents="none" />
              <Text style={styles.vibeKicker}>Today's unified vibe</Text>
              <Text style={styles.vibeText}>{reading.unified.cosmicVibe}</Text>
              <View style={styles.affirmationBox}>
                <Text style={styles.affirmationLabel}>AFFIRMATION</Text>
                <Text style={styles.affirmationText}>"{reading.unified.affirmation}"</Text>
              </View>
            </View>
          </>
        )}

        {activeSection === 'timing' && (
          <>
            <GradientCard>
              <Text style={styles.cardTitle}>{'\u{23F0}'} Life Timing (Vedic + KP Combined)</Text>
              <Text style={styles.insightText}>
                Your current {currentDashaPlanet} Mahadasha period
                {forecastProfile.kp ? ', combined with KP sub-lord analysis,' : ''}
                suggests this is a powerful time for:
              </Text>
              <View style={styles.timingList}>
                <TimingItem label="Best for" value={bestUseCopy} accent={COLORS.starGold} />
                <TimingItem label="Energy flow" value={timingCopy} accent={COLORS.coral} />
                <TimingItem label="Watch for" value={watchForCopy} accent={COLORS.tide} />
              </View>
              <SourceRef text="Combined analysis from Brihat Parashara Hora Shastra & Krishnamurti Paddhati Reader" />
            </GradientCard>

            <ForecastPanel forecast={forecast} window={forecastWindow} onChange={setForecastWindow} />

            <ExplainPanel
              items={explainItems}
              intro="Open any lens below when you want to understand why that system is speaking so loudly right now."
            />
          </>
        )}

        {activeSection === 'roadmap' && roadmap && (
          <>
            <LifeRoadmapPanel roadmap={roadmap} />
            <PredictionFeedbackCard window="life" title="Rate the long-range AI roadmap" />
          </>
        )}

        {activeSection === 'explore' && (
          <>
            <GradientCard>
              <Text style={styles.cardTitle}>Explore Each System</Text>
              <View style={styles.deepDiveGrid}>
                <DeepDiveButton
                  emoji={'\u2648'}
                  label="Western"
                  color={COLORS.western}
                  onPress={() => router.push('/reading/western')}
                />
                <DeepDiveButton
                  emoji={'\u{1F549}\uFE0F'}
                  label="Vedic"
                  color={COLORS.vedic}
                  onPress={() => router.push('/reading/vedic')}
                />
                <DeepDiveButton
                  emoji={'\u{1F409}'}
                  label="Chinese"
                  color={COLORS.chinese}
                  onPress={() => router.push('/reading/chinese')}
                />
                <DeepDiveButton
                  emoji={'\u{1F52D}'}
                  label="KP"
                  color={COLORS.kp}
                  onPress={() => router.push('/reading/kp')}
                />
              </View>
            </GradientCard>

            <CosmicButton
              title="Share Unified Reading"
              onPress={() => router.push('/share/card')}
              colors={[COLORS.starGold, COLORS.sunOrange]}
            />
          </>
        )}

        <View style={styles.bottomPad} />
      </ResetScrollView>
      {alertModal}
    </StarField>
  );
}

function TransitCount({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={styles.transitCount}>
      <View style={[styles.transitDot, { backgroundColor: color }]} />
      <Text style={styles.transitCountNumber}>{count}</Text>
      <Text style={styles.transitCountLabel}>{label}</Text>
    </View>
  );
}

function BlendRow({ accent, icon, text }: { accent: string; icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.blendItem}>
      <View style={[styles.blendIconWrap, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <Text style={styles.blendText}>{text}</Text>
    </View>
  );
}

function TimingItem({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.timingItem}>
      <View style={[styles.timingAccent, { backgroundColor: accent }]} />
      <View style={styles.timingCopy}>
        <Text style={[styles.timingLabel, { color: accent }]}>{label}</Text>
        <Text style={styles.timingValue}>{value}</Text>
      </View>
    </View>
  );
}

function DeepDiveButton({ emoji, label, color, onPress }: { emoji: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.deepDiveBtn, { borderColor: `${color}88` }]}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={`Open ${label} reading deep-dive`}
    >
      <LinearGradient
        colors={[`${color}33`, `${color}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.deepDiveEmoji}>{emoji}</Text>
      <Text style={[styles.deepDiveLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SourceRef({ text }: { text: string }) {
  return (
    <View style={styles.sourceRef}>
      <Text style={styles.sourceRefText}>{'\u{1F4D6}'} {text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  kicker: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.1,
  },
  headline: {
    color: COLORS.textPrimary, fontSize: 30, lineHeight: 36,
    fontFamily: FONTS.display, letterSpacing: -0.6, marginTop: 4,
  },
  copy: {
    color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: SPACING.sm,
  },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.accent, letterSpacing: 1.4 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading, marginBottom: SPACING.sm },
  hero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: COLORS.starGold,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    gap: SPACING.md,
  },
  heroHighlight: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  heroCopy: { flex: 1, gap: 4 },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)', fontSize: 11,
    fontFamily: FONTS.accent, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  heroScore: {
    color: '#fff', fontSize: 48, lineHeight: 54,
    fontFamily: FONTS.display,
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 },
  },
  heroDNA: {
    color: '#fff8ea', fontSize: 13, lineHeight: 18, fontFamily: FONTS.heading, marginTop: 2,
  },
  heroDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginVertical: 2,
  },
  heroBreakdownRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  toneBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  toneBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  heroMoonText: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 0.4 },
  transitCountsRow: { flexDirection: 'row', gap: SPACING.sm },
  transitCount: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  transitDot: { width: 8, height: 8, borderRadius: 4 },
  transitCountNumber: { color: '#fff', fontSize: 16, fontWeight: '700' },
  transitCountLabel: {
    color: 'rgba(255,255,255,0.82)', fontSize: 10,
    fontFamily: FONTS.accent, letterSpacing: 0.6, textTransform: 'uppercase',
  },
  retroRow: { gap: 6 },
  retroLabel: {
    color: 'rgba(255,255,255,0.78)', fontSize: 10,
    fontFamily: FONTS.accent, letterSpacing: 1, textTransform: 'uppercase',
  },
  retroChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  retroChip: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  retroChipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  insightText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  blendList: { gap: SPACING.sm, marginTop: SPACING.md },
  blendItem: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  blendIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  blendText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 19, flex: 1 },
  vibeHero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#c084fc',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    gap: SPACING.sm,
  },
  vibeKicker: {
    color: 'rgba(27,20,48,0.78)', fontSize: 11,
    fontFamily: FONTS.accent, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  vibeText: { color: '#1b1430', fontSize: 18, fontWeight: '600', lineHeight: 26 },
  affirmationBox: {
    backgroundColor: 'rgba(10,11,31,0.14)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginTop: 4, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  affirmationLabel: { color: '#1b1430', fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: 4 },
  affirmationText: { color: '#1b1430', fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  timingList: { gap: SPACING.sm, marginTop: SPACING.md },
  timingItem: {
    flexDirection: 'row', alignItems: 'stretch', gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  timingAccent: { width: 3, borderRadius: 2 },
  timingCopy: { flex: 1, gap: 2 },
  timingLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  timingValue: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 18 },
  deepDiveGrid: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  deepDiveBtn: {
    flex: 1, minWidth: '22%', alignItems: 'center', borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    minHeight: 80,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deepDiveEmoji: { fontSize: 26 },
  deepDiveLabel: { fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 0.3 },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.glassBorder,
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bottomPad: { height: 20 },
});
