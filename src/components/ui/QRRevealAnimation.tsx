import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH - 44, 360);
const STAGE_SIZE = Math.min(PANEL_WIDTH - 32, 292);
const QR_SIZE = STAGE_SIZE - 54;

type ZodiacIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type RashiInfo = {
  symbol: string;
  western: string;
  element: string;
  icon: ZodiacIconName;
  accent: string;
  accent2: string;
  grad: readonly [string, string];
};

const RASHI: Record<string, RashiInfo> = {
  Mesha: { symbol: '\u2648', western: 'Aries', element: 'Fire', icon: 'zodiac-aries', accent: '#ff6b6b', accent2: '#ff9f7f', grad: ['#2a0808', '#6b1010'] },
  Vrishabha: { symbol: '\u2649', western: 'Taurus', element: 'Earth', icon: 'zodiac-taurus', accent: '#6bcf7f', accent2: '#a8e6cf', grad: ['#07200f', '#1a5c30'] },
  Mithuna: { symbol: '\u264A', western: 'Gemini', element: 'Air', icon: 'zodiac-gemini', accent: '#74b9ff', accent2: '#a29bfe', grad: ['#041830', '#0a4a8c'] },
  Karka: { symbol: '\u264B', western: 'Cancer', element: 'Water', icon: 'zodiac-cancer', accent: '#81ecec', accent2: '#55efc4', grad: ['#042020', '#066060'] },
  Simha: { symbol: '\u264C', western: 'Leo', element: 'Fire', icon: 'zodiac-leo', accent: '#fdcb6e', accent2: '#ff9f7f', grad: ['#231000', '#7a3500'] },
  Kanya: { symbol: '\u264D', western: 'Virgo', element: 'Earth', icon: 'zodiac-virgo', accent: '#a8e6cf', accent2: '#6bcf7f', grad: ['#0a1f16', '#215c3a'] },
  Tula: { symbol: '\u264E', western: 'Libra', element: 'Air', icon: 'zodiac-libra', accent: '#fd79a8', accent2: '#e17fc8', grad: ['#230010', '#6b0038'] },
  Vrischika: { symbol: '\u264F', western: 'Scorpio', element: 'Water', icon: 'zodiac-scorpio', accent: '#a29bfe', accent2: '#c9b1ff', grad: ['#0d0a2a', '#2d1f8a'] },
  Dhanu: { symbol: '\u2650', western: 'Sagittarius', element: 'Fire', icon: 'zodiac-sagittarius', accent: '#ff9f7f', accent2: '#fdcb6e', grad: ['#200600', '#7a1c00'] },
  Makara: { symbol: '\u2651', western: 'Capricorn', element: 'Earth', icon: 'zodiac-capricorn', accent: '#55efc4', accent2: '#81ecec', grad: ['#041a14', '#0a5740'] },
  Kumbha: { symbol: '\u2652', western: 'Aquarius', element: 'Air', icon: 'zodiac-aquarius', accent: '#a29bfe', accent2: '#74b9ff', grad: ['#080420', '#1e1060'] },
  Meena: { symbol: '\u2653', western: 'Pisces', element: 'Water', icon: 'zodiac-pisces', accent: '#c9b1ff', accent2: '#fd79a8', grad: ['#120826', '#3a1a6e'] },
};

const DECOR_POINTS: ReadonlyArray<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}> = [
  { top: 18, left: 30 },
  { top: 42, right: 34 },
  { bottom: 42, left: 34 },
  { bottom: 20, right: 28 },
] as const;

const FLOOR_TILES = Array.from({ length: 25 }, (_, index) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  return {
    key: `tile-${row}-${col}`,
    top: 22 + row * 44,
    left: 22 + col * 44,
    emphasis: row === col || row + col === 4 || index % 4 === 0,
  };
});

type Props = {
  rashi: string;
  deepLink: string;
  userName: string;
  cosmicDNA: string;
  themeColors?: readonly string[];
};

function withAlpha(color: string, alpha: string) {
  return color.startsWith('#') && color.length === 7 ? `${color}${alpha}` : color;
}

export function QRRevealAnimation({ rashi, deepLink, userName, cosmicDNA, themeColors }: Props) {
  const info = RASHI[rashi] ?? RASHI.Vrischika;
  const progress = useSharedValue(0);
  const isFocused = useIsFocused();
  const themeKey = themeColors?.join('|') ?? '';

  const panelTint = useMemo(() => {
    const palette = themeColors?.length ? themeColors : [info.accent, info.accent2, COLORS.iris];
    return [
      withAlpha(palette[0] ?? info.accent, '12'),
      withAlpha(palette[1] ?? info.accent2, '20'),
      withAlpha(palette[2] ?? info.accent, '14'),
    ] as [string, string, string];
  }, [info.accent, info.accent2, themeColors]);

  useEffect(() => {
    if (!isFocused) return;
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withDelay(
      260,
      withTiming(1, {
        duration: Platform.OS === 'android' ? 5200 : 5800,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
    );
  }, [deepLink, isFocused, progress, rashi, themeKey]);

  const stageStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateX: `${interpolate(progress.value, [0, 1], [62, 0], 'clamp')}deg` },
      { rotateZ: `${interpolate(progress.value, [0, 1], [-14, 0], 'clamp')}deg` },
      { translateY: interpolate(progress.value, [0, 1], [26, 0], 'clamp') },
      { scale: interpolate(progress.value, [0, 1], [0.9, 1], 'clamp') },
    ],
  }));

  const gridStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.64, 0.9, 1], [0.96, 0.92, 0.28, 0.12], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.94, 1], 'clamp') }],
  }));

  const qrStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 0.88, 1], [0.02, 0.06, 0.82, 1], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.72, 1], 'clamp') }],
  }));

  const revealBeamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.58, 0.74, 0.96, 1], [0, 0.52, 0.22, 0], 'clamp'),
    transform: [
      { translateY: interpolate(progress.value, [0.54, 1], [-QR_SIZE * 0.52, QR_SIZE * 0.52], 'clamp') },
    ],
  }));

  const totemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.68, 0.88, 1], [1, 1, 0.22, 0], 'clamp'),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-32, 18], 'clamp') },
      { scale: interpolate(progress.value, [0, 1], [1.14, 0.76], 'clamp') },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.14, 0.26], 'clamp'),
    transform: [
      { scaleX: interpolate(progress.value, [0, 1], [0.62, 1], 'clamp') },
      { scaleY: interpolate(progress.value, [0, 1], [0.24, 0.84], 'clamp') },
      { translateY: interpolate(progress.value, [0, 1], [20, 28], 'clamp') },
    ],
  }));

  const metaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1], [0.4, 0.88, 1], 'clamp'),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [8, 0], 'clamp') }],
  }));

  return (
    <View style={styles.shell}>
      <LinearGradient colors={COLORS.gradientSilver} style={styles.panel}>
        <LinearGradient colors={panelTint} style={StyleSheet.absoluteFillObject} />

        <Animated.View style={[styles.header, metaStyle]}>
          <Text style={[styles.eyebrow, { color: info.accent }]}>
            {info.western.toUpperCase()} SIGNAL
          </Text>
          <Text style={styles.title}>{userName}&apos;s {rashi} code</Text>
          <Text style={styles.subtitle}>
            The sign rises first from the side, then settles into the QR.
          </Text>
        </Animated.View>

        <View style={styles.viewport}>
          <Animated.View style={[styles.shadow, shadowStyle]} />

          <Animated.View style={[styles.stage, stageStyle]}>
            <LinearGradient
              colors={[withAlpha(info.accent, '18'), withAlpha(info.accent2, '22'), '#ffffff']}
              start={{ x: 0.04, y: 0.04 }}
              end={{ x: 1, y: 1 }}
              style={styles.stageSurface}
            >
              <Animated.View style={[styles.gridFloor, gridStyle]} pointerEvents="none">
                {FLOOR_TILES.map((tile) => (
                  <View
                    key={tile.key}
                    style={[
                      styles.gridTile,
                      {
                        top: tile.top,
                        left: tile.left,
                        borderColor: withAlpha(tile.emphasis ? info.accent : info.accent2, tile.emphasis ? '68' : '32'),
                        backgroundColor: withAlpha(tile.emphasis ? info.accent2 : '#ffffff', tile.emphasis ? '24' : '10'),
                      },
                    ]}
                  />
                ))}
                <View style={[styles.cornerMark, styles.cornerTopLeft, { borderColor: info.accent }]} />
                <View style={[styles.cornerMark, styles.cornerTopRight, { borderColor: info.accent2 }]} />
                <View style={[styles.cornerMark, styles.cornerBottomLeft, { borderColor: info.accent2 }]} />
                <View style={[styles.cornerMark, styles.cornerBottomRight, { borderColor: info.accent }]} />
              </Animated.View>

              <Animated.View style={[styles.qrLayer, qrStyle]}>
                <View style={[styles.qrFrame, { borderColor: withAlpha(info.accent, '3a') }]}>
                  <QRCode
                    value={deepLink}
                    size={QR_SIZE}
                    backgroundColor="white"
                    color="#161b28"
                    quietZone={14}
                  />
                  <Animated.View style={[styles.revealBeam, revealBeamStyle]}>
                    <LinearGradient
                      colors={['transparent', withAlpha(info.accent2, '66'), 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </Animated.View>
                </View>
              </Animated.View>

              <Animated.View style={[styles.previewLayer, totemStyle]} pointerEvents="none">
                <LinearGradient
                  colors={[info.grad[0], info.grad[1]]}
                  start={{ x: 0.12, y: 0 }}
                  end={{ x: 0.88, y: 1 }}
                  style={styles.totemPlate}
                >
                  {DECOR_POINTS.map((point, index) => (
                    <View
                      key={`${index}-${point.top ?? point.bottom}`}
                      style={[
                        styles.decorPoint,
                        {
                          backgroundColor: index % 2 === 0 ? info.accent : info.accent2,
                        },
                        point.top !== undefined ? { top: point.top } : { bottom: point.bottom },
                        point.left !== undefined ? { left: point.left } : { right: point.right },
                      ]}
                    />
                  ))}

                  <View style={styles.totemBadge}>
                    <Text style={[styles.totemBadgeText, { color: info.accent2 }]}>
                      {info.element}
                    </Text>
                  </View>

                  <View style={styles.pedestalGlow} />
                  <View style={styles.totemColumn} />

                  <Text style={[styles.sigilGhost, { color: withAlpha(info.accent, '22') }]}>
                    {info.symbol}
                  </Text>
                  <LinearGradient
                    colors={[withAlpha(info.accent2, '1c'), withAlpha(info.accent, '56')]}
                    style={styles.iconHalo}
                  />
                  <MaterialCommunityIcons
                    name={info.icon}
                    size={104}
                    color={info.accent2}
                    style={styles.totemIcon}
                  />
                  <Text style={[styles.sigil, { color: info.accent }]}>
                    {info.symbol}
                  </Text>
                  <Text style={styles.previewLabel}>{info.western}</Text>
                  <Text style={styles.previewSubLabel}>{rashi}</Text>
                </LinearGradient>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, metaStyle]}>
          <View style={[styles.badge, { borderColor: withAlpha(info.accent, '30') }]}>
            <Text style={[styles.badgeText, { color: info.accent }]}>
              {info.symbol} {info.western}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.dnaText}>
            {cosmicDNA}
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgElevated,
    ...SHADOWS.deep,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  viewport: {
    height: STAGE_SIZE + 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  shadow: {
    position: 'absolute',
    width: STAGE_SIZE * 0.82,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(29, 24, 46, 0.18)',
  },
  stage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    borderRadius: 32,
    overflow: 'hidden',
  },
  stageSurface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridFloor: {
    position: 'absolute',
    width: QR_SIZE + 34,
    height: QR_SIZE + 34,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridTile: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
  },
  cornerMark: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderWidth: 4,
    borderRadius: 14,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
  },
  qrLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 8,
    overflow: 'hidden',
  },
  revealBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
  },
  previewLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totemPlate: {
    width: QR_SIZE + 34,
    height: QR_SIZE + 34,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  totemBadge: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  totemBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.3,
  },
  pedestalGlow: {
    position: 'absolute',
    width: 132,
    height: 36,
    bottom: 58,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  totemColumn: {
    position: 'absolute',
    width: 24,
    height: 72,
    bottom: 72,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconHalo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  totemIcon: {
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowRadius: 18,
    marginBottom: 6,
  },
  sigilGhost: {
    position: 'absolute',
    fontSize: 172,
    lineHeight: 176,
    transform: [{ translateY: 4 }],
  },
  sigil: {
    position: 'absolute',
    top: 50,
    right: 44,
    fontSize: 40,
    lineHeight: 42,
    textShadowColor: 'rgba(255,255,255,0.16)',
    textShadowRadius: 16,
  },
  previewLabel: {
    position: 'absolute',
    bottom: 34,
    color: '#fffaf1',
    fontSize: 18,
    fontFamily: FONTS.heading,
    letterSpacing: 0.4,
  },
  previewSubLabel: {
    position: 'absolute',
    bottom: 14,
    color: 'rgba(255,250,241,0.72)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  dnaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: PANEL_WIDTH - 60,
  },
});
