/**
 * CosmicSelf — Reanimated Animation Hooks
 *
 * Shared animation primitives for consistent motion across the app.
 * Uses react-native-reanimated for performant native-thread animations.
 */
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideInDown,
  Layout,
} from 'react-native-reanimated';

// ─── Entrance Presets ───────────────────────────────────────────────────────

/** Fade in from below — for cards, sections */
export const fadeInUp = (delay = 0, duration = 500) =>
  FadeInDown.delay(delay).duration(duration).springify().damping(18);

/** Fade in from above */
export const fadeInDown = (delay = 0, duration = 500) =>
  FadeInUp.delay(delay).duration(duration).springify().damping(18);

/** Slide in from right — for screen transitions */
export const slideInRight = (delay = 0) =>
  SlideInRight.delay(delay).springify().damping(20);

/** Simple fade in */
export const fadeIn = (delay = 0, duration = 400) =>
  FadeIn.delay(delay).duration(duration);

/** Exit fade */
export const fadeOut = (duration = 300) =>
  FadeOut.duration(duration);

/** Layout animation for list reordering */
export const layoutTransition = Layout.springify().damping(18);

// ─── Custom Hooks ───────────────────────────────────────────────────────────

/**
 * Staggered fade-in for a list of items.
 * Returns animated style for the given index.
 */
export function useStaggeredFadeIn(index: number, staggerMs = 80) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * staggerMs,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [24, 0]) },
    ],
  }));

  return animatedStyle;
}

/**
 * Pulsing glow animation — for cosmic orbs, score highlights.
 */
export function usePulseGlow(minScale = 0.95, maxScale = 1.05) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
    );
    // Loop via interval
    const id = setInterval(() => {
      pulse.value = withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [minScale, maxScale]) },
    ],
    opacity: interpolate(pulse.value, [0, 1], [0.7, 1]),
  }));

  return animatedStyle;
}

/**
 * Score count-up animation — smoothly animates a number from 0 to target.
 */
export function useCountUp(target: number, duration = 1200, delay = 300) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(
      delay,
      withTiming(target, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [target]);

  return value;
}

/**
 * Card reveal animation — scale + fade for dramatic card reveals.
 */
export function useCardReveal(delay = 0) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 16, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.8, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.85, 1]) },
      { translateY: interpolate(progress.value, [0, 1], [30, 0]) },
    ],
  }));

  return animatedStyle;
}

/**
 * Shimmer effect — for loading placeholders.
 */
export function useShimmer() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      shimmer.value = withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      );
    };
    animate();
    const id = setInterval(animate, 1600);
    return () => clearInterval(id);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.06, 0.2]),
  }));

  return animatedStyle;
}

// Re-export Animated for convenience
export { default as Animated } from 'react-native-reanimated';
