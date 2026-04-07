import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, FONTS } from '../../constants/theme';

interface CosmicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  colors?: string[];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}

export function CosmicButton({
  title,
  onPress,
  variant = 'primary',
  colors,
  style,
  disabled = false,
  loading = false,
}: CosmicButtonProps) {
  const gradientColors =
    colors ??
    (variant === 'secondary'
      ? [COLORS.bgElevated, COLORS.bgCard]
      : [...COLORS.gradientPrimary]);

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.base, styles.outlineButton, disabled && styles.disabled, style]}
        activeOpacity={0.84}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.9} style={[disabled && styles.disabled, style]}>
      <LinearGradient colors={gradientColors as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.base, SHADOWS.glowGold]}>
        {loading
          ? <ActivityIndicator color="#fffaf1" />
          : <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  text: {
    color: '#fffaf1',
    fontSize: 15,
    fontFamily: FONTS.heading,
    letterSpacing: 0.2,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  outlineButton: {
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderColor: COLORS.glassBorderBright,
  },
  outlineText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
