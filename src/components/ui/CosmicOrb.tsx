/**
 * CosmicOrb — Chrome/Silver 3D Sphere
 * - Photorealistic sphere: off-center white highlight + dark edge shadow
 * - Specular highlight dot (top-left bright spot)
 * - Silver ring halos with staggered pulse
 * - Sparkle constellation dots
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

function PulsingRing({ size, delay, duration, opacity = 0.5 }: {
  size: number; delay: number; duration: number; opacity?: number;
}) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: opacity, duration: duration * 0.12, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0, duration: duration * 0.88, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.15, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[
      styles.ring,
      {
        width: size, height: size, borderRadius: size / 2,
        borderColor: 'rgba(255,255,255,0.6)',
        opacity: op,
        transform: [{ scale }],
      },
    ]} />
  );
}

function ChromeSphere({ size, primaryColor, secondaryColor }: {
  size: number; primaryColor: string; secondaryColor: string;
}) {
  const breathScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, { toValue: 1.06, duration: 3000, useNativeDriver: true }),
        Animated.timing(breathScale, { toValue: 1.00, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const r = size * 0.28;
  const cx = size / 2;
  const cy = size / 2;

  // Specular highlight position (top-left quarter)
  const specX = cx - r * 0.38;
  const specY = cy - r * 0.38;

  return (
    <Animated.View style={{ transform: [{ scale: breathScale }] }}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Ambient outer glow */}
          <RadialGradient id="ambGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={primaryColor} stopOpacity={0.15} />
            <Stop offset="60%"  stopColor={primaryColor} stopOpacity={0.06} />
            <Stop offset="100%" stopColor="#000000"      stopOpacity={0} />
          </RadialGradient>
          {/* Secondary glow ring */}
          <RadialGradient id="secGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={secondaryColor} stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#000000"        stopOpacity={0} />
          </RadialGradient>
          {/* Chrome sphere — 3D photorealistic */}
          <RadialGradient id="chromeSphere" cx="36%" cy="30%" r="70%">
            <Stop offset="0%"   stopColor="#ffffff"  stopOpacity={0.95} />
            <Stop offset="18%"  stopColor="#e8e8f8"  stopOpacity={0.88} />
            <Stop offset="42%"  stopColor={primaryColor}   stopOpacity={0.80} />
            <Stop offset="70%"  stopColor={secondaryColor} stopOpacity={0.55} />
            <Stop offset="90%"  stopColor="#111122"  stopOpacity={0.85} />
            <Stop offset="100%" stopColor="#000000"  stopOpacity={0.95} />
          </RadialGradient>
          {/* Inner shine ring */}
          <RadialGradient id="innerShine" cx="50%" cy="50%" r="50%">
            <Stop offset="55%"  stopColor="transparent"    stopOpacity={0} />
            <Stop offset="82%"  stopColor={primaryColor}   stopOpacity={0.22} />
            <Stop offset="100%" stopColor={primaryColor}   stopOpacity={0} />
          </RadialGradient>
          {/* Specular highlight — bright spot top-left */}
          <RadialGradient id="specular" cx="35%" cy="30%" r="30%">
            <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.90} />
            <Stop offset="45%"  stopColor="#ffffff" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Ambient outer glow */}
        <Circle cx={cx} cy={cy} r={size * 0.48} fill="url(#ambGlow)" />
        <Circle cx={cx} cy={cy} r={size * 0.42} fill="url(#secGlow)" />

        {/* Main chrome sphere */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#chromeSphere)" />

        {/* Inner shine ring */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#innerShine)" />

        {/* Specular highlight (3D depth cue) */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#specular)" />

        {/* Equator reflection line */}
        <Ellipse
          cx={cx} cy={cy + r * 0.05}
          rx={r * 0.85} ry={r * 0.12}
          fill="none"
          stroke={primaryColor}
          strokeWidth={0.6}
          opacity={0.18}
        />

        {/* Sparkle constellation */}
        {[
          { a: 42,  d: 0.62 }, { a: 138, d: 0.60 },
          { a: 228, d: 0.64 }, { a: 318, d: 0.61 },
          { a: 80,  d: 0.75 }, { a: 190, d: 0.72 },
          { a: 265, d: 0.76 }, { a: 355, d: 0.73 },
        ].map((dot, i) => {
          const rad = (dot.a * Math.PI) / 180;
          const dx = cx + Math.cos(rad) * size * dot.d * 0.5;
          const dy = cy + Math.sin(rad) * size * dot.d * 0.5;
          return (
            <Circle
              key={i}
              cx={dx} cy={dy}
              r={i < 4 ? 2.0 : 1.2}
              fill="#ffffff"
              opacity={i < 4 ? 0.80 : 0.45}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

interface CosmicOrbProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function CosmicOrb({
  size = 220,
  primaryColor = '#7C6DFF',
  secondaryColor = '#00E5D1',
}: CosmicOrbProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pulsing rings */}
      <View style={styles.absoluteCenter}>
        <PulsingRing size={size * 0.95} delay={0}    duration={2600} opacity={0.40} />
      </View>
      <View style={styles.absoluteCenter}>
        <PulsingRing size={size * 0.95} delay={867}  duration={2600} opacity={0.28} />
      </View>
      <View style={styles.absoluteCenter}>
        <PulsingRing size={size * 0.95} delay={1734} duration={2600} opacity={0.20} />
      </View>

      {/* Chrome sphere */}
      <View style={styles.absoluteCenter}>
        <ChromeSphere size={size} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
});
