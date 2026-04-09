export type PredictionWindow = 'today' | 'week' | 'month' | 'life';
export type PredictionArea = 'career' | 'love' | 'wellness' | 'wealth' | 'education' | 'travel';
export type PredictionVerdict = 'matched' | 'mixed' | 'missed';

export interface PredictionFeatureVector {
  window: PredictionWindow;
  dateKey: string;
  westernSun: string;
  westernElement: string;
  westernModality: string;
  vedicRashi: string;
  dashaPlanet: string;
  subDashaPlanet: string;
  chineseAnimal: string;
  chineseElement: string;
  kpTopArea: string;
  supportTotal: number;
  challengeTotal: number;
  areaSignals: Record<PredictionArea, number>;
  areaTension: Record<PredictionArea, number>;
  signalCount: number;
  dashaDaysRemaining: number;
  subDashaProgress: number;
  seasonalElementMatch: number;
  confidenceInputs: {
    westernPlanets: number;
    kpPredictions: number;
    remedies: number;
  };
  supportingSignals: string[];
}

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

export interface PredictionRunRecord {
  runId: string;
  window: PredictionWindow;
  dateKey: string;
  modelName: string;
  modelVersion: string;
  chartVersion: number;
  featureVector: PredictionFeatureVector;
  snapshot: PredictionModelSnapshot;
  createdAt?: unknown;
  updatedAt?: unknown;
  feedback?: PredictionFeedbackRecord;
}

export interface PredictionFeedbackRecord {
  verdict: PredictionVerdict;
  resonance: number;
  note?: string;
  submittedAt?: unknown;
}

