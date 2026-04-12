import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { getMoonPhase, getUpcomingMoonPhases } from '../src/utils/moonPhase';

export default function MoonCalendarScreen() {
  const phase = getMoonPhase();
  const upcoming = getUpcomingMoonPhases(new Date(), 6);

  return (
    <StarField>
      <ScreenHeader title="Moon Calendar" accentColor={COLORS.gold} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>LUNAR RHYTHM</Text>
        <Text style={styles.headline}>{phase.emoji} {phase.label}</Text>
        <Text style={styles.subtitle}>Illumination {Math.round(phase.illumination * 100)}% · Moon age {phase.ageDays} days</Text>

        <GradientCard accentColor={COLORS.gold} style={styles.card}>
          <Text style={styles.cardTitle}>Today’s ritual</Text>
          <Text style={styles.cardBody}>{phase.ritual}</Text>
        </GradientCard>

        <GradientCard accentColor={COLORS.tide} style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming phases</Text>
          {upcoming.map((item) => (
            <View key={`${item.date}-${item.key}`} style={styles.row}>
              <Text style={styles.rowEmoji}>{item.emoji}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowMeta}>{item.date} · {Math.round(item.illumination * 100)}% light</Text>
                <Text style={styles.rowCopy}>{item.ritual}</Text>
              </View>
            </View>
          ))}
        </GradientCard>

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FONTS.display,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  cardBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
  },
  rowMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
  },
  rowCopy: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  bottomPad: {
    height: 20,
  },
});
