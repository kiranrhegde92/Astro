import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type Sparkle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  drift: number;
  phase: number;
};

function seed(value: number) {
  const x = Math.sin(value) * 10000;
  return x - Math.floor(x);
}

function FloatingSparkle({
  sparkle,
  motion,
  reducedMotion,
}: {
  sparkle: Sparkle;
  motion: SharedValue<number>;
  reducedMotion: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion
      ? sparkle.opacity + 0.06
      : sparkle.opacity +
        interpolate((motion.value + sparkle.phase) % 1, [0, 0.5, 1], [0, 0.34, 0]),
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate((motion.value + sparkle.phase) % 1, [0, 0.5, 1], [0, -sparkle.drift, 0]),
      },
      {
        translateX: reducedMotion
          ? 0
          : interpolate((motion.value + sparkle.phase) % 1, [0, 0.5, 1], [0, sparkle.drift * 0.38, 0]),
      },
      {
        scale: reducedMotion
          ? 1
          : interpolate((motion.value + sparkle.phase) % 1, [0, 0.5, 1], [1, 1.24, 1]),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkle,
        {
          left: sparkle.x,
          top: sparkle.y,
          width: sparkle.size,
          height: sparkle.size,
          borderRadius: sparkle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export function StarField({ children }: { children: React.ReactNode }) {
  const reducedMotion = Platform.OS === 'android';
  const sparkles = useMemo(
    () =>
      Array.from({ length: reducedMotion ? 10 : 22 }).map((_, index) => ({
        x: seed(index * 7 + 3) * width,
        y: seed(index * 11 + 5) * height,
        size: seed(index * 5 + 9) * 2.4 + 0.8,
        opacity: seed(index * 13 + 17) * 0.24 + 0.08,
        drift: seed(index * 17 + 29) * 7 + 2,
        phase: seed(index * 19 + 31),
      })),
    [reducedMotion]
  );

  const twinkle = useSharedValue(0);
  const atmosphere = useSharedValue(0);
  const orbit = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      twinkle.value = 0;
      atmosphere.value = 0;
      orbit.value = 0;
      return;
    }

    twinkle.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);

    atmosphere.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    orbit.value = withRepeat(withTiming(1, { duration: 26000, easing: Easing.linear }), -1, false);
  }, [atmosphere, orbit, reducedMotion, twinkle]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(atmosphere.value, [0, 1], [0.84, 1]),
    transform: [
      { translateX: interpolate(atmosphere.value, [0, 1], [-8, 10]) },
      { translateY: interpolate(atmosphere.value, [0, 1], [-12, 8]) },
      { scale: interpolate(atmosphere.value, [0, 1], [1, 1.06]) },
    ],
  }));

  const plumStyle = useAnimatedStyle(() => ({
    opacity: interpolate(atmosphere.value, [0, 1], [0.6, 0.95]),
    transform: [
      { translateX: interpolate(atmosphere.value, [0, 1], [0, -16]) },
      { translateY: interpolate(atmosphere.value, [0, 1], [6, -8]) },
      { scale: interpolate(atmosphere.value, [0, 1], [0.98, 1.08]) },
    ],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(atmosphere.value, [0, 1], [0.54, 0.9]),
    transform: [
      { translateX: interpolate(atmosphere.value, [0, 1], [-10, 12]) },
      { translateY: interpolate(atmosphere.value, [0, 1], [10, -6]) },
      { scale: interpolate(atmosphere.value, [0, 1], [1, 1.08]) },
    ],
  }));

  const inkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(atmosphere.value, [0, 1], [0.62, 0.96]),
    transform: [
      { translateY: interpolate(atmosphere.value, [0, 1], [0, -14]) },
      { translateX: interpolate(atmosphere.value, [0, 1], [0, 12]) },
      { scale: interpolate(atmosphere.value, [0, 1], [1, 1.05]) },
    ],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${orbit.value * 360}deg` },
      { scale: interpolate(atmosphere.value, [0, 1], [1, 1.02]) },
    ],
    opacity: interpolate(atmosphere.value, [0, 1], [0.72, 1]),
  }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#fff8f2', '#f4ebf8', '#ddd5ff']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFillObject} />

      <Animated.View pointerEvents="none" style={[styles.sunGlow, sunStyle]} />
      <Animated.View pointerEvents="none" style={[styles.plumGlow, plumStyle]} />
      <Animated.View pointerEvents="none" style={[styles.bottomGlow, bottomStyle]} />
      <Animated.View pointerEvents="none" style={[styles.inkPool, inkStyle]} />

      {!reducedMotion && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, orbitStyle]}>
          <Svg style={StyleSheet.absoluteFillObject} viewBox={`0 0 ${width} ${height}`}>
            <Path
              d={`M 0 ${height * 0.26} C ${width * 0.22} ${height * 0.16}, ${width * 0.54} ${height * 0.36}, ${width} ${height * 0.2}`}
              stroke="rgba(71,56,120,0.14)"
              strokeWidth="1.4"
              fill="none"
            />
            <Path
              d={`M 0 ${height * 0.72} C ${width * 0.2} ${height * 0.62}, ${width * 0.56} ${height * 0.9}, ${width} ${height * 0.74}`}
              stroke="rgba(71,56,120,0.12)"
              strokeWidth="1.2"
              fill="none"
            />
            <Circle cx={width * 0.82} cy={height * 0.18} r="42" fill="rgba(255,177,102,0.34)" />
            <Circle cx={width * 0.82} cy={height * 0.18} r="19" fill="rgba(255,255,255,0.82)" />
            <Circle cx={width * 0.18} cy={height * 0.82} r="58" fill="rgba(23,24,45,0.12)" />
          </Svg>
        </Animated.View>
      )}

      {sparkles.map((sparkle, index) => (
        <FloatingSparkle key={index} sparkle={sparkle} motion={twinkle} reducedMotion={reducedMotion} />
      ))}

      <View pointerEvents="none" style={styles.topRule} />
      <View pointerEvents="none" style={styles.sideRule} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  sunGlow: {
    position: 'absolute',
    top: -120,
    right: -20,
    width: 310,
    height: 310,
    borderRadius: 999,
    backgroundColor: 'rgba(255,188,117,0.42)',
  },
  plumGlow: {
    position: 'absolute',
    top: height * 0.26,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: 'rgba(176,78,199,0.16)',
  },
  bottomGlow: {
    position: 'absolute',
    left: -90,
    bottom: 40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(18,200,178,0.14)',
  },
  inkPool: {
    position: 'absolute',
    left: -80,
    bottom: -110,
    width: 290,
    height: 290,
    borderRadius: 999,
    backgroundColor: 'rgba(56,37,92,0.14)',
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  topRule: {
    position: 'absolute',
    top: height * 0.18,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(71,56,120,0.10)',
  },
  sideRule: {
    position: 'absolute',
    top: 24,
    bottom: 24,
    right: 28,
    width: 1,
    backgroundColor: 'rgba(71,56,120,0.08)',
  },
});
