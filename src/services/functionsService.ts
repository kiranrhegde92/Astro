import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';
import type {
  PredictionDatasetRow,
  PredictionFeedbackRecord,
  PredictionModelSnapshot,
  PredictionWindow,
} from '../types/prediction';

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

// ─── calculateCompatibility ───────────────────────────────────────────────────
export async function fetchCompatibility(partnerUid: string): Promise<{ synastry: any }> {
  const fn = httpsCallable<{ partnerUid: string }, { synastry: any }>(functions, 'calculateCompatibility');
  const result = await fn({ partnerUid });
  return result.data;
}

// ─── registerFCMToken ─────────────────────────────────────────────────────────
export async function registerPushToken(token: string): Promise<void> {
  const fn = httpsCallable(functions, 'registerFCMToken');
  await fn({ token });
}

export async function deleteMyAccount(): Promise<void> {
  const fn = httpsCallable(functions, 'deleteMyAccount');
  await fn({});
}

export async function fetchPredictionModelSnapshot(
  window: PredictionWindow
): Promise<{ runId: string; snapshot: PredictionModelSnapshot; feedback: PredictionFeedbackRecord | null; cached: boolean }> {
  const fn = httpsCallable<{ window: PredictionWindow }, { runId: string; snapshot: PredictionModelSnapshot; feedback: PredictionFeedbackRecord | null; cached: boolean }>(
    functions,
    'getPredictionModelSnapshot'
  );
  const result = await fn({ window });
  return result.data;
}

export async function submitPredictionFeedback(input: {
  runId: string;
  verdict: PredictionFeedbackRecord['verdict'];
  resonance: number;
  note?: string;
}): Promise<{ success: boolean; feedback: PredictionFeedbackRecord }> {
  const fn = httpsCallable<typeof input, { success: boolean; feedback: PredictionFeedbackRecord }>(functions, 'savePredictionFeedback');
  const result = await fn(input);
  return result.data;
}

export async function exportMyPredictionDataset(limit = 250): Promise<{
  summary: { totalRuns: number; labeledRuns: number; labelRate: number };
  rows: PredictionDatasetRow[];
}> {
  const fn = httpsCallable<{ limit: number }, { summary: { totalRuns: number; labeledRuns: number; labelRate: number }; rows: PredictionDatasetRow[] }>(
    functions,
    'exportMyPredictionDataset'
  );
  const result = await fn({ limit });
  return result.data;
}
