const DOMAIN = process.env.EXPO_PUBLIC_PLAUSIBLE_DOMAIN;

export function mountPlausible() {
  if (!DOMAIN || typeof document === 'undefined') return;
  if (document.querySelector('script[data-plausible]')) return;
  const s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', DOMAIN);
  s.setAttribute('data-plausible', 'true');
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
}

export function trackEvent(event: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  (window as any).plausible?.(event, props ? { props } : undefined);
}
