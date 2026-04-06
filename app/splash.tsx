/**
 * CosmicSelf — Animated Splash Screen
 *
 * Displays while the app loads, then navigates to the main app.
 * Uses Reanimated for fade-in / scale animation of the logo and text.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { COLORS, FONTS, TYPE } from '../src/constants/theme';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.52;

// ── Cosmic Orb SVG ──────────────────────────────────────────────────────────
function CosmicOrb() {
  const c = ORB_SIZE / 2;
  const r = ORB_SIZE * 0.32;

  const star = (cx: number, cy: number, outer: number, inner: number) =>
    [
      `M ${cx} ${cy - outer}`,
      `Q ${cx + inner * 0.4} ${cy - inner * 0.4} ${cx + outer} ${cy}`,
      `Q ${cx + inner * 0.4} ${cy + inner * 0.4} ${cx} ${cy + outer}`,
      `Q ${cx - inner * 0.4} ${cy + inner * 0.4} ${cx - outer} ${cy}`,
      `Q ${cx - inner * 0.4} ${cy - inner * 0.4} ${cx} ${cy - outer}`,
      'Z',
    ].join(' ');

  return (
    <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox={`0 0 ${ORB_SIZE} ${ORB_SIZE}`}>
      <Defs>
        <RadialGradient id="aOrbGrad" cx="40%" cy="38%" r="55%">
          <Stop offset="0%" stopColor="#A89EFF" />
          <Stop offset="40%" stopColor={COLORS.western} />
          <Stop offset="75%" stopColor={COLORS.teal} />
          <Stop offset="100%" stopColor="#007A72" />
        </RadialGradient>
        <RadialGradient id="aGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.55} />
          <Stop offset="50%" stopColor={COLORS.western} stopOpacity={0.15} />
          <Stop offset="100%" stopColor={COLORS.western} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Circle cx={c} cy={c} r={r * 1.6} fill="url(#aGlow)" opacity={0.6} />
      <Path d={star(c, c, r * 1.55, r * 0.3)} fill={COLORS.gold} opacity={0.3} />
      <G rotation={45} origin={`${c}, ${c}`}>
        <Path d={star(c, c, r * 1.15, r * 0.22)} fill={COLORS.gold} opacity={0.18} />
      </G>
      <Circle cx={c} cy={c} r={r} fill="url(#aOrbGrad)" />
      <Circle
        cx={c - r * 0.2}
        cy={c - r * 0.25}
        r={r * 0.4}
        fill="white"
        opacity={0.13}
      />
      <Circle cx={c} cy={c} r={r * 0.1} fill={COLORS.gold} opacity={0.85} />
    </Svg>
  );
}

// ── Splash Screen ────────────────────────────────────────────────────────────
const TOTAL_DURATION = 2800; // ms before navigating away

export default function SplashScreen() {
  const router = useRouter();

  // Shared values
  const orbOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.6);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(18);
  const taglineOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Phase 1: Orb fades in and scales up
    orbOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    orbScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.3)) });

    // Phase 2: Title slides up and fades in
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Phase 3: Tagline fades in
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

    // Phase 4: Fade out everything, then navigate
    containerOpacity.value = withDelay(
      TOTAL_DURATION - 400,
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(navigateAway)();
        }
      }),
    );
  }, []);

  const navigateAway = () => {
    router.replace('/');
  };

  // Animated styles
  const orbAnimStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, containerAnimStyle]}>
      <LinearGradient
        colors={['#0a0a2e', '#1a1a4e', '#2d1b69']}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View style={orbAnimStyle}>
            <CosmicOrb />
          </Animated.View>

          <Animated.Text style={[styles.title, titleAnimStyle]}>
            CosmicSelf
          </Animated.Text>

          <Animated.Text style={[styles.tagline, taglineAnimStyle]}>
            4 Systems. One You.
          </Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPE.hero.fontSize,
    letterSpacing: TYPE.hero.letterSpacing,
    color: COLORS.gold,
    marginTop: 28,
    textShadowColor: 'rgba(255, 215, 0, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    fontFamily: FONTS.accent,
    fontSize: TYPE.subhead.fontSize,
    letterSpacing: TYPE.subhead.letterSpacing + 2,
    color: COLORS.textSecondary,
    marginTop: 12,
    textTransform: 'uppercase',
  },
});
