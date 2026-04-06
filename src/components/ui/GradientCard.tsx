/**
 * GradientCard — Obsidian Glass card
 * 3D depth: white border gradient + BlurView + glossy top highlight + deep shadow
 * Light source simulation: bright top-left → fade to transparent
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BORDER_RADIUS, SPACING, COLORS } from '../../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  noPadding?: boolean;
  glowColor?: string;
  blurIntensity?: number;
  accentColor?: string;
}

export function GradientCard({
  children,
  colors = ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)'] as const,
  style,
  innerStyle,
  noPadding,
  glowColor,
  blurIntensity = 60,
  accentColor,
}: GradientCardProps) {
  return (
    <View style={[styles.shadow, style]}>
      {/* Border gradient — white glass edge */}
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <View style={[styles.inner, noPadding && styles.noPad, innerStyle]}>
          {/* Blur layer */}
          <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFillObject} />

          {/* Glossy top highlight — 3D light source effect */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gloss}
            pointerEvents="none"
          />

          {/* Accent left bar */}
          {accentColor && (
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          )}

          {/* Content */}
          <View style={[styles.content, noPadding && styles.noPad]}>
            {children}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.75,
    shadowRadius: 28,
    elevation: 18,
  },
  border: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 1,
  },
  inner: {
    borderRadius: BORDER_RADIUS.xl - 1,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    zIndex: 1,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
    zIndex: 2,
  },
  noPad: {
    padding: 0,
  },
  content: {
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    zIndex: 3,
  },
});
