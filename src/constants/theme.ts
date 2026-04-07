const PAPER = {
  50: '#fff8f2',
  100: '#f4ebf8',
  200: '#e6d8f2',
  300: '#f8c892',
};

const INK = {
  900: '#17182d',
  800: '#24284a',
  700: '#46507b',
  600: '#6872a0',
  500: '#959aba',
};

const ACCENT = {
  dawn: '#ff8a5b',
  iris: '#7367ff',
  tide: '#12c8b2',
  plum: '#b04ec7',
  gold: '#f1b74f',
  coral: '#ff5e7e',
  mint: '#7de7da',
};

export const COLORS = {
  bg: PAPER[100],
  bgDeep: PAPER[50],
  bgCard: 'rgba(255,248,252,0.72)',
  bgElevated: 'rgba(255,255,255,0.86)',
  bgMuted: 'rgba(230,216,242,0.52)',
  bgInkCard: 'rgba(23,24,45,0.94)',
  bgInkCardSoft: 'rgba(36,40,74,0.90)',

  glassBg: 'rgba(255,248,252,0.76)',
  glassBgMid: 'rgba(255,255,255,0.86)',
  glassBorder: 'rgba(36,40,74,0.12)',
  glassBorderBright: 'rgba(115,103,255,0.28)',
  glassHighlight: 'rgba(255,255,255,0.65)',
  rule: 'rgba(36,40,74,0.14)',
  ruleLight: 'rgba(255,250,241,0.16)',

  textPrimary: INK[900],
  textSecondary: INK[700],
  textMuted: INK[500],
  ink: INK[900],
  inkMid: INK[800],
  inkSoft: INK[700],

  white: '#ffffff',
  silver: '#f3edf7',
  silverMid: '#cec4da',
  silverDim: '#8f87a1',
  gold: ACCENT.gold,
  goldMid: '#bc8331',
  starGold: ACCENT.gold,
  starGoldDeep: '#bc8331',

  western: ACCENT.iris,
  vedic: ACCENT.dawn,
  chinese: ACCENT.coral,
  kp: ACCENT.tide,
  iris: ACCENT.iris,
  tide: ACCENT.tide,
  plum: ACCENT.plum,
  coral: ACCENT.coral,

  violet: ACCENT.iris,
  violetLight: '#a59dff',
  violetBright: '#b8b0ff',
  teal: ACCENT.tide,
  tealLight: ACCENT.mint,
  deepSpace: PAPER[50],
  nebula: PAPER[100],
  cosmic: PAPER[200],
  aurora: '#ffc888',

  success: '#58ad7c',
  warning: ACCENT.gold,
  error: '#d75c5c',

  sunOrange: ACCENT.dawn,
  moonSilver: '#f4efe6',

  gradientBg: ['#fff8f2', '#f4ebf8', '#ddd5ff'] as const,
  gradientCard: ['rgba(255,255,255,0.80)', 'rgba(244,235,248,0.58)'] as const,
  gradientInk: ['#17182d', '#24284a', '#46306b'] as const,
  gradientInkSoft: ['#24284a', '#3c366d'] as const,
  gradientDawn: ['#ffe0a4', '#ff9a68', '#ff5e7e'] as const,
  gradientSunset: ['#ffd0b3', '#ff7e63', '#8c56ff'] as const,
  gradientPrimary: ['#ff7b5b', '#ffbf63'] as const,
  gradientGold: ['#ffe0a2', '#f1b74f'] as const,
  gradientSilver: ['rgba(255,255,255,0.96)', 'rgba(230,216,242,0.76)'] as const,
  gradientChrome: ['rgba(255,255,255,0.82)', 'rgba(230,216,242,0.52)'] as const,
  gradientWestern: ['rgba(115,103,255,0.26)', 'rgba(115,103,255,0.08)'] as const,
  gradientVedic: ['rgba(255,138,91,0.24)', 'rgba(255,138,91,0.08)'] as const,
  gradientChinese: ['rgba(255,94,126,0.24)', 'rgba(255,94,126,0.08)'] as const,
  gradientKP: ['rgba(18,200,178,0.24)', 'rgba(18,200,178,0.08)'] as const,
  gradientMystic: ['rgba(255,255,255,0.72)', 'rgba(230,216,242,0.32)'] as const,
  gradientCompatibility: ['rgba(255,94,126,0.16)', 'rgba(255,138,91,0.16)', 'rgba(115,103,255,0.14)'] as const,
};

export const FONTS = {
  display: 'PlayfairDisplay_900Black',
  heading: 'PlayfairDisplay_700Bold',
  accent: 'Cinzel_400Regular',
  body: 'System',
};

export const TYPE = {
  hero: { fontSize: 40, letterSpacing: -0.8 },
  title: { fontSize: 30, letterSpacing: -0.4 },
  heading: { fontSize: 22, letterSpacing: -0.2 },
  subhead: { fontSize: 16, letterSpacing: 0 },
  body: { fontSize: 15, letterSpacing: 0 },
  caption: { fontSize: 13, letterSpacing: 0.1 },
  label: { fontSize: 11, letterSpacing: 1.2 },
  micro: { fontSize: 11, letterSpacing: 0.2 },
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
    shadowColor: 'rgba(41,24,79,0.26)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 8,
  },
  glass: {
    shadowColor: 'rgba(41,24,79,0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 6,
  },
  deep: {
    shadowColor: 'rgba(23,24,45,0.32)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 10,
  },
  glow: {
    shadowColor: 'rgba(255,94,126,0.30)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  glowGold: {
    shadowColor: 'rgba(255,138,91,0.28)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
};
