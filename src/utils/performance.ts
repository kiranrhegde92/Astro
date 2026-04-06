/**
 * Performance utilities for CosmicSelf
 *
 * Helpers for memoization, caching, and avoiding unnecessary re-renders.
 */

/**
 * Simple memoization cache with TTL for expensive computations.
 * Used for daily readings, profile calculations, etc.
 */
class ComputeCache {
  private cache = new Map<string, { value: unknown; expiry: number }>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = 3600000): void {
    // Limit cache size to prevent memory leaks
    if (this.cache.size > 100) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

/** Shared cache instance for the app */
export const computeCache = new ComputeCache();

/**
 * Memoize a function with a cache key generator.
 * Results are cached for the specified TTL (default 1 hour).
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn: (...args: Parameters<T>) => string,
  ttlMs: number = 3600000
): T {
  return ((...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = computeCache.get<ReturnType<T>>(key);
    if (cached !== undefined) return cached;
    const result = fn(...args);
    computeCache.set(key, result, ttlMs);
    return result;
  }) as T;
}

/**
 * Get a date-based cache key (changes daily).
 * Useful for daily readings that don't need to recompute within the same day.
 */
export function dailyCacheKey(prefix: string, ...parts: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  return `${prefix}:${today}:${parts.join(':')}`;
}

/**
 * Debounce utility for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  }) as T & { cancel: () => void };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

/**
 * Throttle utility for scroll handlers, animation callbacks.
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  intervalMs: number
): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}
