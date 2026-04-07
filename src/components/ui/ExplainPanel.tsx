import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ReadingExplainItem } from '../../content/readingExplainers';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import { GradientCard } from './GradientCard';

export function ExplainPanel({
  items,
  intro = 'Tap a lens to see why it showed up and when to trust it.',
}: {
  items: ReadingExplainItem[];
  intro?: string;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(items[0]?.key ?? null);

  if (!items.length) return null;

  return (
    <GradientCard style={styles.card} accentColor={COLORS.plum}>
      <Text style={styles.label}>Explain this reading</Text>
      <Text style={styles.intro}>{intro}</Text>

      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => setActiveKey(active ? null : item.key)}
            activeOpacity={0.84}
          >
            <View style={[styles.row, active && styles.rowActive]}>
              <View style={[styles.accent, { backgroundColor: item.accent }]} />
              <View style={styles.content}>
                <View style={styles.top}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.action}>{active ? 'Hide' : 'Explain'}</Text>
                </View>
                <Text style={styles.summary}>{item.summary}</Text>
                {active ? <Text style={styles.detail}>{item.detail}</Text> : null}
                {active && item.source ? <Text style={styles.source}>{item.source}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  intro: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  rowActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  accent: {
    width: 4,
    borderRadius: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  action: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  summary: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  detail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  source: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
});
