export type PredictionWindow = 'today' | 'week' | 'month' | 'life';
export type PredictionArea = 'career' | 'love' | 'wellness' | 'wealth' | 'education' | 'travel';
export type PredictionVerdict = 'matched' | 'mixed' | 'missed';

export interface PredictionModelSnapshot {
  window: PredictionWindow;
  modelName: string;
  modelVersion: string;
  confidence: number;
  topArea: PredictionArea;
  scores: Record<PredictionArea, number>;
  summary: string;
  supportingSignals: string[];
}

export interface PredictionFeedbackRecord {
  verdict: PredictionVerdict;
  resonance: number;
  note?: string;
}

export interface PredictionDatasetRow {
  runId: string;
  window: PredictionWindow;
  dateKey: string;
  modelName: string;
  modelVersion: string;
  topArea: PredictionArea | null;
  confidence: number | null;
  scores: Record<PredictionArea, number> | null;
  supportingSignals: string[];
  featureVector: Record<string, unknown> | null;
  feedbackVerdict: PredictionVerdict | null;
  feedbackResonance: number | null;
  feedbackNote: string | null;
}

