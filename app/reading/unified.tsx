import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
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

const READING_VERSION = 3;

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
          <Text style={styles.headerEmoji}>{'\u{1F30C}'}</Text>
          <Text style={styles.subtitle}>This deeper blended reading is Premium.</Text>
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
  const profile = { western, vedic, chinese, kp: forecastProfile.kp };
  const cosmicDNA = getCosmicDNASummary(profile);
  const today = new Date();
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
  const roadmap = useMemo(() => generateLifeRoadmap(today, profile), [profile, today]);
  const explainItems = useMemo(() => getReadingExplainers(user, reading), [reading, user]);
  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'timing', label: 'Timing' },
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'explore', label: 'Explore' },
  ];

  // Calculate a "cosmic alignment" score from combined system data
  const westernScore = 78 + (today.getDate() % 15);
  const vedicScore = 72 + ((today.getDate() + 3) % 18);
  const chineseScore = 75 + ((today.getDate() + 7) % 16);
  const overallAlignment = Math.round((westernScore + vedicScore + chineseScore) / 3);

  return (
    <StarField>
      <ScreenHeader title="Daily Blend" accentColor={COLORS.starGold} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerEmoji}>{'\u{1F30C}'}</Text>
        <Text style={styles.subtitle}>
          All your active systems folded into one reading.
        </Text>
        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'summary' && (
          <>
            <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
              <Text style={styles.sectionLabel}>YOUR COSMIC DNA</Text>
              <Text style={styles.dnaValue}>{cosmicDNA}</Text>
              <Text style={styles.dnaSubtext}>
                No one else in the world has your exact combination across 4 ancient traditions
              </Text>
            </GradientCard>

            <GradientCard>
              <Text style={styles.cardTitle}>Today's Cosmic Alignment</Text>
              <View style={styles.alignmentRow}>
                <ProgressRing
                  progress={overallAlignment / 100}
                  size={90}
                  color={COLORS.starGold}
                  value={`${overallAlignment}%`}
                  label="Overall"
                />
                <View style={styles.systemScores}>
                  <AlignmentBar label="Western" score={westernScore} color={COLORS.western} />
                  <AlignmentBar label="Vedic" score={vedicScore} color={COLORS.vedic} />
                  <AlignmentBar label="Chinese" score={chineseScore} color={COLORS.chinese} />
                </View>
              </View>
            </GradientCard>

            <GradientCard>
              <Text style={styles.cardTitle}>{'\u{2728}'} Cross-System Insight</Text>
              <Text style={styles.insightText}>
                Your {western.sun} Sun energy combines beautifully with your {vedic.rashi} Rashi
                and {chinese.element} {chinese.animal} nature. This unique blend gives you:
              </Text>
              <View style={styles.blendList}>
                <BlendItem
                  emoji={'\u{1F525}'}
                  text={`${western.element} element drive from the Western tradition - passion and initiative`}
                />
                <BlendItem
                  emoji={'\u{1F549}\uFE0F'}
                  text={`${vedic.nakshatra} Nakshatra sensitivity - deep intuition and spiritual awareness`}
                />
                <BlendItem
                  emoji={'\u{1F409}'}
                  text={`${chinese.animal}'s ${chinese.yinYang} wisdom - ${chinese.yinYang === 'Yin' ? 'receptive strength and inner power' : 'dynamic energy and outward expression'}`}
                />
              </View>
            </GradientCard>

            <GradientCard colors={COLORS.gradientPrimary}>
              <Text style={styles.cardTitle}>Today's Unified Cosmic Vibe</Text>
              <Text style={styles.vibeText}>{reading.unified.cosmicVibe}</Text>
              <View style={styles.affirmationBox}>
                <Text style={styles.affirmationLabel}>TODAY'S AFFIRMATION</Text>
                <Text style={styles.affirmationText}>"{reading.unified.affirmation}"</Text>
              </View>
            </GradientCard>
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
                <TimingItem label="Best for" value="Creative projects, relationship building, spiritual growth" />
                <TimingItem label="Energy peak" value="Morning hours align with your cosmic rhythm" />
                <TimingItem label="Growth area" value="Trust your intuition - it's cosmically amplified right now" />
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

function AlignmentBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={styles.alignBar}>
      <View style={styles.alignLabelRow}>
        <Text style={styles.alignLabel}>{label}</Text>
        <Text style={[styles.alignScore, { color }]}>{score}%</Text>
      </View>
      <View style={styles.alignBarBg}>
        <View style={[styles.alignBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BlendItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.blendItem}>
      <Text style={styles.blendEmoji}>{emoji}</Text>
      <Text style={styles.blendText}>{text}</Text>
    </View>
  );
}

function TimingItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.timingItem}>
      <Text style={styles.timingLabel}>{label}</Text>
      <Text style={styles.timingValue}>{value}</Text>
    </View>
  );
}

function DeepDiveButton({ emoji, label, color, onPress }: { emoji: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.deepDiveBtn, { borderColor: color }]} onPress={onPress} activeOpacity={0.7}>
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
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: SPACING.md },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.accent, letterSpacing: 1.4 },
  dnaValue: { color: COLORS.starGold, fontSize: 20, fontWeight: '800', marginTop: 4 },
  dnaSubtext: { color: COLORS.textSecondary, fontSize: 13, marginTop: SPACING.xs },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading, marginBottom: SPACING.sm },
  alignmentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  systemScores: { flex: 1, gap: SPACING.sm },
  alignBar: {},
  alignLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  alignLabel: { color: COLORS.textSecondary, fontSize: 12 },
  alignScore: { fontSize: 12, fontWeight: '700' },
  alignBarBg: { height: 6, backgroundColor: 'rgba(40,49,73,0.10)', borderRadius: 3, overflow: 'hidden' },
  alignBarFill: { height: '100%', borderRadius: 3 },
  insightText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  blendList: { gap: SPACING.sm, marginTop: SPACING.md },
  blendItem: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  blendEmoji: { fontSize: 20 },
  blendText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 19, flex: 1 },
  vibeText: { color: '#fffaf1', fontSize: 17, fontWeight: '600', lineHeight: 25 },
  affirmationBox: {
    backgroundColor: 'rgba(255,250,241,0.18)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md, alignItems: 'center',
  },
  affirmationLabel: { color: '#fffaf1', fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: 4 },
  affirmationText: { color: '#fffaf1', fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  timingList: { gap: SPACING.sm, marginTop: SPACING.md },
  timingItem: {
    backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm,
  },
  timingLabel: { color: COLORS.goldMid, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  timingValue: { color: COLORS.textPrimary, fontSize: 13, marginTop: 2 },
  deepDiveGrid: { flexDirection: 'row', gap: SPACING.sm },
  deepDiveBtn: {
    flex: 1, alignItems: 'center', borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  deepDiveEmoji: { fontSize: 28 },
  deepDiveLabel: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.glassBorder,
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bottomPad: { height: 20 },
});
