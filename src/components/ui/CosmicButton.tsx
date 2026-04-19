import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, FONTS } from '../../constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

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

  // Shimmer sweep animation (primary only)
  const shimmer = useSharedValue(-1);
  const [btnWidth, setBtnWidth] = useState(0);

  useEffect(() => {
    if (variant !== 'primary' || disabled || loading) return;
    shimmer.value = withRepeat(
      withSequence(
        withDelay(1600, withTiming(2, { duration: 800, easing: Easing.inOut(Easing.quad) })),
        withTiming(-1, { duration: 0 })
      ),
      -1,
      false
    );
    return () => { shimmer.value = -1; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, disabled, loading]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: btnWidth > 0 ? (shimmer.value + 1) / 3 * (btnWidth + 60) - 30 : -100 },
    ],
  }));

  if (variant === 'outline') {
    return (
      <AnimatedPressable onPress={onPress} disabled={disabled} scaleTo={0.97} haptic style={style}>
        <View style={[styles.base, styles.outlineButton, disabled && styles.disabled]}>
          <Text style={styles.outlineText}>{title}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable onPress={onPress} disabled={disabled || loading} scaleTo={0.97} haptic style={style}>
      <View style={disabled ? styles.disabled : undefined}>
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, SHADOWS.glowGold]}
          onLayout={(e) => setBtnWidth(e.nativeEvent.layout.width)}
        >
          {loading ? (
            <ActivityIndicator color="#fffaf1" />
          ) : (
            <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
          )}

          {/* Shimmer sweep overlay */}
          {!loading && !disabled && variant === 'primary' && (
            <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
          )}
        </LinearGradient>
      </View>
    </AnimatedPressable>
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
    overflow: 'hidden',
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
    backgroundColor: COLORS.glassBg,
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
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 52,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '18deg' }],
  },
});
