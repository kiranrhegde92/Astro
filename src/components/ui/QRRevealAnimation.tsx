/**
 * QRRevealAnimation
 *
 * Reference-inspired (enco.fi "tree QR"):
 *   Phase 1 — QR grid shown at ~55° tilt (isometric perspective).
 *             Rashi zodiac symbol floats above the surface.
 *   Phase 2 — Card rotates to 0° (flat, face-on), symbol descends and fades.
 *             Pure colorful scannable QR is revealed.
 *
 * Stack: react-native-svg for QR pixels · Reanimated for animation
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
import Svg, { Rect, G } from 'react-native-svg';
// @ts-ignore – qrcode is a CJS dep used by react-native-qrcode-svg internally
import QR from 'qrcode';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

// ─── Screen metrics ──────────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get('window');
const QR_VIEW = Math.min(SW - 80, 290);

// ─── Rashi metadata ──────────────────────────────────────────────────────────

const RASHI: Record<
  string,
  {
    symbol: string;
    western: string;
    element: string;
    accent: string;
    accent2: string;
    grad: readonly [string, string];
  }
> = {
  Mesha:     { symbol: '♈', western: 'Aries',       element: 'Fire',  accent: '#ff6b6b', accent2: '#ff9f7f', grad: ['#2a0808', '#6b1010'] },
  Vrishabha: { symbol: '♉', western: 'Taurus',      element: 'Earth', accent: '#6bcf7f', accent2: '#a8e6cf', grad: ['#07200f', '#1a5c30'] },
  Mithuna:   { symbol: '♊', western: 'Gemini',      element: 'Air',   accent: '#74b9ff', accent2: '#a29bfe', grad: ['#041830', '#0a4a8c'] },
  Karka:     { symbol: '♋', western: 'Cancer',      element: 'Water', accent: '#81ecec', accent2: '#55efc4', grad: ['#042020', '#066060'] },
  Simha:     { symbol: '♌', western: 'Leo',         element: 'Fire',  accent: '#fdcb6e', accent2: '#ff9f7f', grad: ['#231000', '#7a3500'] },
  Kanya:     { symbol: '♍', western: 'Virgo',       element: 'Earth', accent: '#a8e6cf', accent2: '#6bcf7f', grad: ['#0a1f16', '#215c3a'] },
  Tula:      { symbol: '♎', western: 'Libra',       element: 'Air',   accent: '#fd79a8', accent2: '#e17fc8', grad: ['#230010', '#6b0038'] },
  Vrischika: { symbol: '♏', western: 'Scorpio',     element: 'Water', accent: '#a29bfe', accent2: '#c9b1ff', grad: ['#0d0a2a', '#2d1f8a'] },
  Dhanu:     { symbol: '♐', western: 'Sagittarius', element: 'Fire',  accent: '#ff9f7f', accent2: '#fdcb6e', grad: ['#200600', '#7a1c00'] },
  Makara:    { symbol: '♑', western: 'Capricorn',   element: 'Earth', accent: '#55efc4', accent2: '#81ecec', grad: ['#041a14', '#0a5740'] },
  Kumbha:    { symbol: '♒', western: 'Aquarius',    element: 'Air',   accent: '#a29bfe', accent2: '#74b9ff', grad: ['#080420', '#1e1060'] },
  Meena:     { symbol: '♓', western: 'Pisces',      element: 'Water', accent: '#c9b1ff', accent2: '#fd79a8', grad: ['#120826', '#3a1a6e'] },
};

// ─── QR matrix builder ───────────────────────────────────────────────────────

function buildMatrix(value: string): { matrix: boolean[][]; size: number } {
  try {
    const qr = QR.create(value, { errorCorrectionLevel: 'M' });
    const { data, size } = qr.modules;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(!!data[r * size + c]);
      }
      matrix.push(row);
    }
    return { matrix, size };
  } catch {
    return { matrix: [], size: 0 };
  }
}

// ─── Isometric QR SVG ────────────────────────────────────────────────────────

type QRSvgProps = {
  matrix: boolean[][];
  size: number;
  accent: string;
  accent2: string;
  viewSize: number;
};

function QRSvgGrid({ matrix, size, accent, accent2, viewSize }: QRSvgProps) {
  if (!size) return null;

  const QUIET = 3; // quiet zone in modules
  const total = size + QUIET * 2;
  const mod = viewSize / total;
  const off = QUIET * mod;
  const r = Math.max(1, mod * 0.22);

  const rects = useMemo(() => {
    const els: React.ReactElement[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const isDark = matrix[row][col];

        // Finder pattern regions (top-left, top-right, bottom-left 7×7)
        const isFinder =
          (col < 7 && row < 7) ||
          (col >= size - 7 && row < 7) ||
          (col < 7 && row >= size - 7);

        const x = off + col * mod;
        const y = off + row * mod;
        const s = mod - mod * 0.12; // slight gap between modules

        let fill: string;
        if (isDark) {
          fill = isFinder ? accent : accent2;
        } else {
          fill = isFinder ? `${accent}20` : 'rgba(255,255,255,0.07)';
        }

        els.push(
          <Rect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width={s}
            height={s}
            rx={isDark ? r : r * 0.5}
            fill={fill}
          />
        );
      }
    }
    return els;
  }, [matrix, size, accent, accent2, mod, off, r]);

  return (
    <Svg width={viewSize} height={viewSize}>
      <G>{rects}</G>
    </Svg>
  );
}

// ─── Background stars ────────────────────────────────────────────────────────

const BG_STARS = Array.from({ length: 60 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 987.654 * 13337));
  const b = Math.abs(Math.sin(i * 654.321 * 17777));
  const c = Math.abs(Math.sin(i * 321.123 * 11111));
  return { left: a * SW, top: b * SH, size: 0.6 + c * 2.2, opacity: 0.1 + c * 0.55 };
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
  const { matrix, size } = useMemo(() => buildMatrix(deepLink), [deepLink]);

  // rotateX: 56° (isometric tilt) → 0° (flat face-on)
  const rotateX = useSharedValue(56);

  useEffect(() => {
    if (visible) {
      rotateX.value = 56;
      rotateX.value = withDelay(
        700,
        withTiming(0, {
          duration: 2800,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      );
    }
  }, [visible]);

  // QR container: starts tilted, rotates flat
  const qrContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 950 },
      { rotateX: `${rotateX.value}deg` },
    ],
  }));

  // Zodiac symbol: inside the tilted container → appears to float above QR
  // translateY(-) moves it "up" through the perspective projection
  const symbolStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(rotateX.value, [0, 56], [0, -QR_VIEW * 0.28], 'clamp') },
      { scale: interpolate(rotateX.value, [0, 14, 56], [0, 0.4, 1.3], 'clamp') },
    ],
    opacity: interpolate(rotateX.value, [0, 10, 56], [0, 0, 1], 'clamp'),
  }));

  // Glow ring behind symbol fades with symbol
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateX.value, [0, 10, 56], [0, 0, 0.45], 'clamp'),
  }));

  // QR label row fades in as it flattens
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateX.value, [0, 15, 35], [1, 0.5, 0], 'clamp'),
    transform: [{ translateY: interpolate(rotateX.value, [0, 56], [0, 6], 'clamp') }],
  }));

  // Backdrop
  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(8, 4, 26, ${interpolate(rotateX.value, [0, 56], [0.93, 0.8], 'clamp')})`,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Stars */}
        {BG_STARS.map((s, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[styles.star, { left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }]}
          />
        ))}

        {/* Stage */}
        <Pressable onPress={() => {}} style={styles.stage}>

          {/* Sign label row */}
          <Text style={[styles.signName, { color: info.accent }]}>
            {info.western.toUpperCase()}  ·  {rashi.toUpperCase()}
          </Text>
          <Text style={styles.elementBadge}>{info.element}</Text>

          {/* Tilted QR card */}
          <Animated.View style={[styles.qrCard, qrContainerStyle]}>
            <LinearGradient
              colors={[info.grad[0], info.grad[1]]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.qrCardInner}
            >
              {/* Colorful QR grid */}
              <QRSvgGrid
                matrix={matrix}
                size={size}
                accent={info.accent}
                accent2={info.accent2}
                viewSize={QR_VIEW}
              />

              {/* Zodiac symbol floats above surface during tilt */}
              <Animated.View style={[styles.symbolOverlay, symbolStyle]} pointerEvents="none">
                <Animated.View style={[styles.symbolGlow, { backgroundColor: `${info.accent}30`, shadowColor: info.accent }, glowStyle]} />
                <Text style={[styles.symbolText, { color: info.accent, textShadowColor: info.accent }]}>
                  {info.symbol}
                </Text>
                <Text style={[styles.symbolWestern, { color: info.accent }]}>{info.western}</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* User + DNA label — visible when flat */}
          <Animated.View style={[styles.userRow, labelStyle]}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.dna} numberOfLines={1}>{cosmicDNA}</Text>
            <Text style={[styles.rashiChip, { borderColor: `${info.accent}55`, color: info.accent }]}>
              {info.symbol}  {rashi}
            </Text>
          </Animated.View>

          <Text style={styles.hint}>tap outside to dismiss</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#ffffff',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
  signName: {
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  elementBadge: {
    color: 'rgba(255,250,241,0.38)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  qrCard: {
    width: QR_VIEW,
    height: QR_VIEW,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    shadowColor: '#7367ff',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 18,
  },
  qrCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolGlow: {
    position: 'absolute',
    width: QR_VIEW * 0.55,
    height: QR_VIEW * 0.55,
    borderRadius: QR_VIEW * 0.275,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  symbolText: {
    fontSize: 96,
    lineHeight: 104,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  symbolWestern: {
    fontSize: 16,
    fontFamily: FONTS.display,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: -4,
  },
  userRow: {
    alignItems: 'center',
    gap: 3,
    marginTop: SPACING.sm,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.display,
    letterSpacing: 0.3,
  },
  dna: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: QR_VIEW,
  },
  rashiChip: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  hint: {
    color: 'rgba(255,250,241,0.22)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
    marginTop: SPACING.md,
  },
});
