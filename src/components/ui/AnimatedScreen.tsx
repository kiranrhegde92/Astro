/**
 * AnimatedScreen — Wrapper that adds entrance animation to any screen.
 * Stagger-fades children in from below for a polished cosmic feel.
 * Android gets slightly faster/tighter animations (not disabled).
 */
import React from 'react';
import { ViewStyle, StyleProp, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const isAndroid = Platform.OS === 'android';

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function AnimatedScreen({ children, style, delay = 100 }: AnimatedScreenProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay)
        .duration(isAndroid ? 340 : 500)
        .springify()
        .damping(isAndroid ? 22 : 18)}
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
      entering={FadeInDown.delay(isAndroid ? 100 + index * 55 : 150 + index * 80)
        .duration(isAndroid ? 300 : 450)
        .springify()
        .damping(isAndroid ? 22 : 16)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
