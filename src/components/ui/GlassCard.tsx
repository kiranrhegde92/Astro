/**
 * GlassCard — the primary surface tier for Midnight Observatory.
 * Translucent white over the cosmic base, 1px top inner-highlight,
 * optional left-accent stripe, optional gold/violet glow halo.
 */
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  padding?: number;
  accentColor?: string;
  glowColor?: string;
  elevated?: boolean;
  feature?: boolean;
}

export const GlassCard = React.memo(function GlassCard({
  children,
  style,
  innerStyle,
  noPadding = false,
  padding,
  accentColor,
  glowColor,
  elevated = false,
  feature = false,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.wrap,
        elevated && styles.elevated,
        feature && styles.feature,
        glowColor
          ? {
              shadowColor: glowColor,
              shadowOpacity: 0.42,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }
          : null,
        style,
      ]}
    >
      <View style={styles.topHighlight} pointerEvents="none" />
      {accentColor ? (
        <View
          style={[styles.accent, { backgroundColor: accentColor }]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[
          styles.content,
          !noPadding && { padding: padding ?? SPACING.md },
          innerStyle,
        ]}
      >
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
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  elevated: {
    backgroundColor: COLORS.glassBgMid,
    borderColor: 'rgba(255,255,255,0.16)',
    ...SHADOWS.card,
  },
  feature: {
    borderColor: COLORS.glassBorderBright,
    ...SHADOWS.glowGold,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  accent: {
    position: 'absolute',
    top: 16,
    left: 0,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  content: {
    gap: SPACING.sm,
  },
});
