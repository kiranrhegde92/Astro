import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import type { FourPillars, ChineseElement } from '../../types/astrology';

const ELEMENT_COLORS: Record<ChineseElement, string> = {
  Wood: '#58b368',
  Fire: '#ff8a5b',
  Earth: '#caa15a',
  Metal: '#7f8ca8',
  Water: '#4f8bd6',
};

function PillarColumn({
  label,
  stem,
  branch,
  element,
}: {
  label: string;
  stem: string;
  branch: string;
  element: ChineseElement;
}) {
  const color = ELEMENT_COLORS[element];
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <View style={[styles.block, { borderColor: `${color}66`, backgroundColor: `${color}18` }]}>
        <Text style={[styles.blockText, { color }]}>{stem}</Text>
        <Text style={styles.blockSubtext}>Heavenly Stem</Text>
      </View>
      <View style={[styles.block, styles.branchBlock, { borderColor: `${color}44` }]}>
        <Text style={styles.branchEmoji}>⬤</Text>
        <Text style={styles.blockTextDark}>{branch}</Text>
        <Text style={styles.blockSubtext}>{element} · Earthly Branch</Text>
      </View>
    </View>
  );
}

export function BaZiPillars({ pillars }: { pillars: FourPillars }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <PillarColumn label="Year" stem={pillars.year.stem} branch={pillars.year.branch} element={pillars.year.element} />
        <PillarColumn label="Month" stem={pillars.month.stem} branch={pillars.month.branch} element={pillars.month.element} />
        <PillarColumn label="Day" stem={pillars.day.stem} branch={pillars.day.branch} element={pillars.day.element} />
        <PillarColumn label="Hour" stem={pillars.hour.stem} branch={pillars.hour.branch} element={pillars.hour.element} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  column: {
    flex: 1,
    gap: SPACING.xs,
  },
  columnLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  block: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 78,
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  branchBlock: {
    borderColor: COLORS.glassBorder,
  },
  blockText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  blockTextDark: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  blockSubtext: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  branchEmoji: {
    color: COLORS.chinese,
    fontSize: 10,
  },
});
