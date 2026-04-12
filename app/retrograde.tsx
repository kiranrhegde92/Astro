import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { getCurrentTransits } from '../src/engines/common/transits';
import { useReadingStore } from '../src/store/readingStore';

export default function RetrogradeScreen() {
  const todayReading = useReadingStore((state) => state.todayReading);
  const planets = useMemo(() => {
    const positions = todayReading?.transitPositions?.length
      ? todayReading.transitPositions
      : getCurrentTransits().map((item) => ({
          planet: item.planet,
          sign: item.sign,
          degree: item.degree,
          retrograde: item.retrograde,
        }));
    return positions.filter((item) => item.retrograde);
  }, [todayReading?.transitPositions]);

  return (
    <StarField>
      <ScreenHeader title="Retrograde Tracker" accentColor={COLORS.coral} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>RETROGRADE WATCH</Text>
        <Text style={styles.headline}>Planets currently moving backwards through the sky.</Text>
        <Text style={styles.subtitle}>Retrogrades tend to slow momentum, revisit unfinished themes, and sharpen reflection more than pure forward action.</Text>

        <GradientCard accentColor={COLORS.coral} style={styles.card}>
          <Text style={styles.cardTitle}>Live retrogrades</Text>
          {planets.length ? planets.map((planet) => (
            <View key={`${planet.planet}-${planet.sign}`} style={styles.row}>
              <Text style={styles.rowPlanet}>{planet.planet}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowMeta}>{planet.sign} {planet.degree.toFixed(1)}° · Retrograde</Text>
                <Text style={styles.rowCopy}>Review plans, re-check assumptions, and avoid forcing immediate clarity in this planet’s domain.</Text>
              </View>
            </View>
          )) : <Text style={styles.rowCopy}>No major retrogrades are active in the current tracked transit set.</Text>}
        </GradientCard>

        <GradientCard accentColor={COLORS.gold} style={styles.card}>
          <Text style={styles.cardTitle}>How to use this</Text>
          <Text style={styles.rowCopy}>Mercury retrograde tends to affect edits and communication. Venus retrograde revisits value and relationship patterns. Mars retrograde slows direct action and reward comes from patience.</Text>
        </GradientCard>

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.lg },
  eyebrow: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.2 },
  headline: { color: COLORS.textPrimary, fontSize: 30, lineHeight: 36, fontFamily: FONTS.display },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  card: { gap: SPACING.sm },
  cardTitle: { color: COLORS.textPrimary, fontSize: 19, lineHeight: 24, fontFamily: FONTS.heading },
  row: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.sm },
  rowPlanet: { color: COLORS.coral, fontSize: 15, fontFamily: FONTS.heading, width: 64 },
  rowBody: { flex: 1, gap: 2 },
  rowMeta: { color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.heading },
  rowCopy: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  bottomPad: { height: 20 },
});
