/**
 * SectionLabel — Cinzel small-caps section header.
 * Reads like constellation engraving. Always uppercase, wide tracking.
 */
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';

interface SectionLabelProps {
  children: string;
  accent?: string;
  align?: 'left' | 'center';
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}

export const SectionLabel = React.memo(function SectionLabel({
  children,
  accent,
  align = 'left',
  muted = false,
  style,
}: SectionLabelProps) {
  return (
    <View
      style={[
        styles.row,
        align === 'center' && styles.centerRow,
      ]}
    >
      {accent ? <View style={[styles.dot, { backgroundColor: accent }]} /> : null}
      <Text
        style={[
          styles.label,
          { color: muted ? COLORS.textMuted : COLORS.textSecondary },
          style,
        ]}
        accessibilityRole="header"
      >
        {children.toUpperCase()}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  centerRow: {
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: FONTS.accent,
    ...TYPE.label,
  },
});
