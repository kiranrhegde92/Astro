import React, { useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SHADOWS } from '../../constants/theme';

interface OrbIconProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  accentColor: string;
  secondaryColor?: string;
  iconColor?: string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function OrbIcon({
  icon,
  size = 44,
  accentColor,
  secondaryColor = '#fffaf1',
  iconColor = '#1b2233',
  active = false,
  style,
}: OrbIconProps) {
  const reducedMotion = Platform.OS === 'android';
  const motion = useSharedValue(0);
  const outerSize = size;
  const innerSize = size * 0.72;
  const iconSize = size * 0.38;

  useEffect(() => {
    if (active) {
      if (reducedMotion) {
        motion.value = withTiming(0.35, { duration: 220 });
        return;
      }

      motion.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      return;
    }

    motion.value = withTiming(0, { duration: 220 });
  }, [active, motion, reducedMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: reducedMotion
      ? [{ scale: interpolate(motion.value, [0, 1], [1, 1.02]) }]
      : [
          { perspective: 900 },
          { translateY: interpolate(motion.value, [0, 1], [0, -2]) },
          { scale: interpolate(motion.value, [0, 1], [1, 1.04]) },
          { rotateX: `${interpolate(motion.value, [0, 1], [0, 10])}deg` },
          { rotateY: `${interpolate(motion.value, [0, 1], [0, -10])}deg` },
        ],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? interpolate(motion.value, [0, 1], [0.58, 0.72]) : interpolate(motion.value, [0, 1], [0.52, 0.8]),
    transform: [
      { translateX: reducedMotion ? 0 : interpolate(motion.value, [0, 1], [0, 2]) },
      { translateY: reducedMotion ? 0 : interpolate(motion.value, [0, 1], [0, -2]) },
    ],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? interpolate(motion.value, [0, 1], [0.88, 0.96]) : interpolate(motion.value, [0, 1], [0.9, 1]),
    transform: [
      { rotateZ: `${reducedMotion ? interpolate(motion.value, [0, 1], [0, 8]) : interpolate(motion.value, [0, 1], [0, 28])}deg` },
      { scale: reducedMotion ? interpolate(motion.value, [0, 1], [1, 1.03]) : interpolate(motion.value, [0, 1], [1, 1.08]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          shadowColor: accentColor,
        },
        active ? SHADOWS.glow : SHADOWS.glass,
        style,
        wrapStyle,
      ]}
    >
      <LinearGradient
        colors={[secondaryColor, accentColor] as [string, string]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={[styles.outer, { borderRadius: outerSize / 2 }]}
      />

      <Animated.View
        style={[
          styles.innerShell,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.35)'] as [string, string]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.innerFill, { borderRadius: innerSize / 2 }]}
        />
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </Animated.View>

      <Animated.View
        style={[
          styles.highlight,
          {
            width: outerSize * 0.26,
            height: outerSize * 0.18,
            borderRadius: outerSize * 0.13,
            top: outerSize * 0.12,
            left: outerSize * 0.16,
          },
          highlightStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.orbitDot,
          {
            width: outerSize * 0.16,
            height: outerSize * 0.16,
            borderRadius: outerSize * 0.08,
            bottom: outerSize * 0.08,
            right: outerSize * 0.1,
            backgroundColor: secondaryColor,
          },
          orbitStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  innerShell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  innerFill: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.52)',
    transform: [{ rotate: '-18deg' }],
  },
  orbitDot: {
    position: 'absolute',
  },
});
