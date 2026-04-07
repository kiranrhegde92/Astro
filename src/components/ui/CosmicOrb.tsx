import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';

interface CosmicOrbProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function CosmicOrb({
  size = 220,
  primaryColor = '#f08a5d',
  secondaryColor = '#6a73d9',
}: CosmicOrbProps) {
  const reducedMotion = Platform.OS === 'android';
  const float = useSharedValue(0);
  const orbit = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      float.value = 0;
      orbit.value = 0;
      return;
    }

    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    orbit.value = withRepeat(withTiming(1, { duration: 15000, easing: Easing.linear }), -1, false);
  }, [float, orbit, reducedMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reducedMotion ? 0 : interpolate(float.value, [0, 1], [-6, 10]) },
      { rotateZ: `${reducedMotion ? 0 : interpolate(float.value, [0, 1], [-1.4, 1.4])}deg` },
    ],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: reducedMotion
      ? [{ scale: 1 }]
      : [
          { perspective: 1100 },
          { rotateX: `${interpolate(float.value, [0, 1], [6, 11])}deg` },
          { rotateY: `${interpolate(float.value, [0, 1], [-10, 8])}deg` },
          { scale: interpolate(float.value, [0, 1], [0.98, 1.02]) },
        ],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${reducedMotion ? 0 : orbit.value * 360}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0.24 : interpolate(float.value, [0, 1], [0.2, 0.38]),
    transform: [{ scale: reducedMotion ? 1 : interpolate(float.value, [0, 1], [0.94, 1.12]) }],
  }));

  const center = size / 2;
  const trackSize = size * 0.72;
  const moonSize = size * 0.09;

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }, wrapStyle]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, coreStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="sunCore" cx="35%" cy="32%" r="70%">
              <Stop offset="0%" stopColor="#fffaf1" />
              <Stop offset="28%" stopColor="#ffe6c1" />
              <Stop offset="52%" stopColor="#f7c57c" />
              <Stop offset="100%" stopColor={primaryColor} />
            </RadialGradient>
            <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={secondaryColor} stopOpacity="0.24" />
              <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Ellipse cx={center} cy={center + size * 0.3} rx={size * 0.2} ry={size * 0.06} fill="rgba(27,34,51,0.12)" />
          <Circle cx={center} cy={center} r={size * 0.48} fill="url(#sunGlow)" />
          <Circle cx={center} cy={center} r={size * 0.36} fill="none" stroke="rgba(40,49,73,0.10)" strokeWidth="1.3" />
          <Circle cx={center} cy={center} r={size * 0.24} fill="url(#sunCore)" />
          <Circle cx={center - size * 0.055} cy={center - size * 0.055} r={size * 0.04} fill="rgba(255,255,255,0.62)" />
          <Circle cx={center - size * 0.23} cy={center + size * 0.22} r={size * 0.02} fill="rgba(255,255,255,0.88)" />
          <Line x1={center - size * 0.4} y1={center} x2={center + size * 0.4} y2={center} stroke="rgba(40,49,73,0.10)" strokeWidth="1" />
        </Svg>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.orbitLayer, orbitStyle]}>
        <View
          style={[
            styles.orbitTrack,
            {
              width: trackSize,
              height: trackSize,
              borderRadius: trackSize / 2,
              top: center - trackSize / 2,
              left: center - trackSize / 2,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.orbitGlow,
              glowStyle,
              {
                width: moonSize * 1.8,
                height: moonSize * 1.8,
                borderRadius: moonSize * 0.9,
                top: size * 0.02,
                right: size * 0.005,
                backgroundColor: secondaryColor,
              },
            ]}
          />
          <View
            style={[
              styles.orbitMoon,
              {
                width: moonSize,
                height: moonSize,
                borderRadius: moonSize / 2,
                top: size * 0.045,
                right: size * 0.03,
                backgroundColor: secondaryColor,
                shadowColor: secondaryColor,
              },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  orbitTrack: {
    position: 'absolute',
  },
  orbitGlow: {
    position: 'absolute',
    opacity: 0.22,
  },
  orbitMoon: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});
