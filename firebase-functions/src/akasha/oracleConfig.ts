import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import type { OracleProvider } from './oracleClient';

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  provider: OracleProvider;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

function fallbackProvider(): OracleProvider {
  const env = (process.env.MODEL_PROVIDER ?? 'gemini').toLowerCase();
  if (env === 'claude' || env === 'anthropic') return 'claude';
  return 'gemini';
}

function sanitize(raw: unknown): OracleProvider {
  const v = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (v === 'claude' || v === 'anthropic') return 'claude';
  if (v === 'gemini') return 'gemini';
  return fallbackProvider();
}

export async function getActiveProvider(
  db: admin.firestore.Firestore = admin.firestore(),
): Promise<OracleProvider> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.provider;
  }

  try {
    const snap = await db.doc('config/oracle').get();
    const provider = sanitize(snap.exists ? snap.data()?.provider : undefined);
    cache = { provider, fetchedAt: now };
    return provider;
  } catch (err) {
    logger.warn('oracleConfig fetch failed, using fallback', { err });
    const provider = fallbackProvider();
    cache = { provider, fetchedAt: now };
    return provider;
  }
}

export function invalidateOracleConfigCache(): void {
  cache = null;
}
