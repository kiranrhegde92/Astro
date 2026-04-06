import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';

export default function VedicReadingScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user?.vedic) return null;

  const { rashi, nakshatra, nakshatraPada, currentDasha, dashas, remedies } = user.vedic;

  // Calculate Dasha timeline for visualization
  const now = new Date();
  const dashaTimeline = dashas.map((d) => {
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    const isCurrent = now >= start && now <= end;
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = isCurrent ? (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) : 0;
    const progress = isCurrent ? Math.min(elapsedDays / totalDays, 1) : now > end ? 1 : 0;
    return { ...d, isCurrent, progress, startDate: start, endDate: end };
  });

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <ReAnimated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <Text style={styles.headerEmoji}>{'\u{1F549}\uFE0F'}</Text>
          <GlowText size="xl" align="center" color={COLORS.vedic}>
            Vedic Astrology
          </GlowText>
        </ReAnimated.View>

        {/* Rashi */}
        <ReAnimated.View entering={FadeInDown.delay(200).duration(450).springify().damping(16)}>
        <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>Rashi (Moon Sign)</Text>
          <Text style={styles.mainValue}>{rashi}</Text>
          <Text style={styles.detailText}>
            In Vedic astrology, your Moon sign (Rashi) is your primary sign - it represents your mind,
            emotions, and inner nature. Unlike Western astrology which emphasizes the Sun sign,
            Vedic tradition considers the Moon the most important celestial body.
          </Text>
          <SourceRef text="Brihat Parashara Hora Shastra - Chapter on Rashi Characteristics" />
        </GradientCard>
        </ReAnimated.View>

        {/* Nakshatra */}
        <ReAnimated.View entering={FadeInDown.delay(320).duration(450).springify().damping(16)}>
        <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>Nakshatra (Lunar Mansion)</Text>
          <Text style={styles.mainValue}>{nakshatra}</Text>
          <Text style={styles.padaText}>Pada {nakshatraPada} of 4</Text>
          <Text style={styles.detailText}>
            Your birth Nakshatra is one of 27 lunar mansions, each spanning 13°20' of the zodiac.
            It reveals deeper personality traits, spiritual tendencies, and determines your
            Vimshottari Dasha sequence - the timing of major life events.
          </Text>
          <View style={styles.padaBar}>
            {[1, 2, 3, 4].map((p) => (
              <View
                key={p}
                style={[styles.padaDot, p === nakshatraPada && styles.padaDotActive]}
              />
            ))}
          </View>
          <SourceRef text="Brihat Jataka by Varahamihira - Nakshatra Analysis" />
        </GradientCard>
        </ReAnimated.View>

        {/* Dasha Timeline */}
        <ReAnimated.View entering={FadeInDown.delay(440).duration(450).springify().damping(16)}>
        <GradientCard>
          <Text style={styles.cardTitle}>Vimshottari Dasha Timeline</Text>
          <Text style={styles.subtitleText}>
            Your 120-year planetary period cycle - showing when each planet's influence is strongest
          </Text>
          <Text style={styles.currentDashaLabel}>
            Current Period: {currentDasha.planet} Mahadasha
          </Text>

          <View style={styles.timeline}>
            {dashaTimeline.slice(0, 9).map((d, i) => {
              const startYear = d.startDate.getFullYear();
              const endYear = d.endDate.getFullYear();
              return (
                <View key={i} style={styles.dashaRow}>
                  <View style={styles.dashaInfo}>
                    <Text style={[styles.dashaPlanet, d.isCurrent && styles.dashaPlanetCurrent]}>
                      {d.planet}
                    </Text>
                    <Text style={styles.dashaYears}>{startYear} - {endYear}</Text>
                  </View>
                  <View style={styles.dashaBarBg}>
                    <View
                      style={[
                        styles.dashaBarFill,
                        {
                          width: `${d.progress * 100}%`,
                          backgroundColor: d.isCurrent ? COLORS.starGold : COLORS.vedic,
                        },
                      ]}
                    />
                  </View>
                  {d.isCurrent && (
                    <Text style={styles.dashaActive}>{'\u2B50'} NOW</Text>
                  )}
                </View>
              );
            })}
          </View>
          <SourceRef text="Brihat Parashara Hora Shastra - Chapter 46, Dasha Effects" />
        </GradientCard>
        </ReAnimated.View>

        {/* Remedies */}
        <ReAnimated.View entering={FadeInDown.delay(560).duration(450).springify().damping(16)}>
        <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>{'\u{1F48E}'} Cosmic Enhancements (Remedies)</Text>
          <Text style={styles.subtitleText}>
            Vedic wisdom offers ways to harmonize with your current planetary energies
          </Text>

          {remedies.map((remedy, i) => (
            <View key={i} style={styles.remedyCard}>
              <Text style={styles.remedyIcon}>
                {remedy.type === 'gemstone' ? '\u{1F48E}' :
                 remedy.type === 'mantra' ? '\u{1F3B5}' :
                 remedy.type === 'color' ? '\u{1F308}' :
                 remedy.type === 'day' ? '\u{1F4C5}' :
                 remedy.type === 'charity' ? '\u{1F49B}' : '\u{1F52E}'}
              </Text>
              <View style={styles.remedyContent}>
                <Text style={styles.remedyType}>{remedy.type.toUpperCase()}</Text>
                <Text style={styles.remedyName}>{remedy.name}</Text>
                <Text style={styles.remedyDesc}>{remedy.description}</Text>
                <Text style={styles.remedySource}>{remedy.source}</Text>
              </View>
            </View>
          ))}
        </GradientCard>
        </ReAnimated.View>

        {/* Recommended Reading */}
        <ReAnimated.View entering={FadeInDown.delay(680).duration(450).springify().damping(16)}>
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
          <BookRef title="Brihat Parashara Hora Shastra" desc="The foundational text of Vedic astrology by Sage Parashara" />
          <BookRef title="Phaladeepika" desc="by Mantreswara - Comprehensive guide to chart interpretation" />
          <BookRef title="Saravali" desc="by Kalyana Varma - Detailed Dasha and Nakshatra effects" />
        </GradientCard>
        </ReAnimated.View>

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
  spacer: { height: 50 },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  mainValue: { color: COLORS.starGold, fontSize: 28, fontWeight: '800' },
  padaText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  subtitleText: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm },
  padaBar: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  padaDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: COLORS.vedic,
  },
  padaDotActive: { backgroundColor: COLORS.vedic },
  currentDashaLabel: {
    color: COLORS.starGold, fontSize: 15, fontWeight: '700',
    marginBottom: SPACING.md,
  },
  timeline: { gap: SPACING.sm },
  dashaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dashaInfo: { width: 90 },
  dashaPlanet: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  dashaPlanetCurrent: { color: COLORS.starGold },
  dashaYears: { color: COLORS.textMuted, fontSize: 10 },
  dashaBarBg: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  dashaBarFill: { height: '100%', borderRadius: 4 },
  dashaActive: { color: COLORS.starGold, fontSize: 10, fontWeight: '800', width: 40 },
  remedyCard: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  remedyIcon: { fontSize: 28 },
  remedyContent: { flex: 1 },
  remedyType: { color: COLORS.vedic, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  remedyName: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginTop: 2 },
  remedyDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  remedySource: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },
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
