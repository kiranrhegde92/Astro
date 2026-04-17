/**
 * Midnight Observatory — cosmic dark palette.
 * Token names preserved for backwards compatibility across the app;
 * resolved values tuned for a night-sky editorial aesthetic.
 */

const COSMOS = {
  void: '#05060f',
  deep: '#07081a',
  base: '#0a0b1f',
  mid: '#151736',
  horizon: '#2b1d52',
};

const CREAM = {
  100: '#fff8ea',
  200: '#fff5e6',
  300: '#f6ead4',
  400: '#cfc3a8',
  500: '#8c836d',
};

const ACCENT = {
  gold: '#f1b74f',
  goldDeep: '#bc8331',
  iris: '#9b91ff',
  irisBright: '#b8b0ff',
  tide: '#3ee0c8',
  tideLight: '#7de7da',
  plum: '#c77ad8',
  coral: '#ff7896',
  dawn: '#ff9e72',
};

export const COLORS = {
  // Backgrounds
  bg: COSMOS.base,
  bgDeep: COSMOS.deep,
  bgCard: 'rgba(255,255,255,0.06)',
  bgElevated: 'rgba(255,255,255,0.10)',
  bgMuted: 'rgba(255,255,255,0.04)',
  bgInkCard: 'rgba(10,11,31,0.82)',
  bgInkCardSoft: 'rgba(21,23,54,0.74)',

  // Glass surfaces — always translucent-white on a dark base
  glassBg: 'rgba(255,255,255,0.06)',
  glassBgMid: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassBorderBright: 'rgba(241,183,79,0.38)',
  glassHighlight: 'rgba(255,255,255,0.08)',
  rule: 'rgba(255,255,255,0.10)',
  ruleLight: 'rgba(255,255,255,0.06)',

  // Text on dark
  textPrimary: CREAM[200],
  textSecondary: 'rgba(255,245,230,0.72)',
  textMuted: 'rgba(255,245,230,0.48)',
  ink: CREAM[200],
  inkMid: 'rgba(255,245,230,0.82)',
  inkSoft: 'rgba(255,245,230,0.60)',

  // Neutrals
  white: '#ffffff',
  silver: '#f3edf7',
  silverMid: '#cec4da',
  silverDim: '#8f87a1',
  gold: ACCENT.gold,
  goldMid: ACCENT.goldDeep,
  starGold: ACCENT.gold,
  starGoldDeep: ACCENT.goldDeep,

  // System accents — brightened for dark backgrounds
  western: ACCENT.iris,
  vedic: ACCENT.dawn,
  chinese: ACCENT.coral,
  kp: ACCENT.tide,
  iris: ACCENT.iris,
  tide: ACCENT.tide,
  plum: ACCENT.plum,
  coral: ACCENT.coral,

  violet: ACCENT.iris,
  violetLight: ACCENT.irisBright,
  violetBright: '#d1cbff',
  teal: ACCENT.tide,
  tealLight: ACCENT.tideLight,
  deepSpace: COSMOS.deep,
  nebula: COSMOS.base,
  cosmic: COSMOS.mid,
  aurora: '#ffc888',

  // Feedback
  success: '#6fd596',
  warning: ACCENT.gold,
  error: '#ff7878',

  sunOrange: ACCENT.dawn,
  moonSilver: '#f4efe6',

  // Gradients
  gradientBg: [COSMOS.deep, COSMOS.base, COSMOS.mid] as const,
  gradientCard: ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)'] as const,
  gradientInk: [COSMOS.base, COSMOS.mid, COSMOS.horizon] as const,
  gradientInkSoft: [COSMOS.mid, COSMOS.horizon] as const,
  gradientDawn: ['#3b1f4a', '#662848', '#9a4450'] as const,
  gradientSunset: ['#2d1338', '#4a1760', '#1a2d60'] as const,
  gradientPrimary: [ACCENT.gold, ACCENT.dawn] as const,
  gradientGold: ['#ffe0a2', ACCENT.gold] as const,
  gradientSilver: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)'] as const,
  gradientChrome: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'] as const,
  gradientWestern: ['rgba(155,145,255,0.32)', 'rgba(155,145,255,0.08)'] as const,
  gradientVedic: ['rgba(255,158,114,0.30)', 'rgba(255,158,114,0.08)'] as const,
  gradientChinese: ['rgba(255,120,150,0.30)', 'rgba(255,120,150,0.08)'] as const,
  gradientKP: ['rgba(62,224,200,0.28)', 'rgba(62,224,200,0.08)'] as const,
  gradientMystic: ['rgba(155,145,255,0.14)', 'rgba(62,224,200,0.10)'] as const,
  gradientCompatibility: [
    'rgba(255,120,150,0.20)',
    'rgba(255,158,114,0.20)',
    'rgba(155,145,255,0.18)',
  ] as const,
};

export const FONTS = {
  display: 'PlayfairDisplay_900Black',
  heading: 'PlayfairDisplay_700Bold',
  accent: 'Cinzel_400Regular',
  accentBold: 'Cinzel_700Bold',
  body: 'System',
};

/**
 * Type scale — editorial rhythm.
 * Use these exclusively; avoid one-off fontSize values.
 */
export const TYPE = {
  hero: { fontSize: 42, lineHeight: 48, letterSpacing: -0.8 },
  title: { fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  heading: { fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  subhead: { fontSize: 17, lineHeight: 24, letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySmall: { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 1.6 },
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 0.2 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 30,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 22,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.44,
    shadowRadius: 30,
    elevation: 12,
  },
  glow: {
    shadowColor: ACCENT.iris,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 22,
    elevation: 6,
  },
  glowGold: {
    shadowColor: ACCENT.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 6,
  },
};
