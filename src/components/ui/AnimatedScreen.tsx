/**
 * AnimatedScreen — Wrapper that adds entrance animation to any screen.
 * Stagger-fades children in from below for a polished cosmic feel.
 */
import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function AnimatedScreen({ children, style, delay = 100 }: AnimatedScreenProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify().damping(18)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedCard — Individual card with staggered entrance animation.
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedCard({ children, index = 0, style }: AnimatedCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 80).duration(450).springify().damping(16)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
