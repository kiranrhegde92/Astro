import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useReadingStore } from '../../src/store/readingStore';
import { formatDisplayDate } from '../../src/utils/dateUtils';

export default function ArchiveReadingScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const getCachedReading = useReadingStore((s) => s.getCachedReading);
  const reading = date ? getCachedReading(date) : null;

  if (!reading) {
    return (
      <StarField>
        <ScreenHeader title="Past reading" />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Reading not found</Text>
          <Text style={styles.emptyCopy}>This reading may have expired from the local cache.</Text>
        </View>
      </StarField>
    );
  }

  const headline = reading.unified.headline ?? 'A day of cosmic alignment.';
  const vibe = reading.unified.cosmicVibe ?? '';
  const affirmation = reading.unified.affirmation ?? '';
  const bestUse = reading.unified.bestUse ?? reading.unified.focusAdvice ?? '';
  const watchFor = reading.unified.watchFor ?? '';
  const timingNote = reading.unified.timingNote ?? '';
  const tone = reading.unified.tone ?? 'Mixed';

  return (
    <StarField>
      <ScreenHeader title={formatDisplayDate(reading.date)} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AnimatedCard index={0}>
          <LinearGradient colors={COLORS.gradientInk} style={styles.hero}>
            <Text style={styles.heroBadge}>{tone.toUpperCase()}</Text>
            <Text style={styles.heroHeadline}>{headline}</Text>
            <Text style={styles.heroBody}>{vibe}</Text>
          </LinearGradient>
        </AnimatedCard>

        {affirmation ? (
          <AnimatedCard index={1}>
            <GradientCard accentColor={COLORS.starGold}>
              <Text style={styles.cardEyebrow}>AFFIRMATION</Text>
              <Text style={styles.affirmation}>"{affirmation}"</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {bestUse ? (
          <AnimatedCard index={2}>
            <GradientCard accentColor={COLORS.tide}>
              <Text style={styles.cardEyebrow}>LEAN INTO</Text>
              <Text style={styles.cardBody}>{bestUse}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {watchFor ? (
          <AnimatedCard index={3}>
            <GradientCard accentColor={COLORS.coral}>
              <Text style={styles.cardEyebrow}>WATCH FOR</Text>
              <Text style={styles.cardBody}>{watchFor}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {timingNote ? (
          <AnimatedCard index={4}>
            <GradientCard accentColor={COLORS.gold}>
              <Text style={styles.cardEyebrow}>TIMING</Text>
              <Text style={styles.cardBody}>{timingNote}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.western?.overall ? (
          <AnimatedCard index={5}>
            <GradientCard accentColor={COLORS.western}>
              <Text style={styles.cardEyebrow}>WESTERN</Text>
              <Text style={styles.cardBody}>{reading.western.overall}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.vedic?.dasha ? (
          <AnimatedCard index={6}>
            <GradientCard accentColor={COLORS.vedic}>
              <Text style={styles.cardEyebrow}>VEDIC</Text>
              <Text style={styles.cardBody}>{reading.vedic.dasha}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.chinese?.element ? (
          <AnimatedCard index={7}>
            <GradientCard accentColor={COLORS.chinese}>
              <Text style={styles.cardEyebrow}>CHINESE</Text>
              <Text style={styles.cardBody}>{reading.chinese.element}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
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
    fontSize: 22,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  emptyCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  hero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.deep,
  },
  heroBadge: {
    color: 'rgba(255,250,241,0.6)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  heroHeadline: {
    color: '#fffaf1',
    fontSize: 26,
    lineHeight: 32,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
  },
  heroBody: {
    color: 'rgba(255,250,241,0.85)',
    fontSize: 14,
    lineHeight: 21,
  },
  cardEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  affirmation: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: FONTS.heading,
    fontStyle: 'italic',
  },
  cardBody: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  bottomPad: {
    height: 40,
  },
});
