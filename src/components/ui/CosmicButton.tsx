import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface CosmicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  colors?: string[];
  style?: ViewStyle;
  disabled?: boolean;
}

export function CosmicButton({
  title,
  onPress,
  variant = 'primary',
  colors,
  style,
  disabled = false,
}: CosmicButtonProps) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        activeOpacity={0.7}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  const gradientColors = colors ?? (variant === 'primary'
    ? [COLORS.violet, COLORS.aurora]
    : [COLORS.cosmic, COLORS.nebula]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, SHADOWS.glow]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: COLORS.violet,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
