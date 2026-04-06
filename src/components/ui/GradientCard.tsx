import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: ViewStyle;
}

export function GradientCard({
  children,
  colors = COLORS.gradientCard,
  style,
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.border}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 1,
    ...SHADOWS.card,
  },
  border: {
    borderRadius: BORDER_RADIUS.lg - 1,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    backgroundColor: 'rgba(10, 10, 46, 0.6)',
  },
});
