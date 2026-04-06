/**
 * CosmicSelf — Obsidian Glass Design System
 * Theme: Pure black base · White glass cards · Vibrant system accents
 * Fonts: Cinzel (Roman display) + System body
 * 3D: Depth via layered shadows + glossy overlays + chrome gradients
 */

// ─── Base Palette ─────────────────────────────────────────────────────────────
const BLACK = {
  true:   '#000000',
  950:    '#050505',
  900:    '#0a0a0a',
  850:    '#0f0f0f',
  800:    '#141414',
  750:    '#1a1a1a',
  700:    '#1f1f1f',
  600:    '#2a2a2a',
};

const WHITE = {
  true:  '#ffffff',
  w98:   'rgba(255,255,255,0.98)',
  w85:   'rgba(255,255,255,0.85)',
  w65:   'rgba(255,255,255,0.65)',
  w42:   'rgba(255,255,255,0.42)',
  w22:   'rgba(255,255,255,0.22)',
  w12:   'rgba(255,255,255,0.12)',
  w07:   'rgba(255,255,255,0.07)',
  w04:   'rgba(255,255,255,0.04)',
};

const SILVER = {
  bright:  '#E8E8F0',
  mid:     '#C0C0CC',
  dim:     '#888899',
  dark:    '#444455',
};

const GOLD = {
  bright:  '#FFD700',
  mid:     '#E5B800',
  dim:     '#B8960C',
  pale:    '#F0E080',
};

// ─── System Accent Colors (vibrant pops on monochrome) ──────────────────────
const ACCENT = {
  western:  '#7C6DFF',   // electric indigo
  vedic:    '#FF6B35',   // ember orange
  chinese:  '#FF3A5C',   // neon rose
  kp:       '#00E5D1',   // electric teal
};

// ─── Exported COLORS ──────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg:           '#0e0e18',
  bgDeep:       '#0a0a12',
  bgCard:       '#14141f',
  bgElevated:   '#1a1a28',

  // Glass
  glassBg:           WHITE.w04,
  glassBgMid:        WHITE.w07,
  glassBorder:       WHITE.w12,
  glassBorderBright: WHITE.w22,
  glassHighlight:    WHITE.w12,

  // Text
  textPrimary:   WHITE.true,
  textSecondary: WHITE.w65,
  textMuted:     WHITE.w42,

  // Metals
  silver:        SILVER.bright,
  silverMid:     SILVER.mid,
  silverDim:     SILVER.dim,
  white:         WHITE.true,
  gold:          GOLD.bright,
  goldMid:       GOLD.mid,
  starGold:      GOLD.bright,
  starGoldDeep:  GOLD.dim,

  // System accents
  western:       ACCENT.western,
  vedic:         ACCENT.vedic,
  chinese:       ACCENT.chinese,
  kp:            ACCENT.kp,

  // Legacy aliases
  violet:        ACCENT.western,
  violetLight:   '#A89EFF',
  violetBright:  '#A89EFF',
  teal:          ACCENT.kp,
  tealLight:     '#55F5E8',
  deepSpace:     BLACK.true,
  nebula:        BLACK[800],
  cosmic:        BLACK[700],
  aurora:        ACCENT.kp,

  // Status
  success: '#00E09A',
  warning: GOLD.bright,
  error:   '#FF3A5C',

  // System colors (extra)
  sunOrange:  ACCENT.vedic,
  moonSilver: SILVER.bright,

  // Gradients
  gradientBg:        ['#000000', '#050508', '#000000'] as const,
  gradientCard:      ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'] as const,
  gradientPrimary:   [ACCENT.western, ACCENT.kp] as const,
  gradientGold:      [GOLD.dim, GOLD.bright] as const,
  gradientSilver:    ['rgba(220,220,240,0.22)', 'rgba(140,140,160,0.05)'] as const,
  gradientChrome:    ['rgba(255,255,255,0.18)', 'rgba(180,180,200,0.04)'] as const,
  gradientWestern:   ['#3D35CC', ACCENT.western] as const,
  gradientVedic:     ['#CC3A10', ACCENT.vedic] as const,
  gradientChinese:   ['#CC0030', ACCENT.chinese] as const,
  gradientKP:        ['#007A72', ACCENT.kp] as const,
  gradientMystic:    [ACCENT.western, ACCENT.kp] as const,
  gradientCompatibility: ['#CC0030', ACCENT.vedic, GOLD.dim] as const,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
  display: 'Cinzel_900Black',   // hero titles — Roman capitals
  heading: 'Cinzel_700Bold',    // section heads
  accent:  'Cinzel_400Regular', // labels, badges
  body:    'System',
};

// ─── 8px base spacing grid ────────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Border radius ────────────────────────────────────────────────────────────
export const BORDER_RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   26,
  xxl:  34,
  full: 9999,
};

// ─── Shadows (3D depth system) ────────────────────────────────────────────────
export const SHADOWS = {
  // Floating card — white top glow + deep black drop
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  // Subtle glass elevation
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  // Bold floating — hero elements
  deep: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.9,
    shadowRadius: 36,
    elevation: 24,
  },
  // White inner glow (for accent elements)
  glow: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  },
  // Gold accent glow
  glowGold: {
    shadowColor: GOLD.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 10,
  },
};
