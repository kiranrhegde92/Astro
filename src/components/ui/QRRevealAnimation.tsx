import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Path } from 'react-native-svg';
import QRCodeLib from 'qrcode';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

const AnimatedG = Animated.createAnimatedComponent(G);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH - 44, 360);
const STAGE_SIZE = Math.min(PANEL_WIDTH - 32, 296);
const QR_SIZE = STAGE_SIZE - 52;

type Ellipse = { cx: number; cy: number; rx: number; ry: number };

type AnimalInfo = {
  name: string;
  glyph: string;
  accent: string;
  accent2: string;
  silhouette: readonly Ellipse[];
};

const el = (cx: number, cy: number, rx: number, ry: number): Ellipse => ({ cx, cy, rx, ry });

const ANIMALS: Record<string, AnimalInfo> = {
  Rat: {
    name: 'Rat', glyph: '\u9F20', accent: '#a29bfe', accent2: '#c9b1ff',
    silhouette: [
      el(0.52, 0.6, 0.24, 0.16),
      el(0.28, 0.54, 0.12, 0.11),
      el(0.22, 0.44, 0.045, 0.05), el(0.3, 0.42, 0.045, 0.05),
      el(0.76, 0.6, 0.045, 0.035), el(0.83, 0.57, 0.04, 0.03), el(0.89, 0.53, 0.035, 0.03),
    ],
  },
  Ox: {
    name: 'Ox', glyph: '\u725B', accent: '#fdcb6e', accent2: '#ff9f7f',
    silhouette: [
      el(0.56, 0.62, 0.26, 0.17),
      el(0.26, 0.54, 0.14, 0.12),
      el(0.19, 0.4, 0.05, 0.08), el(0.33, 0.4, 0.05, 0.08),
    ],
  },
  Tiger: {
    name: 'Tiger', glyph: '\u864E', accent: '#ff7f50', accent2: '#fdcb6e',
    silhouette: [
      el(0.56, 0.6, 0.24, 0.17),
      el(0.28, 0.52, 0.14, 0.12),
      el(0.22, 0.41, 0.05, 0.06), el(0.34, 0.41, 0.05, 0.06),
      el(0.78, 0.6, 0.05, 0.035), el(0.86, 0.56, 0.045, 0.03),
    ],
  },
  Rabbit: {
    name: 'Rabbit', glyph: '\u5154', accent: '#ffc4d7', accent2: '#fd79a8',
    silhouette: [
      el(0.5, 0.66, 0.22, 0.17),
      el(0.5, 0.44, 0.14, 0.13),
      el(0.42, 0.22, 0.05, 0.14), el(0.58, 0.22, 0.05, 0.14),
    ],
  },
  Dragon: {
    name: 'Dragon', glyph: '\u9F8D', accent: '#ff6b6b', accent2: '#fdcb6e',
    silhouette: [
      el(0.18, 0.32, 0.09, 0.08),
      el(0.3, 0.42, 0.08, 0.07),
      el(0.42, 0.5, 0.08, 0.07),
      el(0.54, 0.56, 0.08, 0.07),
      el(0.66, 0.62, 0.08, 0.07),
      el(0.78, 0.68, 0.07, 0.06),
      el(0.36, 0.32, 0.07, 0.08), el(0.48, 0.32, 0.07, 0.08),
    ],
  },
  Snake: {
    name: 'Snake', glyph: '\u86C7', accent: '#6bcf7f', accent2: '#3ee0c8',
    silhouette: [
      el(0.16, 0.5, 0.065, 0.055),
      el(0.28, 0.44, 0.075, 0.055),
      el(0.4, 0.56, 0.075, 0.055),
      el(0.52, 0.44, 0.075, 0.055),
      el(0.64, 0.56, 0.075, 0.055),
      el(0.76, 0.44, 0.075, 0.055),
      el(0.86, 0.5, 0.055, 0.05),
    ],
  },
  Horse: {
    name: 'Horse', glyph: '\u99AC', accent: '#fdcb6e', accent2: '#ff9f7f',
    silhouette: [
      el(0.56, 0.62, 0.25, 0.17),
      el(0.38, 0.52, 0.09, 0.1),
      el(0.28, 0.4, 0.1, 0.11),
      el(0.22, 0.28, 0.04, 0.07), el(0.3, 0.28, 0.04, 0.07),
      el(0.8, 0.54, 0.05, 0.045), el(0.87, 0.5, 0.04, 0.035),
    ],
  },
  Goat: {
    name: 'Goat', glyph: '\u7F8A', accent: '#e8d8b4', accent2: '#c7a87a',
    silhouette: [
      el(0.56, 0.62, 0.25, 0.17),
      el(0.28, 0.52, 0.13, 0.12),
      el(0.22, 0.36, 0.04, 0.08), el(0.3, 0.36, 0.04, 0.08),
      el(0.28, 0.68, 0.055, 0.05),
    ],
  },
  Monkey: {
    name: 'Monkey', glyph: '\u7334', accent: '#d4a574', accent2: '#a0916c',
    silhouette: [
      el(0.5, 0.6, 0.22, 0.18),
      el(0.5, 0.36, 0.15, 0.13),
      el(0.24, 0.56, 0.07, 0.09), el(0.76, 0.56, 0.07, 0.09),
      el(0.42, 0.33, 0.045, 0.045), el(0.58, 0.33, 0.045, 0.045),
    ],
  },
  Rooster: {
    name: 'Rooster', glyph: '\u96DE', accent: '#ff9f7f', accent2: '#ff6b6b',
    silhouette: [
      el(0.5, 0.64, 0.2, 0.16),
      el(0.38, 0.42, 0.11, 0.1),
      el(0.34, 0.28, 0.04, 0.08), el(0.4, 0.24, 0.04, 0.05),
      el(0.72, 0.52, 0.06, 0.12), el(0.8, 0.46, 0.06, 0.1),
    ],
  },
  Dog: {
    name: 'Dog', glyph: '\u72D7', accent: '#a0916c', accent2: '#d4a574',
    silhouette: [
      el(0.56, 0.62, 0.25, 0.17),
      el(0.26, 0.52, 0.13, 0.12),
      el(0.2, 0.38, 0.05, 0.08), el(0.3, 0.38, 0.05, 0.06),
      el(0.82, 0.52, 0.05, 0.04), el(0.88, 0.46, 0.04, 0.035),
    ],
  },
  Pig: {
    name: 'Pig', glyph: '\u8C6C', accent: '#ffb4a2', accent2: '#fd79a8',
    silhouette: [
      el(0.56, 0.6, 0.26, 0.18),
      el(0.26, 0.52, 0.13, 0.12),
      el(0.18, 0.54, 0.045, 0.05),
      el(0.22, 0.4, 0.035, 0.05), el(0.3, 0.4, 0.035, 0.05),
      el(0.83, 0.54, 0.03, 0.025),
    ],
  },
};

const FALLBACK: AnimalInfo = ANIMALS.Dragon;

function resolveAnimal(raw: string | undefined): AnimalInfo {
  if (!raw) return FALLBACK;
  const key = raw.trim().toLowerCase();
  const match = Object.values(ANIMALS).find((a) => a.name.toLowerCase() === key);
  return match ?? FALLBACK;
}

function pointInSilhouette(nx: number, ny: number, shapes: readonly Ellipse[]): boolean {
  for (const s of shapes) {
    const dx = (nx - s.cx) / s.rx;
    const dy = (ny - s.cy) / s.ry;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
}

function isFinderCell(r: number, c: number, size: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
}

type QRData = { size: number; modules: boolean[][] };

function buildMatrix(deepLink: string): QRData | null {
  const levels: Array<'H' | 'Q' | 'M' | 'L'> = ['H', 'Q', 'M', 'L'];
  for (const level of levels) {
    try {
      const result = QRCodeLib.create(deepLink, { errorCorrectionLevel: level });
      const size = result.modules.size;
      const data = result.modules.data;
      const modules: boolean[][] = [];
      for (let r = 0; r < size; r += 1) {
        const row: boolean[] = [];
        for (let c = 0; c < size; c += 1) {
          row.push(Boolean(data[r * size + c]));
        }
        modules.push(row);
      }
      return { size, modules };
    } catch (err) {
      continue;
    }
  }
  return null;
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0 `;
}

function roundedRectPath(x: number, y: number, size: number, radius: number): string {
  const r = Math.min(radius, size / 2);
  const s = size;
  return `M${x + r},${y}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(s - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z `;
}

function finderPath(xOffset: number, yOffset: number, cell: number): string {
  const outer = cell * 7;
  const innerWhite = cell * 5;
  const innerDark = cell * 3;
  return (
    roundedRectPath(xOffset, yOffset, outer, cell * 1.8) +
    roundedRectPath(xOffset + cell * 2, yOffset + cell * 2, innerDark, cell * 0.8)
  );
  // middle white handled via a separate white path (below)
}

function finderWhitePath(xOffset: number, yOffset: number, cell: number): string {
  return roundedRectPath(xOffset + cell, yOffset + cell, cell * 5, cell * 1.2);
}

type Props = {
  rashi?: string;
  chineseAnimal?: string;
  deepLink: string;
  userName: string;
  cosmicDNA: string;
  themeColors?: readonly string[];
};

function withAlpha(color: string, alpha: string) {
  return color.startsWith('#') && color.length === 7 ? `${color}${alpha}` : color;
}

export function QRRevealAnimation({ chineseAnimal, rashi, deepLink, userName, cosmicDNA, themeColors }: Props) {
  const animal = useMemo(() => resolveAnimal(chineseAnimal ?? rashi), [chineseAnimal, rashi]);
  const progress = useSharedValue(0);
  const breath = useSharedValue(0);
  const isFocused = useIsFocused();
  const themeKey = themeColors?.join('|') ?? '';

  const panelTint = useMemo(() => {
    const palette = themeColors?.length ? themeColors : [animal.accent, animal.accent2, COLORS.iris];
    return [
      withAlpha(palette[0] ?? animal.accent, '18'),
      withAlpha(palette[1] ?? animal.accent2, '22'),
      withAlpha(palette[2] ?? animal.accent, '14'),
    ] as [string, string, string];
  }, [animal.accent, animal.accent2, themeColors]);

  const qr = useMemo(() => buildMatrix(deepLink), [deepLink]);

  const rendered = useMemo(() => {
    if (!qr) return null;
    const { size, modules } = qr;
    const cell = QR_SIZE / size;
    const dotRadiusOutside = cell * 0.38;
    const insideRectSize = cell * 0.96;
    const insideRectOffset = (cell - insideRectSize) / 2;
    const insideRectRadius = cell * 0.2;

    let outsidePath = '';
    let insidePath = '';

    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (!modules[r][c]) continue;
        if (isFinderCell(r, c, size)) continue;
        const nx = (c + 0.5) / size;
        const ny = (r + 0.5) / size;
        const x = c * cell;
        const y = r * cell;
        if (pointInSilhouette(nx, ny, animal.silhouette)) {
          insidePath += roundedRectPath(x + insideRectOffset, y + insideRectOffset, insideRectSize, insideRectRadius);
        } else {
          outsidePath += circlePath(x + cell / 2, y + cell / 2, dotRadiusOutside);
        }
      }
    }

    const tlDark = finderPath(0, 0, cell);
    const trDark = finderPath((size - 7) * cell, 0, cell);
    const blDark = finderPath(0, (size - 7) * cell, cell);
    const finderDark = tlDark + trDark + blDark;

    const tlWhite = finderWhitePath(0, 0, cell);
    const trWhite = finderWhitePath((size - 7) * cell, 0, cell);
    const blWhite = finderWhitePath(0, (size - 7) * cell, cell);
    const finderWhite = tlWhite + trWhite + blWhite;

    return { size, cell, outsidePath, insidePath, finderDark, finderWhite };
  }, [qr, animal.silhouette]);

  useEffect(() => {
    if (!isFocused) return;
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withDelay(
      260,
      withTiming(1, {
        duration: Platform.OS === 'android' ? 2800 : 3200,
        easing: Easing.bezier(0.22, 0.72, 0.18, 1),
      }),
    );
  }, [deepLink, isFocused, progress, animal.name, themeKey]);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [breath]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1], [0.2, 0.92, 1], 'clamp'),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [14, 0], 'clamp') }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.05, 0.35], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0.05, 0.45], [0.88, 1], 'clamp') }],
  }));

  const finderProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0.2, 0.5], [0, 1], 'clamp'),
  }));

  const outsideProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0.35, 0.7], [0, 1], 'clamp'),
  }));

  const insideProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0.55, 0.95], [0, 1], 'clamp'),
  }));

  const glyphStyle = useAnimatedStyle(() => {
    const base = interpolate(progress.value, [0.78, 1], [0, 1], 'clamp');
    return {
      opacity: base * (0.55 + breath.value * 0.45),
      transform: [{ scale: interpolate(progress.value, [0.78, 1], [0.55, 1], 'clamp') }],
    };
  });

  const metaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1], [0.3, 0.85, 1], 'clamp'),
  }));

  if (!qr || !rendered) {
    return (
      <View style={styles.shell}>
        <View style={[styles.panel, styles.fallback]}>
          <Text style={styles.fallbackText}>Unable to render QR — payload too large.</Text>
        </View>
      </View>
    );
  }

  const { size, cell, outsidePath, insidePath, finderDark, finderWhite } = rendered;
  const totalSize = size * cell;
  const finderColor = '#0a0c18';
  const outsideColor = '#1b2036';
  const insideColor = '#0a0c18';

  return (
    <View style={styles.shell}>
      <Animated.View style={[styles.panelWrap, panelStyle]}>
        <LinearGradient colors={COLORS.gradientSilver} style={styles.panel}>
          <LinearGradient colors={panelTint} style={StyleSheet.absoluteFillObject} />

          <Animated.View style={[styles.header, metaStyle]}>
            <Text style={[styles.eyebrow, { color: animal.accent }]}>
              YEAR OF THE {animal.name.toUpperCase()}
            </Text>
            <Text style={styles.title}>{userName}&apos;s cosmic signal</Text>
            <Text style={styles.subtitle}>
              Your {animal.name.toLowerCase()} spirit appears as you scan.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.cardWrap, cardStyle]}>
            <View
              style={[
                styles.card,
                { shadowColor: animal.accent, borderColor: withAlpha(animal.accent, '66') },
              ]}
            >
              <Svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
                <AnimatedG animatedProps={outsideProps}>
                  <Path d={outsidePath} fill={outsideColor} />
                </AnimatedG>

                <AnimatedG animatedProps={insideProps}>
                  <Path d={insidePath} fill={insideColor} />
                </AnimatedG>

                <AnimatedG animatedProps={finderProps}>
                  <Path d={finderDark} fill={finderColor} fillRule="evenodd" />
                  <Path d={finderWhite} fill="#ffffff" />
                  <G>
                    {/* redraw dark centers — the evenodd rule above may punch holes, ensure center 3x3 dark */}
                    <Path
                      d={
                        roundedRectPath(2 * cell, 2 * cell, 3 * cell, cell * 0.8) +
                        roundedRectPath((size - 7 + 2) * cell, 2 * cell, 3 * cell, cell * 0.8) +
                        roundedRectPath(2 * cell, (size - 7 + 2) * cell, 3 * cell, cell * 0.8)
                      }
                      fill={finderColor}
                    />
                  </G>
                </AnimatedG>
              </Svg>

              <Animated.View style={[styles.glyphOverlay, glyphStyle]} pointerEvents="none">
                <Text style={[styles.glyphShadow, { color: withAlpha(animal.accent, '2a') }]}>
                  {animal.glyph}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.footer, metaStyle]}>
            <View style={[styles.badge, { borderColor: withAlpha(animal.accent, '5a') }]}>
              <Text style={[styles.badgeText, { color: animal.accent }]}>
                {animal.glyph}  {animal.name.toUpperCase()}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.dnaText}>
              {cosmicDNA}
            </Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignItems: 'center',
  },
  panelWrap: {
    width: '100%',
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
  fallback: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  fallbackText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 13,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 2.4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: FONTS.display,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: PANEL_WIDTH - 60,
    lineHeight: 16,
  },
  cardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 22,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphShadow: {
    fontSize: QR_SIZE * 0.44,
    lineHeight: QR_SIZE * 0.48,
    fontFamily: FONTS.display,
    fontWeight: '900',
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.6,
  },
  dnaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: PANEL_WIDTH - 60,
  },
});
