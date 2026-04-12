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
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
});

// ── RevenueCat ────────────────────────────────────────────────────────────────
export const RevenueCatConfig = section('revenueCat', {
  iosApiKey: '',
  androidApiKey: '',
});

// ── AdMob ─────────────────────────────────────────────────────────────────────
export const AdMobConfig = section('adMob', {
  useProductionAds: false as boolean,
  rewardedAndroidUnitId: '',
  rewardedIosUnitId: '',
});

// ── Convenience bundle ────────────────────────────────────────────────────────
export const Config = {
  firebase: FirebaseConfig,
  revenueCat: RevenueCatConfig,
  adMob: AdMobConfig,
} as const;
