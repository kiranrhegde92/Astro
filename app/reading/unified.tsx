import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { getCosmicDNASummary } from '../../src/engines/unified';
import { getDailyOpener, getDailyAffirmation } from '../../src/content/positiveFraming';

export default function UnifiedReadingScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user?.western || !user?.vedic || !user?.chinese) return null;

  const profile = { western: user.western, vedic: user.vedic, chinese: user.chinese, kp: user.kp };
  const cosmicDNA = getCosmicDNASummary(profile);
  const today = new Date();

  // Calculate a "cosmic alignment" score from combined system data
  const westernScore = 78 + (today.getDate() % 15);
  const vedicScore = 72 + ((today.getDate() + 3) % 18);
  const chineseScore = 75 + ((today.getDate() + 7) % 16);
  const overallAlignment = Math.round((westernScore + vedicScore + chineseScore) / 3);

  return (
    <StarField>
      <ScreenHeader title="Unified Reading" accentColor={COLORS.starGold} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerEmoji}>{'\u{1F30C}'}</Text>
        <Text style={styles.subtitle}>
          All 4 systems aligned into one cosmic insight
        </Text>

        {/* Cosmic DNA Summary */}
        <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
          <Text style={styles.sectionLabel}>YOUR COSMIC DNA</Text>
          <Text style={styles.dnaValue}>{cosmicDNA}</Text>
          <Text style={styles.dnaSubtext}>
            No one else in the world has your exact combination across 4 ancient traditions
          </Text>
        </GradientCard>

        {/* Alignment Scores */}
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

        {/* Cross-System Insight */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{2728}'} Cross-System Insight</Text>
          <Text style={styles.insightText}>
            Your {user.western.sun} Sun energy combines beautifully with your {user.vedic.rashi} Rashi
            and {user.chinese.element} {user.chinese.animal} nature. This unique blend gives you:
          </Text>
          <View style={styles.blendList}>
            <BlendItem
              emoji={'\u{1F525}'}
              text={`${user.western.element} element drive from the Western tradition - passion and initiative`}
            />
            <BlendItem
              emoji={'\u{1F549}\uFE0F'}
              text={`${user.vedic.nakshatra} Nakshatra sensitivity - deep intuition and spiritual awareness`}
            />
            <BlendItem
              emoji={'\u{1F409}'}
              text={`${user.chinese.animal}'s ${user.chinese.yinYang} wisdom - ${user.chinese.yinYang === 'Yin' ? 'receptive strength and inner power' : 'dynamic energy and outward expression'}`}
            />
          </View>
        </GradientCard>

        {/* Today's Unified Vibe */}
        <GradientCard colors={['#7b2fbe', '#00d2ff'] as readonly string[]}>
          <Text style={styles.cardTitle}>Today's Unified Cosmic Vibe</Text>
          <Text style={styles.vibeText}>{getDailyOpener(today)}</Text>
          <View style={styles.affirmationBox}>
            <Text style={styles.affirmationLabel}>TODAY'S AFFIRMATION</Text>
            <Text style={styles.affirmationText}>"{getDailyAffirmation(today)}"</Text>
          </View>
        </GradientCard>

        {/* Timing Insight */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{23F0}'} Life Timing (Vedic + KP Combined)</Text>
          <Text style={styles.insightText}>
            Your current {user.vedic.currentDasha.planet} Mahadasha period
            {user.kp ? ', combined with KP sub-lord analysis,' : ''}
            suggests this is a powerful time for:
          </Text>
          <View style={styles.timingList}>
            <TimingItem label="Best for" value="Creative projects, relationship building, spiritual growth" />
            <TimingItem label="Energy peak" value="Morning hours align with your cosmic rhythm" />
            <TimingItem label="Growth area" value="Trust your intuition - it's cosmically amplified right now" />
          </View>
          <SourceRef text="Combined analysis from Brihat Parashara Hora Shastra & Krishnamurti Paddhati Reader" />
        </GradientCard>

        {/* Deep Dive Links */}
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

        {/* Share */}
        <CosmicButton
          title="Share Unified Reading"
          onPress={() => router.push('/share/card')}
          colors={[COLORS.starGold, COLORS.sunOrange]}
        />

        <View style={styles.bottomPad} />
      </ScrollView>
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
  sectionLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  dnaValue: { color: COLORS.starGold, fontSize: 20, fontWeight: '800', marginTop: 4 },
  dnaSubtext: { color: COLORS.textSecondary, fontSize: 13, marginTop: SPACING.xs },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  alignmentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  systemScores: { flex: 1, gap: SPACING.sm },
  alignBar: {},
  alignLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  alignLabel: { color: COLORS.textSecondary, fontSize: 12 },
  alignScore: { fontSize: 12, fontWeight: '700' },
  alignBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  alignBarFill: { height: '100%', borderRadius: 3 },
  insightText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  blendList: { gap: SPACING.sm, marginTop: SPACING.md },
  blendItem: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  blendEmoji: { fontSize: 20 },
  blendText: { color: COLORS.white, fontSize: 13, lineHeight: 19, flex: 1 },
  vibeText: { color: COLORS.white, fontSize: 17, fontWeight: '600', lineHeight: 25 },
  affirmationBox: {
    backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md, alignItems: 'center',
  },
  affirmationLabel: { color: COLORS.starGold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  affirmationText: { color: COLORS.starGold, fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  timingList: { gap: SPACING.sm, marginTop: SPACING.md },
  timingItem: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm,
  },
  timingLabel: { color: COLORS.starGold, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  timingValue: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  deepDiveGrid: { flexDirection: 'row', gap: SPACING.sm },
  deepDiveBtn: {
    flex: 1, alignItems: 'center', borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  deepDiveEmoji: { fontSize: 28 },
  deepDiveLabel: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bottomPad: { height: 20 },
});
