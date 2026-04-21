import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '../../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  glowColor?: string;
  blurIntensity?: number;
  accentColor?: string;
}

export const GradientCard = React.memo(function GradientCard({
  children,
  colors = COLORS.gradientCard,
  style,
  innerStyle,
  noPadding = false,
  glowColor,
  accentColor,
}: GradientCardProps) {
  return (
    <View
      style={[
        styles.wrap,
        glowColor ? { shadowColor: glowColor, shadowOpacity: 0.12 } : null,
        style,
      ]}
    >
      <LinearGradient colors={colors as [string, string, ...string[]]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.glowLayer} />
      {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      <View style={[styles.content, noPadding && styles.noPad, innerStyle]}>
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.6,
  },
  accent: {
    position: 'absolute',
    top: 18,
    left: 0,
    bottom: 18,
    width: 4,
    borderRadius: 4,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  noPad: {
    padding: 0,
    gap: 0,
  },
});
