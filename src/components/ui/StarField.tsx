/**
 * StarField — Obsidian Glass background
 * Pure black cosmos: white star particles, silver nebula sweep,
 * perspective grid, chrome halo stars
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

function seed(s: number) {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

function TwinkleStar({ x, y, size, peak, delay, duration }: {
  x: number; y: number; size: number; peak: number; delay: number; duration: number;
}) {
  const op = useRef(new Animated.Value(peak * 0.1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: peak, duration, useNativeDriver: true }),
        Animated.timing(op, { toValue: peak * 0.08, duration: duration * 1.3, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#fff', opacity: op,
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
            <Stop offset="20%"  stopColor="#dde2ff" stopOpacity={0.70} />
            <Stop offset="55%"  stopColor="#8888aa" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function StarField({ children }: { children: React.ReactNode }) {
  const data = useMemo(() => {
    // 90 static white-to-blue-white dim stars
    const staticStars = Array.from({ length: 90 }).map((_, i) => ({
      x: seed(i * 7 + 1) * width,
      y: seed(i * 13 + 3) * height,
      s: seed(i * 3 + 5) * 2.2 + 0.4,
      o: seed(i * 11 + 7) * 0.38 + 0.10,
      warm: seed(i * 17 + 9) > 0.7,
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
      {/* ── Layer 0: Deep charcoal base — not pure black ── */}
      <LinearGradient
        colors={['#12121e', '#0e0e18', '#181824', '#0c0c16']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Layer 1: Nebula sweeps — more visible ── */}
      {/* Top-left: soft indigo mist */}
      <LinearGradient
        colors={['rgba(100,90,200,0.22)', 'rgba(80,70,180,0.10)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.nebula, { width: width * 1.2, height: height * 0.50, top: -height * 0.05, left: -width * 0.1 }]}
      />
      {/* Bottom-right: teal/blue mist */}
      <LinearGradient
        colors={['rgba(40,120,160,0.18)', 'rgba(30,90,130,0.08)', 'transparent']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.nebula, { width: width * 1.0, height: height * 0.45, bottom: -height * 0.05, right: -width * 0.1 }]}
      />
      {/* Center: warm silver-rose bloom */}
      <LinearGradient
        colors={['rgba(160,120,200,0.10)', 'rgba(180,140,220,0.05)', 'transparent']}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 0.85 }}
        style={[styles.nebula, { width: width * 0.8, height: height * 0.4, top: height * 0.3, left: width * 0.1 }]}
      />
      {/* Galaxy arm diagonal sweep */}
      <LinearGradient
        colors={['transparent', 'rgba(180,180,240,0.07)', 'rgba(200,200,255,0.12)', 'rgba(180,180,240,0.06)', 'transparent']}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 1, y: 0.75 }}
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
          backgroundColor: s.warm ? '#ffffff' : '#dde2ff',
        }} />
      ))}

      {/* ── Layer 4: Twinkling stars ── */}
      {data.twinkle.map((s) => (
        <TwinkleStar key={s.id} {...s} />
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
