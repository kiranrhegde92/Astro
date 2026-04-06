/**
 * CosmicSelf Splash Screen — Static Component
 *
 * Deep space gradient with glowing orb, app title in gold,
 * and the "4 Systems. One You." tagline.
 *
 * Intended as a presentational reference; see app/splash.tsx
 * for the animated version used at runtime.
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { COLORS, FONTS, TYPE } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');
const ORB_SIZE = width * 0.52;

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
        <RadialGradient id="splashOrbGrad" cx="40%" cy="38%" r="55%">
          <Stop offset="0%" stopColor="#A89EFF" />
          <Stop offset="40%" stopColor={COLORS.western} />
          <Stop offset="75%" stopColor={COLORS.teal} />
          <Stop offset="100%" stopColor="#007A72" />
        </RadialGradient>
        <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.55} />
          <Stop offset="50%" stopColor={COLORS.western} stopOpacity={0.15} />
          <Stop offset="100%" stopColor={COLORS.western} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Glow halo */}
      <Circle cx={c} cy={c} r={r * 1.6} fill="url(#splashGlow)" opacity={0.6} />

      {/* Star burst */}
      <Path d={star(c, c, r * 1.55, r * 0.3)} fill={COLORS.gold} opacity={0.3} />
      <G rotation={45} origin={`${c}, ${c}`}>
        <Path d={star(c, c, r * 1.15, r * 0.22)} fill={COLORS.gold} opacity={0.18} />
      </G>

      {/* Main orb */}
      <Circle cx={c} cy={c} r={r} fill="url(#splashOrbGrad)" />

      {/* Specular highlight */}
      <Circle
        cx={c - r * 0.2}
        cy={c - r * 0.25}
        r={r * 0.4}
        fill="white"
        opacity={0.13}
      />

      {/* Center gold dot */}
      <Circle cx={c} cy={c} r={r * 0.1} fill={COLORS.gold} opacity={0.85} />
    </Svg>
  );
}

export default function SplashComponent() {
  return (
    <LinearGradient
      colors={['#0a0a2e', '#1a1a4e', '#2d1b69']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.content}>
        <CosmicOrb />

        <Text style={styles.title}>CosmicSelf</Text>

        <Text style={styles.tagline}>4 Systems. One You.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
