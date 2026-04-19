import type { AkashaTier } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const ABUSE_CAP = 5;

interface Window {
  windowMs: number;
  limit: number;
}

function windowFor(tier: AkashaTier): Window {
  return tier === 'free' ? { windowMs: WEEK_MS, limit: 1 } : { windowMs: DAY_MS, limit: 3 };
}

export interface EvaluateInput {
  tier: AkashaTier;
  timestamps: number[];
  now: number;
}

export interface EvaluateResult {
  allowed: boolean;
  prunedTimestamps: number[];
  nextAvailableAt?: number;
}

export function evaluateRateLimit(input: EvaluateInput): EvaluateResult {
  const { tier, timestamps, now } = input;
  const { windowMs, limit } = windowFor(tier);
  const pruned = timestamps.filter((t) => now - t < windowMs).sort((a, b) => a - b);

  if (pruned.length >= ABUSE_CAP) {
    return { allowed: false, prunedTimestamps: pruned, nextAvailableAt: pruned[0] + windowMs };
  }

  if (pruned.length >= limit) {
    return { allowed: false, prunedTimestamps: pruned, nextAvailableAt: pruned[0] + windowMs };
  }

  return { allowed: true, prunedTimestamps: pruned };
}
