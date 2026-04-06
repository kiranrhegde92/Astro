/**
 * StarField — Obsidian Glass background
 * Pure black cosmos: white star particles, silver nebula sweep,
 * perspective grid, chrome halo stars
 */
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

function seed(s: number) {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

function TwinkleStar({ x, y, size, peak, delay, duration, reduced }: {
  x: number; y: number; size: number; peak: number; delay: number; duration: number; reduced: boolean;
}) {
  const op = useRef(new Animated.Value(reduced ? peak * 0.45 : peak * 0.1)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: peak, duration, useNativeDriver: true }),
        Animated.timing(op, { toValue: peak * 0.08, duration: duration * 1.3, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduced]);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#ffffff', opacity: op,
    }} />
  );
}

// Chrome halo star — white center with silver fade
function ChromeStar({ x, y, r, id }: { x: number; y: number; r: number; id: string }) {
  return (
    <View style={{ position: 'absolute', left: x - r, top: y - r }}>
      <Svg width={r * 2} height={r * 2}>
        <Defs>
          <RadialGradient id={id} cx="38%" cy="35%" r="60%">
            <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.95} />
            <Stop offset="20%"  stopColor="#e0d8ff" stopOpacity={0.65} />
            <Stop offset="55%"  stopColor="#9080cc" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function StarField({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  const data = useMemo(() => {
    // 90 soft dust-mote stars — purple/teal on pale bg
    const staticStars = Array.from({ length: 90 }).map((_, i) => ({
      x: seed(i * 7 + 1) * width,
      y: seed(i * 13 + 3) * height,
      s: seed(i * 3 + 5) * 2.2 + 0.5,
      o: seed(i * 11 + 7) * 0.35 + 0.12,
      warm: seed(i * 17 + 9) > 0.5,
    }));

    // 22 twinkling stars
    const twinkle = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: seed(i * 29 + 11) * width,
      y: seed(i * 37 + 17) * height,
      size: seed(i * 41 + 7) * 2.4 + 1.0,
      peak: seed(i * 43 + 13) * 0.70 + 0.40,
      delay: seed(i * 47 + 19) * 5000,
      duration: 1200 + seed(i * 53 + 23) * 2500,
    }));

    // 6 large chrome halo stars
    const halo = Array.from({ length: 6 }).map((_, i) => ({
      id: `ch${i}`,
      x: seed(i * 71 + 31) * (width - 60) + 30,
      y: seed(i * 79 + 41) * (height - 60) + 30,
      r: 12 + seed(i * 83 + 53) * 18,
    }));

    return { staticStars, twinkle, halo };
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Layer 0: Deep amethyst — rich purple, not black ── */}
      <LinearGradient
        colors={['#2d2860', '#26225a', '#302a68', '#221e52']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Layer 1: Strong nebula washes ── */}
      {/* Top-left: bright violet cloud */}
      <LinearGradient
        colors={['rgba(160,120,255,0.55)', 'rgba(130,100,240,0.28)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.nebula, { width: width * 1.2, height: height * 0.55, top: -height * 0.05, left: -width * 0.1 }]}
      />
      {/* Bottom-right: electric teal bloom */}
      <LinearGradient
        colors={['rgba(0,220,200,0.38)', 'rgba(0,180,200,0.18)', 'transparent']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.nebula, { width: width * 1.1, height: height * 0.50, bottom: -height * 0.05, right: -width * 0.1 }]}
      />
      {/* Center: rose-pink cosmic bloom */}
      <LinearGradient
        colors={['rgba(255,150,200,0.22)', 'rgba(220,120,180,0.10)', 'transparent']}
        start={{ x: 0.5, y: 0.25 }}
        end={{ x: 0.5, y: 0.85 }}
        style={[styles.nebula, { width: width * 0.9, height: height * 0.45, top: height * 0.28, left: width * 0.05 }]}
      />
      {/* Galaxy arm: strong white diagonal sweep */}
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.12)', 'transparent']}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 1, y: 0.75 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* White frosted veil — lifts the overall brightness */}
      <LinearGradient
        colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.12)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Layer 2: Chrome halo stars ── */}
      {data.halo.map((s) => (
        <ChromeStar key={s.id} {...s} />
      ))}

      {/* ── Layer 3: Static dim stars ── */}
      {data.staticStars.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.s, height: s.s, borderRadius: s.s / 2,
          opacity: s.o,
          backgroundColor: s.warm ? '#ffffff' : '#c8c0ff',
        }} />
      ))}

      {/* ── Layer 4: Twinkling stars ── */}
      {data.twinkle.map((s) => (
        <TwinkleStar key={s.id} {...s} reduced={reducedMotion} />
      ))}

      {/* ── Content ── */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  nebula: { position: 'absolute', borderRadius: 9999 },
});
