import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import type { CompatibilityDaySnapshot, CompatibilityForecast } from '../../engines/unified/crossCompatibility';

const TONE_COLOR: Record<CompatibilityDaySnapshot['tone'], string> = {
  peak: COLORS.gold,
  bright: COLORS.tide,
  steady: COLORS.iris,
  tender: '#8c7fd6',
  low: COLORS.coral,
};

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatShortDate(dateKey: string): string {
  const d = new Date(dateKey);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CompatibilityTrajectory({
  forecast,
  name1,
  name2,
}: {
  forecast: CompatibilityForecast;
  name1: string;
  name2: string;
}) {
  const { days, peak, low, baseScore, average } = forecast;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = days.find((d) => d.dateKey === selectedKey) ?? null;

  const [minScore, maxScore] = useMemo(() => {
    const scores = days.map((d) => d.score);
    return [Math.min(...scores), Math.max(...scores)];
  }, [days]);

  const range = Math.max(12, maxScore - minScore);

  const handleTap = (dateKey: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedKey((prev) => (prev === dateKey ? null : dateKey));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Next 30 days together</Text>
          <Text style={styles.subtitle}>
            {name1} and {name2} — how the chemistry breathes
          </Text>
        </View>
        <View style={styles.avgBadge}>
          <Text style={styles.avgLabel}>Avg</Text>
          <Text style={styles.avgValue}>{average}%</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {days.map((d) => {
          const heightPct = ((d.score - minScore) / range) * 100;
          const isPeak = d.dateKey === peak.dateKey;
          const isLow = d.dateKey === low.dateKey;
          const isSelected = d.dateKey === selectedKey;
          const borderColor = isSelected
            ? '#fff'
            : isPeak
            ? COLORS.gold
            : isLow
            ? COLORS.coral
            : 'transparent';
          return (
            <Pressable
              key={d.dateKey}
              style={styles.barCol}
              onPress={() => handleTap(d.dateKey)}
              hitSlop={4}
            >
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={[TONE_COLOR[d.tone], `${TONE_COLOR[d.tone]}44`]}
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(8, heightPct)}%`,
                      borderColor,
                      borderWidth: isSelected || isPeak || isLow ? 1 : 0,
                      opacity: selectedKey && !isSelected ? 0.55 : 1,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  (d.weekday === 0 || d.weekday === 6) && styles.dayLabelWeekend,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {WEEKDAY_SHORT[d.weekday]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.inspector}>
          <View style={styles.inspectorHeader}>
            <View style={[styles.inspectorDot, { backgroundColor: TONE_COLOR[selected.tone] }]} />
            <Text style={styles.inspectorDate}>{formatShortDate(selected.dateKey)}</Text>
            <Text style={styles.inspectorScore}>{selected.score}%</Text>
          </View>
          <Text style={styles.inspectorNote}>{selected.note}</Text>
        </View>
      ) : null}

      <View style={styles.legend}>
        <LegendDot color={COLORS.gold} label="Peak" />
        <LegendDot color={COLORS.tide} label="Bright" />
        <LegendDot color={COLORS.iris} label="Steady" />
        <LegendDot color={COLORS.coral} label="Tender" />
      </View>

      <View style={styles.callouts}>
        <CalloutCard
          accent={COLORS.gold}
          label="Peak day"
          date={formatShortDate(peak.dateKey)}
          score={peak.score}
          note={peak.note}
        />
        <CalloutCard
          accent={COLORS.coral}
          label="Go gently"
          date={formatShortDate(low.dateKey)}
          score={low.score}
          note={low.note}
        />
      </View>

      <Text style={styles.baseline}>
        Baseline match stays at <Text style={styles.baselineHighlight}>{baseScore}%</Text> — these daily shifts are the weather around it, not your foundation.
      </Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function CalloutCard({
  accent,
  label,
  date,
  score,
  note,
}: {
  accent: string;
  label: string;
  date: string;
  score: number;
  note: string;
}) {
  return (
    <View style={[styles.callout, { borderColor: `${accent}55` }]}>
      <View style={styles.calloutHeader}>
        <View style={[styles.calloutAccent, { backgroundColor: accent }]} />
        <Text style={[styles.calloutLabel, { color: accent }]}>{label}</Text>
      </View>
      <View style={styles.calloutMeta}>
        <Text style={styles.calloutDate}>{date}</Text>
        <Text style={styles.calloutScore}>{score}%</Text>
      </View>
      <Text style={styles.calloutNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  avgBadge: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.gold}55`,
    backgroundColor: `${COLORS.gold}14`,
    minWidth: 54,
  },
  avgLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  avgValue: {
    color: COLORS.gold,
    fontSize: 15,
    fontFamily: FONTS.heading,
    marginTop: 1,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 96,
    marginBottom: SPACING.sm,
    gap: 2,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '80%',
    borderRadius: 3,
    minHeight: 6,
  },
  dayLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 3,
  },
  dayLabelWeekend: {
    color: COLORS.gold,
  },
  dayLabelSelected: {
    color: '#fff',
    fontFamily: FONTS.heading,
  },
  inspector: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: SPACING.sm,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  inspectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inspectorDate: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  inspectorScore: {
    color: COLORS.gold,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  inspectorNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  callouts: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  callout: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  calloutAccent: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  calloutLabel: {
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  calloutMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calloutDate: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  calloutScore: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  calloutNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  baseline: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  baselineHighlight: {
    color: COLORS.gold,
    fontFamily: FONTS.heading,
    fontStyle: 'normal',
  },
});
