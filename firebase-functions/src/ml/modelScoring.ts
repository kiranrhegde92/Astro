import type { PredictionArea, PredictionFeatureVector, PredictionModelSnapshot } from './types';

const AREA_LABELS: Record<PredictionArea, string> = {
  career: 'work and direction',
  love: 'connection and closeness',
  wellness: 'pace and nervous-system care',
  wealth: 'resources and money decisions',
  education: 'learning and communication',
  travel: 'movement and wider perspective',
};

const WINDOW_WEIGHT: Record<PredictionFeatureVector['window'], number> = {
  today: 1,
  week: 0.9,
  month: 0.82,
  life: 0.74,
};

export interface PredictionModelAdapter {
  name: string;
  version: string;
  score: (features: PredictionFeatureVector) => PredictionModelSnapshot;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundRecord(record: Record<PredictionArea, number>) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, Number(value.toFixed(2))]),
  ) as Record<PredictionArea, number>;
}

export const heuristicPredictionAdapter: PredictionModelAdapter = {
  name: 'heuristic-scorer',
  version: '0.1.0',
  score: (features) => {
    const windowWeight = WINDOW_WEIGHT[features.window];
    const scores: Record<PredictionArea, number> = {
      career: 0.48,
      love: 0.48,
      wellness: 0.48,
      wealth: 0.48,
      education: 0.48,
      travel: 0.48,
    };

    for (const area of Object.keys(scores) as PredictionArea[]) {
      const signal = features.areaSignals[area] ?? 0;
      const tension = features.areaTension[area] ?? 0;
      scores[area] += signal * 0.055 * windowWeight;
      scores[area] -= tension * 0.041 * windowWeight;
    }

    if (features.kpTopArea in scores) {
      scores[features.kpTopArea as PredictionArea] += 0.09;
    }

    if (features.window === 'life') {
      const dashaBias: Partial<Record<string, PredictionArea>> = {
        Sun: 'career',
        Moon: 'wellness',
        Mars: 'career',
        Mercury: 'education',
        Jupiter: 'education',
        Venus: 'love',
        Saturn: 'wealth',
        Rahu: 'travel',
        Ketu: 'wellness',
      };
      const boostedArea = dashaBias[features.dashaPlanet];
      if (boostedArea) scores[boostedArea] += 0.14;
    }

    if (features.seasonalElementMatch) {
      scores.wellness += 0.05;
      scores.love += 0.03;
    }

    if (features.dashaDaysRemaining < 30) {
      scores.travel += 0.04;
      scores.career += 0.03;
    }

    const roundedScores = roundRecord(
      Object.fromEntries(
        Object.entries(scores).map(([area, value]) => [area, clamp(value, 0.05, 0.98)]),
      ) as Record<PredictionArea, number>,
    );

    const topArea = (Object.entries(roundedScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'career') as PredictionArea;
    const completeness =
      (features.confidenceInputs.westernPlanets >= 7 ? 0.18 : 0.1) +
      (features.confidenceInputs.kpPredictions > 0 ? 0.12 : 0.04) +
      (features.signalCount >= 3 ? 0.14 : 0.06);
    const confidence = clamp(
      0.44 + completeness + features.supportTotal * 0.018 - features.challengeTotal * 0.01,
      0.35,
      0.96,
    );

    return {
      window: features.window,
      modelName: 'heuristic-scorer',
      modelVersion: '0.1.0',
      confidence: Number(confidence.toFixed(2)),
      topArea,
      scores: roundedScores,
      summary: `${AREA_LABELS[topArea]} is the area the model currently expects to resonate most for the ${features.window} window.`,
      supportingSignals: features.supportingSignals,
    };
  },
};

export function runPredictionModel(
  features: PredictionFeatureVector,
  adapter: PredictionModelAdapter = heuristicPredictionAdapter,
) {
  return adapter.score(features);
}

