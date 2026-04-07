import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

const functions = getFunctions(app, 'us-central1');

// ─── calculateChart ───────────────────────────────────────────────────────────
export interface ChartInput {
  birthDate: string;   // 'YYYY-MM-DD'
  birthTime: string;   // 'HH:MM'
  birthPlace: string;  // 'City, Country'
}

export interface ChartResult {
  success: boolean;
  chart: {
    western: any;
    vedic: any;
    chinese: any;
    kp: any;
    birthData: any;
  };
}

export async function calculateUserChart(input: ChartInput): Promise<ChartResult> {
  const fn = httpsCallable<ChartInput, ChartResult>(functions, 'calculateChart');
  const result = await fn(input);
  return result.data;
}

// ─── getDailyReading ──────────────────────────────────────────────────────────
export async function fetchDailyReading(): Promise<{ reading: any; cached: boolean }> {
  const fn = httpsCallable(functions, 'getDailyReading');
  const result = await fn({});
  return result.data as any;
}
