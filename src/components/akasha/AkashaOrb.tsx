import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

interface Props {
  mode: 'idle' | 'asking';
  size?: number;
}

const PARTICLE_COUNT = 6;

export function AkashaOrb({ mode, size = 140 }: Props) {
  const scale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.4);
  const ringRotate = useSharedValue(0);
  const particleProgress = useSharedValue(0);
  const innerShimmer = useSharedValue(0);

  useEffect(() => {
    const duration = mode === 'asking' ? 900 : 2800;
    const peak = mode === 'asking' ? 1.08 : 1.04;

    scale.value = withRepeat(
      withTiming(peak, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    haloOpacity.value = withRepeat(
      withTiming(mode === 'asking' ? 0.7 : 0.5, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    ringRotate.value = withRepeat(
      withTiming(1, {
        duration: mode === 'asking' ? 6000 : 14000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    particleProgress.value = withRepeat(
      withTiming(1, {
        duration: mode === 'asking' ? 4000 : 9000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    innerShimmer.value = withRepeat(
      withTiming(1, {
        duration: mode === 'asking' ? 1400 : 3600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(haloOpacity);
      cancelAnimation(ringRotate);
      cancelAnimation(particleProgress);
      cancelAnimation(innerShimmer);
    };
  }, [mode, scale, haloOpacity, ringRotate, particleProgress, innerShimmer]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value * 360}deg` }],
  }));
  const counterRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-ringRotate.value * 360}deg` }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(innerShimmer.value, [0, 1], [0.15, 0.55]),
  }));

  const particleOffsets = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        phase: i / PARTICLE_COUNT,
        radius: size * (0.58 + (i % 2) * 0.08),
        dotSize: 3 + (i % 3),
      })),
    [size]
  );

  return (
    <View style={[styles.wrap, { width: size * 1.6, height: size * 1.6 }]}>
      <Animated.View
        style={[
          styles.halo,
          { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 },
          haloStyle,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            width: size * 1.35,
            height: size * 1.35,
            borderRadius: size * 0.675,
          },
          ringStyle,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ringInner,
          {
            width: size * 1.15,
            height: size * 1.15,
            borderRadius: size * 0.575,
          },
          counterRingStyle,
        ]}
      />

      {particleOffsets.map((p, i) => (
        <Particle
          key={i}
          phase={p.phase}
          radius={p.radius}
          dotSize={p.dotSize}
          progress={particleProgress}
        />
      ))}

      <Animated.View style={[orbStyle, { width: size, height: size }]}>
        <LinearGradient
          colors={[COLORS.violetSoft, COLORS.violet, COLORS.violetDeep]}
          style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.8, y: 0.9 }}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            {
              width: size * 0.55,
              height: size * 0.55,
              borderRadius: size * 0.275,
              top: size * 0.12,
              left: size * 0.18,
            },
            shimmerStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
}

function Particle({
  phase,
  radius,
  dotSize,
  progress,
}: {
  phase: number;
  radius: number;
  dotSize: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const theta = (progress.value + phase) * 2 * Math.PI;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    const twinkle = 0.45 + 0.55 * Math.abs(Math.sin((progress.value + phase) * Math.PI * 2));
    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity: twinkle,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    backgroundColor: COLORS.violetSoft,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderStyle: 'dashed',
  },
  ringInner: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(236,227,255,0.22)',
  },
  orb: {
    shadowColor: COLORS.violetDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  shimmer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: COLORS.violetLight,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
