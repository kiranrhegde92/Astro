export const COLORS = {
  // Primary cosmic gradients
  deepSpace: '#0a0a2e',
  nebula: '#1a1a4e',
  cosmic: '#2d1b69',
  violet: '#7b2fbe',
  aurora: '#00d2ff',
  starGold: '#ffd700',
  moonSilver: '#c0c0c0',
  sunOrange: '#ff8c00',

  // System accent colors
  western: '#7b68ee',    // Medium slate blue
  vedic: '#ff6b35',      // Saffron orange
  chinese: '#dc143c',    // Crimson red
  kp: '#00ced1',         // Dark turquoise

  // UI colors
  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#b8b8d4',
  textMuted: '#6b6b8d',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  success: '#00e676',
  warning: '#ffab40',
  error: '#ff5252',

  // Gradients
  gradientPrimary: ['#0a0a2e', '#1a1a4e', '#2d1b69'] as const,
  gradientCard: ['rgba(123, 47, 190, 0.3)', 'rgba(0, 210, 255, 0.1)'] as const,
  gradientWestern: ['#4a00e0', '#8e2de2'] as const,
  gradientVedic: ['#ff6b35', '#f7971e'] as const,
  gradientChinese: ['#dc143c', '#ff4500'] as const,
  gradientKP: ['#00ced1', '#00bcd4'] as const,
  gradientGold: ['#f7971e', '#ffd200'] as const,
  gradientCompatibility: ['#ff6b6b', '#ee5a24', '#ffd32a'] as const,
};

export const FONTS = {
  light: 'System',
  regular: 'System',
  medium: 'System',
  bold: 'System',
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
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  glow: {
    shadowColor: '#7b2fbe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
