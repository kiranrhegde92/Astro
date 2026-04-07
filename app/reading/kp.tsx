import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';

const AREA_EMOJIS: Record<string, string> = {
  career: '\u{1F4BC}', love: '\u{1F496}', health: '\u{1F49A}',
  wealth: '\u{1F4B0}', education: '\u{1F4DA}', travel: '\u{2708}\uFE0F',
};

export default function KPReadingScreen() {
  const user = useUserStore((s) => s.user);

  if (!user?.kp) return null;

  const { cusps, significators, predictions } = user.kp;

  return (
    <StarField>
      <ScreenHeader title="KP System" accentColor={COLORS.kp} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ReAnimated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <Text style={styles.headerEmoji}>{'\u{1F52D}'}</Text>
          <Text style={styles.headerSubtitle}>
            Krishnamurti Paddhati - Precision Event Timing
          </Text>
        </ReAnimated.View>

        {/* What is KP */}
        <GradientCard colors={COLORS.gradientKP as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>About KP System</Text>
          <Text style={styles.detailText}>
            Developed by Prof. K.S. Krishnamurti in the 20th century, the KP system is
            the most precise predictive system in astrology. It subdivides each Nakshatra
            into 9 sub-lords, creating 249 unique divisions for pinpoint accuracy.
          </Text>
          <Text style={styles.detailText}>
            The key insight: the Sub-Lord is the deciding factor for whether a house's
            promise will manifest in your life and when.
          </Text>
          <SourceRef text="Krishnamurti Paddhati Reader by K.S. Krishnamurti, Vol 1" />
        </GradientCard>

        {/* Predictions */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F31F}'} Life Area Predictions</Text>
          <Text style={styles.subtitleText}>
            Based on your significators and current planetary period
          </Text>

          {predictions.map((pred, i) => (
            <View key={i} style={styles.predictionCard}>
              <View style={styles.predHeader}>
                <Text style={styles.predEmoji}>
                  {AREA_EMOJIS[pred.area] ?? '\u{2B50}'}
                </Text>
                <View style={styles.predHeaderText}>
                  <Text style={styles.predArea}>
                    {pred.area.charAt(0).toUpperCase() + pred.area.slice(1)}
                  </Text>
                  <Text style={styles.predTiming}>{pred.timing}</Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(pred.confidence * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.predText}>{pred.prediction}</Text>
              <Text style={styles.predSource}>{pred.source}</Text>
            </View>
          ))}
        </GradientCard>

        {/* Cusps */}
        <GradientCard>
          <Text style={styles.cardTitle}>House Cusps & Sub-Lords</Text>
          <Text style={styles.subtitleText}>
            Your 12 houses with their star lords and sub-lords
          </Text>

          <View style={styles.cuspHeader}>
            <Text style={[styles.cuspHeaderText, { flex: 0.5 }]}>House</Text>
            <Text style={[styles.cuspHeaderText, { flex: 1 }]}>Sign</Text>
            <Text style={[styles.cuspHeaderText, { flex: 0.7 }]}>Star Lord</Text>
            <Text style={[styles.cuspHeaderText, { flex: 0.7 }]}>Sub Lord</Text>
          </View>
          {cusps.map((cusp) => (
            <View key={cusp.house} style={styles.cuspRow}>
              <Text style={[styles.cuspHouse, { flex: 0.5 }]}>{cusp.house}</Text>
              <Text style={[styles.cuspSign, { flex: 1 }]}>{cusp.sign}</Text>
              <Text style={[styles.cuspLord, { flex: 0.7 }]}>{cusp.starLord}</Text>
              <Text style={[styles.cuspLord, { flex: 0.7 }]}>{cusp.subLord}</Text>
            </View>
          ))}
          <SourceRef text="Krishnamurti Paddhati Reader, Vol 2 - Cusp Analysis" />
        </GradientCard>

        {/* Significators */}
        <GradientCard>
          <Text style={styles.cardTitle}>Planet Significators</Text>
          <Text style={styles.subtitleText}>
            Which houses each planet activates in your chart
          </Text>

          {significators.map((sig, i) => (
            <View key={i} style={styles.sigRow}>
              <Text style={styles.sigPlanet}>{sig.planet}</Text>
              <View style={styles.sigHouses}>
                {sig.houses.map((h) => (
                  <View key={h} style={styles.sigHouseBadge}>
                    <Text style={styles.sigHouseText}>{h}</Text>
                  </View>
                ))}
              </View>
              <View style={[
                styles.strengthBadge,
                sig.strength === 'strong' ? styles.strengthStrong :
                sig.strength === 'moderate' ? styles.strengthModerate :
                styles.strengthWeak,
              ]}>
                <Text style={styles.strengthText}>{sig.strength}</Text>
              </View>
            </View>
          ))}
          <SourceRef text="Krishnamurti Paddhati Reader, Vol 3 - Significators" />
        </GradientCard>

        {/* Recommended Reading */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
          <BookRef title="Krishnamurti Paddhati Reader (Vols 1-6)" desc="The complete reference by Prof. K.S. Krishnamurti" />
          <BookRef title="KP & Astrology Yearbooks" desc="Annual reference for planetary positions and sub-lord tables" />
          <BookRef title="Nakshatra Chintamani" desc="Deep analysis of Nakshatras and their sub-divisions" />
        </GradientCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function SourceRef({ text }: { text: string }) {
  return (
    <View style={styles.sourceRef}>
      <Text style={styles.sourceRefText}>{'\u{1F4D6}'} {text}</Text>
    </View>
  );
}

function BookRef({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.bookRef}>
      <Text style={styles.bookTitle}>{title}</Text>
      <Text style={styles.bookDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.md },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  subtitleText: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: SPACING.sm },
  predictionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  predHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  predEmoji: { fontSize: 28 },
  predHeaderText: { flex: 1 },
  predArea: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  predTiming: { color: COLORS.kp, fontSize: 12, fontWeight: '600' },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 206, 209, 0.2)', borderRadius: BORDER_RADIUS.full,
    paddingVertical: 2, paddingHorizontal: SPACING.sm,
  },
  confidenceText: { color: COLORS.kp, fontSize: 12, fontWeight: '700' },
  predText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  predSource: { color: COLORS.textMuted, fontSize: 10, marginTop: SPACING.xs, fontStyle: 'italic' },
  cuspHeader: { flexDirection: 'row', paddingBottom: SPACING.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  cuspHeaderText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cuspRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  cuspHouse: { color: COLORS.starGold, fontSize: 14, fontWeight: '700' },
  cuspSign: { color: COLORS.white, fontSize: 13 },
  cuspLord: { color: COLORS.textSecondary, fontSize: 12 },
  sigRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sigPlanet: { color: COLORS.white, fontSize: 14, fontWeight: '600', width: 70 },
  sigHouses: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  sigHouseBadge: {
    backgroundColor: 'rgba(0,206,209,0.15)', borderRadius: 4,
    paddingVertical: 2, paddingHorizontal: 6,
  },
  sigHouseText: { color: COLORS.kp, fontSize: 11, fontWeight: '700' },
  strengthBadge: { borderRadius: BORDER_RADIUS.full, paddingVertical: 2, paddingHorizontal: 8 },
  strengthStrong: { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
  strengthModerate: { backgroundColor: 'rgba(255, 171, 64, 0.15)' },
  strengthWeak: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  strengthText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bookRef: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bookTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  bookDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  bottomPad: { height: 20 },
});
