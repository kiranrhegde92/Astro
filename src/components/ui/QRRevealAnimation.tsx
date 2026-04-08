/**
 * QRRevealAnimation
 *
 * Tap the QR card → full-screen modal appears.
 * Phase 1: Rashi medallion shown at 75° tilt (edge-on perspective).
 * Phase 2: Card rotates to 0° (face-on) — reveals the QR code.
 *
 * Pure Reanimated — no 3D library required.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

// ─── Screen metrics ──────────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get('window');
const CARD = Math.min(SW - 64, 300);

// ─── Rashi metadata ──────────────────────────────────────────────────────────

const RASHI: Record<
  string,
  { symbol: string; western: string; element: string; grad: readonly [string, string, string]; accent: string }
> = {
  Mesha:     { symbol: '♈', western: 'Aries',       element: 'Fire',  accent: '#ff6b6b', grad: ['#2a0808', '#6b1010', '#ff6b6b'] },
  Vrishabha: { symbol: '♉', western: 'Taurus',      element: 'Earth', accent: '#6bcf7f', grad: ['#07200f', '#1a5c30', '#6bcf7f'] },
  Mithuna:   { symbol: '♊', western: 'Gemini',      element: 'Air',   accent: '#74b9ff', grad: ['#041830', '#0a4a8c', '#74b9ff'] },
  Karka:     { symbol: '♋', western: 'Cancer',       element: 'Water', accent: '#81ecec', grad: ['#042020', '#066060', '#81ecec'] },
  Simha:     { symbol: '♌', western: 'Leo',         element: 'Fire',  accent: '#fdcb6e', grad: ['#231000', '#7a3500', '#fdcb6e'] },
  Kanya:     { symbol: '♍', western: 'Virgo',       element: 'Earth', accent: '#a8e6cf', grad: ['#0a1f16', '#215c3a', '#a8e6cf'] },
  Tula:      { symbol: '♎', western: 'Libra',       element: 'Air',   accent: '#fd79a8', grad: ['#230010', '#6b0038', '#fd79a8'] },
  Vrischika: { symbol: '♏', western: 'Scorpio',     element: 'Water', accent: '#a29bfe', grad: ['#0d0a2a', '#2d1f8a', '#a29bfe'] },
  Dhanu:     { symbol: '♐', western: 'Sagittarius', element: 'Fire',  accent: '#ff9f7f', grad: ['#200600', '#7a1c00', '#ff9f7f'] },
  Makara:    { symbol: '♑', western: 'Capricorn',   element: 'Earth', accent: '#55efc4', grad: ['#041a14', '#0a5740', '#55efc4'] },
  Kumbha:    { symbol: '♒', western: 'Aquarius',    element: 'Air',   accent: '#a29bfe', grad: ['#080420', '#1e1060', '#a29bfe'] },
  Meena:     { symbol: '♓', western: 'Pisces',      element: 'Water', accent: '#c9b1ff', grad: ['#120826', '#3a1a6e', '#c9b1ff'] },
};

// ─── Deterministic constellation dots ────────────────────────────────────────

function constellationDots(rashi: string) {
  const seed = rashi.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: 18 }, (_, i) => {
    const a = Math.abs(Math.sin((seed + i * 1234.567) * 9973));
    const b = Math.abs(Math.sin((seed + i * 2345.678) * 8761));
    const c = Math.abs(Math.sin((seed + i * 3456.789) * 7654));
    return { x: 0.05 + a * 0.9, y: 0.05 + b * 0.9, r: 1 + Math.floor(c * 3) };
  });
}

// Background stars (fixed across all signs)
const BG_STARS = Array.from({ length: 50 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 987.654 * 13337));
  const b = Math.abs(Math.sin(i * 654.321 * 17777));
  const c = Math.abs(Math.sin(i * 321.123 * 11111));
  return {
    left: a * SW,
    top: b * SH,
    size: 0.8 + c * 2,
    opacity: 0.15 + c * 0.5,
  };
});

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  rashi: string;
  deepLink: string;
  userName: string;
  cosmicDNA: string;
  onClose: () => void;
};

export function QRRevealAnimation({ visible, rashi, deepLink, userName, cosmicDNA, onClose }: Props) {
  const info = RASHI[rashi] ?? RASHI.Vrischika;
  const dots = useMemo(() => constellationDots(rashi), [rashi]);

  // rotateX: 75° (side/edge) → 0° (face/top)
  const rotateX = useSharedValue(75);

  useEffect(() => {
    if (visible) {
      rotateX.value = 75;
      rotateX.value = withDelay(
        700,
        withTiming(0, {
          duration: 2600,
          easing: Easing.bezier(0.22, 1, 0.36, 1), // easeOutQuint — dramatic deceleration
        }),
      );
    }
  }, [visible]);

  // The whole card tilts
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rotateX.value}deg` },
    ],
  }));

  // Rashi face: fully visible when tilted, fades out as card flattens
  const rashiStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateX.value, [0, 38, 75], [0, 0, 1], 'clamp'),
  }));

  // QR face: invisible while tilted, fades in as card flattens
  const qrStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateX.value, [0, 38, 75], [1, 0, 0], 'clamp'),
  }));

  // Backdrop dims in
  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(10, 6, 30, ${interpolate(rotateX.value, [0, 75], [0.92, 0.78], 'clamp')})`,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Background star field */}
        {BG_STARS.map((s, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.bgStar,
              { left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity },
            ]}
          />
        ))}

        {/* Stage — prevents backdrop press inside */}
        <Pressable onPress={() => {}} style={styles.stage}>

          {/* Sign label */}
          <Text style={[styles.signName, { color: info.accent }]}>
            {info.western.toUpperCase()}  ·  {rashi.toUpperCase()}
          </Text>
          <Text style={styles.elementBadge}>{info.element}</Text>

          {/* Animated card */}
          <Animated.View style={[styles.card, cardStyle]}>

            {/* ── Rashi face ──────────────────────────────────────────── */}
            <Animated.View style={[StyleSheet.absoluteFill, rashiStyle]} pointerEvents="none">
              <LinearGradient
                colors={info.grad as [string, string, string]}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={styles.face}
              >
                {/* Constellation dots */}
                {dots.map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        left: d.x * CARD - d.r,
                        top: d.y * CARD - d.r,
                        width: d.r * 2,
                        height: d.r * 2,
                        borderRadius: d.r,
                        backgroundColor: `rgba(255,255,255,${0.35 + d.r * 0.12})`,
                      },
                    ]}
                  />
                ))}

                {/* Glow halo behind symbol */}
                <View style={[styles.glow, { backgroundColor: `${info.accent}28`, shadowColor: info.accent }]} />

                {/* Zodiac symbol */}
                <Text style={[styles.zodiacSymbol, { color: info.accent }]}>{info.symbol}</Text>
                <Text style={[styles.westernLabel, { color: info.accent }]}>{info.western}</Text>
                <Text style={styles.rashiLatinLabel}>{rashi}</Text>
              </LinearGradient>
            </Animated.View>

            {/* ── QR face ─────────────────────────────────────────────── */}
            <Animated.View style={[StyleSheet.absoluteFill, qrStyle]} pointerEvents="none">
              <LinearGradient
                colors={['#fffaf1', '#f0e6ff', '#e8d8ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.face}
              >
                <Text style={styles.qrAppName}>COSMICSELF</Text>
                <Text style={styles.qrName}>{userName}</Text>
                <Text style={styles.qrDNA} numberOfLines={2}>{cosmicDNA}</Text>

                <View style={styles.qrBox}>
                  <QRCode value={deepLink} size={CARD * 0.58} color="#17182d" backgroundColor="transparent" quietZone={6} />
                </View>

                <Text style={styles.qrScan}>Scan to read my Cosmic DNA</Text>
                <Text style={[styles.rashiChip, { borderColor: `${info.accent}60`, color: info.accent }]}>
                  {info.symbol}  {rashi}
                </Text>
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          <Text style={styles.hint}>tap outside to dismiss</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bgStar: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#ffffff',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  signName: {
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  elementBadge: {
    color: 'rgba(255,250,241,0.48)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  card: {
    width: CARD,
    height: CARD,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    // Elevation so the card casts a glow at bottom
    shadowColor: '#7367ff',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 20,
  },
  face: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  // Rashi face
  dot: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    width: CARD * 0.72,
    height: CARD * 0.72,
    borderRadius: CARD * 0.36,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  zodiacSymbol: {
    fontSize: 110,
    lineHeight: 120,
    textAlign: 'center',
    // text glow via shadow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    textShadowColor: 'rgba(255,255,255,0.6)',
  },
  westernLabel: {
    fontSize: 22,
    fontFamily: FONTS.display,
    letterSpacing: 1,
    textAlign: 'center',
  },
  rashiLatinLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  // QR face
  qrAppName: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 3,
    marginBottom: 2,
  },
  qrName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.display,
    textAlign: 'center',
  },
  qrDNA: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BORDER_RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginVertical: SPACING.xs,
  },
  qrScan: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  rashiChip: {
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  hint: {
    color: 'rgba(255,250,241,0.28)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
    marginTop: SPACING.md,
  },
});
