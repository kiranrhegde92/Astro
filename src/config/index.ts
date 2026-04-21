/**
 * Central application configuration.
 *
 * All API keys, service credentials, and feature flags live here.
 * Values are injected at build time from .env via app.config.js → expo-constants.
 *
 * Usage:
 *   import { Config } from '../config';
 *   Config.firebase.projectId
 *   Config.revenueCat.iosApiKey
 *   Config.adMob.rewardedAndroidUnitId
 */

import Constants from 'expo-constants';

// expo-constants exposes app.config.js `extra` at runtime
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

function section<T extends Record<string, unknown>>(key: string, defaults: T): T {
  const block = (extra[key] ?? {}) as Partial<T>;
  const result = { ...defaults } as T;
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    const v = block[k];
    if (v !== undefined && v !== null && v !== '') {
      (result as Record<keyof T, unknown>)[k] = v;
    }
  }
  return result;
}

// ── Firebase ──────────────────────────────────────────────────────────────────
export const FirebaseConfig = section('firebase', {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
});

// ── RevenueCat ────────────────────────────────────────────────────────────────
export const RevenueCatConfig = section('revenueCat', {
  iosApiKey: env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  androidApiKey: env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
});

// ── AdMob ─────────────────────────────────────────────────────────────────────
export const AdMobConfig = section('adMob', {
  useProductionAds: env.EXPO_PUBLIC_ADMOB_USE_PRODUCTION === 'true',
  rewardedAndroidUnitId: env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ?? '',
  rewardedIosUnitId: env.EXPO_PUBLIC_ADMOB_REWARDED_IOS ?? '',
});

// ── Convenience bundle ────────────────────────────────────────────────────────
export const Config = {
  firebase: FirebaseConfig,
  revenueCat: RevenueCatConfig,
  adMob: AdMobConfig,
} as const;
