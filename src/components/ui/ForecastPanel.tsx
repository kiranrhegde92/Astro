import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ForecastWindow, PeriodForecast } from '../../content/forecastTemplates';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import { getSpokenForecastCopy } from '../../i18n/spokenContent';
import type { SupportedLanguage } from '../../i18n/language';
import { GradientCard } from './GradientCard';

export function ForecastPanel({
  forecast,
  window,
  onChange,
  language,
}: {
  forecast: PeriodForecast;
  window: ForecastWindow;
  onChange: (window: ForecastWindow) => void;
  language?: SupportedLanguage;
}) {
  const copy = getSpokenForecastCopy(forecast, language);

  return (
    <GradientCard style={styles.card} accentColor={window === 'week' ? COLORS.iris : COLORS.coral}>
      <View style={styles.header}>
        <Text style={styles.label}>{copy.outlookLabel}</Text>
        <View style={styles.switcher}>
          {(['week', 'month'] as const).map((item) => {
            const active = item === window;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => onChange(item)}
                style={[styles.switchChip, active && styles.switchChipActive]}
                activeOpacity={0.84}
              >
                <Text style={[styles.switchText, active && styles.switchTextActive]}>
                  {item === 'week' ? copy.weekLabel : copy.monthLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.headline}>{copy.headline}</Text>
      <Text style={styles.summary}>{copy.summary}</Text>

      {copy.drivers?.length ? (
        <View style={styles.driverWrap}>
          <Text style={styles.driverLabel}>{copy.driverLabel}</Text>
          <View style={styles.driverList}>
            {copy.drivers.map((driver) => (
              <View key={driver} style={styles.driverChip}>
                <Text style={styles.driverText}>{driver}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.focusList}>
        {copy.focusAreas.map((item) => (
          <View key={item.label} style={styles.focusRow}>
            <Text style={styles.focusLabel}>{item.label}</Text>
            <Text style={styles.focusText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.windowGrid}>
        <View style={styles.windowCard}>
          <Text style={styles.windowLabel}>{copy.openWindowLabel}</Text>
          <Text style={styles.windowValue}>{copy.brightWindow}</Text>
        </View>
        <View style={styles.windowCard}>
          <Text style={styles.windowLabel}>{copy.carefulWindowLabel}</Text>
          <Text style={styles.windowValue}>{copy.cautionWindow}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>{copy.prompt}</Text>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  switcher: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  switchChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  switchChipActive: {
    backgroundColor: COLORS.bgMuted,
    borderColor: COLORS.glassBorderBright,
  },
  switchText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  switchTextActive: {
    color: COLORS.textPrimary,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  summary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  driverWrap: {
    gap: SPACING.xs,
  },
  driverLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  driverList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  driverChip: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.54)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  driverText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.3,
  },
  focusList: {
    gap: SPACING.sm,
  },
  focusRow: {
    gap: 2,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  focusLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  focusText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  windowGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  windowCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.60)',
    gap: 4,
  },
  windowLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  windowValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.heading,
  },
  prompt: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
