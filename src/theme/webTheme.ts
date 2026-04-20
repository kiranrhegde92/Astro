export const WEB_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const WEB_TYPE = {
  hero: 'clamp(2.25rem, 4.5vw, 4rem)',
  h1: 'clamp(1.875rem, 3.2vw, 2.75rem)',
  h2: 'clamp(1.5rem, 2.4vw, 2rem)',
  h3: 'clamp(1.25rem, 1.8vw, 1.5rem)',
  body: 'clamp(1rem, 1.1vw, 1.125rem)',
  small: '0.875rem',
} as const;

export const WEB_MAX_WIDTH = 1200;
export const WEB_CONTENT_WIDTH = 760;
