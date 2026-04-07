/**
 * StarField — immersive cosmic backdrop with Three.js-inspired multi-layer animations:
 *   • Deep star field: 3 depth layers (far / mid / near), each subdivided into 4 twinkle
 *     groups that oscillate at different speeds and phases — hundreds of stars, low overhead.
 *   • Constellation lines: faint SVG lines connecting nearby bright stars.
 *   • Shooting stars: occasional diagonal streak with a gradient trail.
 *   • Galaxy rotation: the far-star layer rotates very slowly (iOS only).
 *   • Atmospheric nebulae: 4 coloured blobs that breathe in scale + opacity.
 *   • Orbital ring: two bezier arcs rotating around the scene centre.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const isAndroid = Platform.OS === 'android';

/* ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────── */
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Star generation ───────────────────────────────────────────────────── */
interface StarDot {
  x: number; y: number;
  r: number; opacity: number;
  group: number; // 0-3, determines which twinkle animation it follows
}

function generateStars(count: number, seed: number, w: number, h: number, minR = 0.3, maxR = 1.4, minOp = 0.12, maxOp = 0.6): StarDot[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: rng() * w,
    y: rng() * h,
    r: minR + rng() * (maxR - minR),
    opacity: minOp + rng() * (maxOp - minOp),
    group: i % 4,
  }));
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface StarFieldProps {
  children?: React.ReactNode;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export function StarField({ children }: StarFieldProps) {
  const { width, height } = useWindowDimensions();

  /* Twinkle groups — 4 shared values, different periods & start phases */
  const tw0 = useSharedValue(1.0);
  const tw1 = useSharedValue(0.55);
  const tw2 = useSharedValue(0.35);
  const tw3 = useSharedValue(0.78);

  /* Atmospheric glow */
  const glow1 = useSharedValue(0);
  const glow2 = useSharedValue(0);
  const glow3 = useSharedValue(0);
  const glow4 = useSharedValue(0);

  /* Orbital ring */
  const orbitRot = useSharedValue(0);

  /* Galaxy slow-rotation (far layer, iOS only) */
  const galaxyRot = useSharedValue(0);

  /* Shooting star */
  const shootX      = useSharedValue(-200);
  const shootY      = useSharedValue(100);
  const shootOp     = useSharedValue(0);
  const shootTrailW = useSharedValue(0);

  const shootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /* ── Twinkle ── */
    const D = isAndroid ? 0.75 : 1; // speed multiplier

    tw0.value = withRepeat(
      withSequence(
        withTiming(0.22, { duration: 1900 * D, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0,  { duration: 1900 * D, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
    tw1.value = withDelay(650, withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1500 * D, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 1500 * D, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    ));
    tw2.value = withDelay(1300, withRepeat(
      withSequence(
        withTiming(0.28, { duration: 1100 * D, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.96, { duration: 1100 * D, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    ));
    tw3.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(0.18, { duration: 850 * D, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0,  { duration: 850 * D, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    ));

    /* ── Atmospheric ── */
    const atm = isAndroid ? 9000 : 13000;
    glow1.value = withRepeat(withSequence(
      withTiming(1, { duration: atm,       easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: atm,       easing: Easing.inOut(Easing.sin) }),
    ), -1, false);
    glow2.value = withDelay(atm * 0.35, withRepeat(withSequence(
      withTiming(1, { duration: atm * 1.2, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: atm * 1.2, easing: Easing.inOut(Easing.sin) }),
    ), -1, false));
    glow3.value = withDelay(atm * 0.6, withRepeat(withSequence(
      withTiming(1, { duration: atm * 0.85, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: atm * 0.85, easing: Easing.inOut(Easing.sin) }),
    ), -1, false));
    glow4.value = withDelay(atm * 0.8, withRepeat(withSequence(
      withTiming(1, { duration: atm * 1.4, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: atm * 1.4, easing: Easing.inOut(Easing.sin) }),
    ), -1, false));

    /* ── Orbit ── */
    orbitRot.value = withRepeat(
      withTiming(1, { duration: isAndroid ? 18000 : 26000, easing: Easing.linear }),
      -1, false,
    );

    /* ── Galaxy rotation ── (iOS only — SVG + perspective transform bugs on Android) */
    if (!isAndroid) {
      galaxyRot.value = withRepeat(
        withTiming(360, { duration: 55000, easing: Easing.linear }),
        -1, false,
      );
    }

    /* ── Shooting star ── */
    const fire = () => {
      // start position: upper-left quadrant
      const sx = 30 + Math.random() * (width * 0.4);
      const sy = 20 + Math.random() * (height * 0.25);

      shootX.value   = sx;
      shootY.value   = sy;
      shootOp.value  = 0;
      shootTrailW.value = 0;

      shootOp.value  = withSequence(
        withTiming(1,   { duration: 80  }),
        withTiming(0.9, { duration: 320 }),
        withTiming(0,   { duration: 220 }),
      );
      shootX.value = withTiming(sx + 220, { duration: 620, easing: Easing.out(Easing.quad) });
      shootY.value = withTiming(sy + 95,  { duration: 620, easing: Easing.out(Easing.quad) });
      shootTrailW.value = withSequence(
        withTiming(72, { duration: 80  }),
        withTiming(0,  { duration: 540 }),
      );

      const next = 4500 + Math.random() * 7000;
      shootTimerRef.current = setTimeout(fire, next);
    };
    shootTimerRef.current = setTimeout(fire, 2500 + Math.random() * 2500);

    return () => {
      if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Star data (memoised — recalculated only when screen size changes) ── */
  const { farStars, midStars, nearStars } = useMemo(() => {
    const far  = isAndroid ? 35 : 60;
    const mid  = isAndroid ? 18 : 32;
    const near = isAndroid ?  7 : 13;
    return {
      farStars:  generateStars(far,  0xdeadbeef, width, height, 0.25, 1.1,  0.08, 0.35),
      midStars:  generateStars(mid,  0xcafebabe, width, height, 0.7,  1.8,  0.25, 0.58),
      nearStars: generateStars(near, 0x12345678, width, height, 1.4,  2.8,  0.50, 0.88),
    };
  }, [width, height]);

  /* ── Constellation pairs (connect nearby near-stars) ── */
  const constellationPairs = useMemo(() => {
    const pairs: [number, number][] = [];
    const threshold = width * 0.22;
    for (let i = 0; i < nearStars.length; i++) {
      for (let j = i + 1; j < nearStars.length; j++) {
        const dx = nearStars[i].x - nearStars[j].x;
        const dy = nearStars[i].y - nearStars[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs.slice(0, 8); // cap at 8 lines
  }, [nearStars, width]);

  /* ── Grouped stars for SVG rendering ── */
  const farByGroup  = useMemo(() => [0,1,2,3].map(g => farStars.filter(s => s.group === g)),  [farStars]);
  const midByGroup  = useMemo(() => [0,1,2,3].map(g => midStars.filter(s => s.group === g)),  [midStars]);

  /* ── Animated styles ── */
  const twStyles = [
    useAnimatedStyle(() => ({ opacity: tw0.value })),
    useAnimatedStyle(() => ({ opacity: tw1.value })),
    useAnimatedStyle(() => ({ opacity: tw2.value })),
    useAnimatedStyle(() => ({ opacity: tw3.value })),
  ];

  const glowStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(glow1.value, [0, 1], [0.16, 0.34]),
    transform: [{ scale: interpolate(glow1.value, [0, 1], [0.94, 1.10]) }],
  }));
  const glowStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(glow2.value, [0, 1], [0.10, 0.26]),
    transform: [{ scale: interpolate(glow2.value, [0, 1], [0.90, 1.14]) }],
  }));
  const glowStyle3 = useAnimatedStyle(() => ({
    opacity: interpolate(glow3.value, [0, 1], [0.12, 0.30]),
    transform: [{ scale: interpolate(glow3.value, [0, 1], [0.96, 1.08]) }],
  }));
  const glowStyle4 = useAnimatedStyle(() => ({
    opacity: interpolate(glow4.value, [0, 1], [0.08, 0.20]),
    transform: [{ scale: interpolate(glow4.value, [0, 1], [0.86, 1.02]) }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${orbitRot.value * 360}deg` }],
  }));
  const galaxyStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${galaxyRot.value}deg` }],
  }));
  const shootStyle = useAnimatedStyle(() => ({
    opacity:   shootOp.value,
    left:      shootX.value,
    top:       shootY.value,
    width:     shootTrailW.value,
  }));

  /* ── SVG colours ── */
  const FAR_COL  = '#7c7fc4';
  const MID_COL  = '#8e89d4';
  const NEAR_COL = '#b0a8f0';
  const CONST_COL = 'rgba(130,120,210,0.11)';

  /* ── Orbital path helpers ── */
  const cx = width / 2;
  const cy = height * 0.38;
  const rx = width * 0.44;
  const ry = height * 0.14;

  const orbitPath = `M ${cx - rx} ${cy} Q ${cx - rx * 0.3} ${cy - ry * 2.6} ${cx + rx} ${cy} Q ${cx + rx * 0.3} ${cy + ry * 2.6} ${cx - rx} ${cy}`;

  return (
    <LinearGradient colors={['#fff8f2', '#f4ebf8', '#ddd5ff']} style={styles.root}>

      {/* ── Atmospheric nebula blobs ── */}
      <Animated.View pointerEvents="none" style={[
        styles.blob, glowStyle1,
        { width: width * 0.74, height: width * 0.74, borderRadius: width * 0.37,
          backgroundColor: '#f5d4b2', right: -width * 0.18, top: -width * 0.12 },
      ]} />
      <Animated.View pointerEvents="none" style={[
        styles.blob, glowStyle2,
        { width: width * 0.58, height: width * 0.58, borderRadius: width * 0.29,
          backgroundColor: '#c9b4e8', right: -width * 0.14, top: height * 0.26 },
      ]} />
      <Animated.View pointerEvents="none" style={[
        styles.blob, glowStyle3,
        { width: width * 0.52, height: width * 0.52, borderRadius: width * 0.26,
          backgroundColor: '#a8c4e8', bottom: height * 0.08, left: -width * 0.16 },
      ]} />
      <Animated.View pointerEvents="none" style={[
        styles.blob, glowStyle4,
        { width: width * 0.46, height: width * 0.46, borderRadius: width * 0.23,
          backgroundColor: '#7b5ea0', bottom: -width * 0.08, left: width * 0.08 },
      ]} />

      {/* ── FAR star layer — galaxy-rotation wrapper (iOS) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          isAndroid ? undefined : galaxyStyle,
        ]}
      >
        {farByGroup.map((group, gi) => (
          <Animated.View key={`far${gi}`} style={[StyleSheet.absoluteFillObject, twStyles[gi]]}>
            <Svg width={width} height={height}>
              {group.map((s, si) => (
                <Circle key={si} cx={s.x} cy={s.y} r={s.r} fill={FAR_COL} fillOpacity={s.opacity} />
              ))}
            </Svg>
          </Animated.View>
        ))}
      </Animated.View>

      {/* ── MID star layer ── */}
      {midByGroup.map((group, gi) => (
        <Animated.View key={`mid${gi}`} pointerEvents="none" style={[StyleSheet.absoluteFillObject, twStyles[(gi + 1) % 4]]}>
          <Svg width={width} height={height}>
            {group.map((s, si) => (
              <Circle key={si} cx={s.x} cy={s.y} r={s.r} fill={MID_COL} fillOpacity={s.opacity} />
            ))}
          </Svg>
        </Animated.View>
      ))}

      {/* ── NEAR star layer + constellation lines (static — no per-star animation) ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Svg width={width} height={height}>
          {/* Constellation lines */}
          {constellationPairs.map(([a, b], i) => (
            <Line
              key={i}
              x1={nearStars[a].x} y1={nearStars[a].y}
              x2={nearStars[b].x} y2={nearStars[b].y}
              stroke={CONST_COL}
              strokeWidth={0.9}
            />
          ))}
          {/* Glow halos for near stars */}
          {nearStars.map((s, i) => (
            <Circle key={`halo${i}`} cx={s.x} cy={s.y} r={s.r * 3} fill={NEAR_COL} fillOpacity={0.06} />
          ))}
          {/* Near star dots */}
          {nearStars.map((s, i) => (
            <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={NEAR_COL} fillOpacity={s.opacity} />
          ))}
        </Svg>
      </View>

      {/* ── Shooting star ── */}
      <Animated.View pointerEvents="none" style={[styles.shootingStar, shootStyle]} />

      {/* ── Orbital bezier arcs ── */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, orbitStyle]}>
        <Svg width={width} height={height}>
          <Path
            d={orbitPath}
            stroke="rgba(140,130,200,0.12)"
            strokeWidth={1}
            fill="none"
            strokeDasharray="4 7"
          />
          {/* Sun marker on orbit */}
          <Circle cx={cx + rx} cy={cy} r={3} fill="rgba(255,180,100,0.55)" />
          {/* Moon marker on opposite side */}
          <Circle cx={cx - rx} cy={cy} r={2} fill="rgba(110,100,190,0.40)" />
        </Svg>
      </Animated.View>

      {/* ── Content ── */}
      <View style={StyleSheet.absoluteFillObject}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
  },
  shootingStar: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    // Gradient-like using shadow glow
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 0,
    // Diagonal tilt
    transform: [{ rotate: '23deg' }],
    // Actual white core
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.85)',
  },
});
