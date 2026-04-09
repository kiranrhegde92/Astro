import type { PredictionArea, PredictionFeatureVector, PredictionWindow } from './types';

type Signal = {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  house: number;
  support: number;
  tension: number;
};

const HOUSE_GROUPS: Record<PredictionArea, number[]> = {
  love: [5, 7, 11],
  career: [2, 6, 10],
  wellness: [1, 6, 12],
  wealth: [2, 8, 11],
  education: [3, 4, 5, 9],
  travel: [3, 9, 12],
};

const TRANSIT_WEIGHTS: Record<string, number> = {
  SUN: 1.6,
  MOON: 1.4,
  MERCURY: 1.8,
  VENUS: 2,
  MARS: 2.1,
  JUPITER: 2.8,
  SATURN: 3,
  MEAN_NODE: 2.4,
  KETU: 2.2,
};

const ASPECTS = [
  { name: 'conjunction', angle: 0, maxOrb: 6, support: 1.1, tension: 0.2 },
  { name: 'trine', angle: 120, maxOrb: 6, support: 1, tension: 0 },
  { name: 'sextile', angle: 60, maxOrb: 4, support: 0.82, tension: 0 },
  { name: 'square', angle: 90, maxOrb: 5, support: 0.1, tension: 1 },
  { name: 'opposition', angle: 180, maxOrb: 6, support: 0.2, tension: 0.9 },
];

const MONTH_ELEMENTS = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'];

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function toLongitude(sign: string, degree: number) {
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = SIGNS.indexOf(sign);
  return ((signIndex < 0 ? 0 : signIndex) * 30) + (degree ?? 0);
}

function formatPlanet(planet: string) {
  const labels: Record<string, string> = {
    MEAN_NODE: 'Rahu',
    KETU: 'Ketu',
    SUN: 'Sun',
    MOON: 'Moon',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
  };
  return labels[planet] ?? planet;
}

function formatSignal(signal: Pick<Signal, 'transitPlanet' | 'natalPlanet' | 'aspect'>) {
  return `${formatPlanet(signal.transitPlanet)} ${signal.aspect} natal ${formatPlanet(signal.natalPlanet)}`;
}

function planetMatchesArea(planet: string, area: PredictionArea) {
  const groups: Record<PredictionArea, string[]> = {
    love: ['MOON', 'VENUS'],
    career: ['SUN', 'MARS', 'MERCURY', 'JUPITER', 'SATURN'],
    wellness: ['MOON', 'SATURN', 'SUN'],
    wealth: ['VENUS', 'JUPITER', 'SATURN'],
    education: ['MERCURY', 'JUPITER', 'MOON'],
    travel: ['JUPITER', 'MEAN_NODE', 'KETU', 'MERCURY'],
  };
  return groups[area].includes(planet);
}

function getAreaImpact(signals: Signal[], area: PredictionArea, mode: 'support' | 'tension') {
  return signals.reduce((sum, signal) => {
    const matchesHouse = HOUSE_GROUPS[area].includes(signal.house);
    const matchesPlanet = planetMatchesArea(signal.transitPlanet, area) || planetMatchesArea(signal.natalPlanet, area);
    if (!matchesHouse && !matchesPlanet) return sum;
    return sum + (mode === 'support' ? signal.support : signal.tension);
  }, 0);
}

function getSubDashaProgress(currentDasha: any, subDasha: any, date: Date) {
  if (!currentDasha || !subDasha) return 0;
  const start = new Date(subDasha.startDate ?? currentDasha.startDate).getTime();
  const end = new Date(subDasha.endDate ?? currentDasha.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.max(0, Math.min(1, (date.getTime() - start) / (end - start)));
}

export function extractPredictionFeatures(
  chart: any,
  transits: Record<string, any>,
  date: Date,
  window: PredictionWindow,
): PredictionFeatureVector {
  const signals = Object.entries(transits)
    .filter(([planet]) => ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'MEAN_NODE', 'KETU'].includes(planet))
    .flatMap(([transitPlanet, transitValue]) =>
      Object.entries(chart.western?.planets ?? {}).flatMap(([natalPlanet, natalValue]: [string, any]) => {
        const transitLon = Number((transitValue as any)?.longitude);
        const natalLon = typeof natalValue?.longitude === 'number'
          ? Number(natalValue.longitude)
          : toLongitude(natalValue?.sign, Number(natalValue?.degree ?? 0));

        if (Number.isNaN(transitLon) || Number.isNaN(natalLon)) return [];

        let separation = Math.abs(transitLon - natalLon);
        if (separation > 180) separation = 360 - separation;

        for (const aspect of ASPECTS) {
          const orb = Math.abs(separation - aspect.angle);
          if (orb <= aspect.maxOrb) {
            const closeness = Math.max(0.2, 1 - (orb / aspect.maxOrb));
            const weight = TRANSIT_WEIGHTS[transitPlanet] ?? 1.5;
            return [{
              transitPlanet,
              natalPlanet,
              aspect: aspect.name,
              orb: Number(orb.toFixed(2)),
              house: Number(natalValue?.house ?? 0),
              support: Number((weight * closeness * aspect.support).toFixed(2)),
              tension: Number((weight * closeness * aspect.tension).toFixed(2)),
            } satisfies Signal];
          }
        }

        return [];
      }),
    )
    .sort((a, b) => (b.support + b.tension) - (a.support + a.tension));

  const dashaEnd = new Date(chart.vedic?.currentDasha?.endDate ?? date).getTime();
  const dashaDaysRemaining = Number.isFinite(dashaEnd)
    ? Math.max(0, Math.round((dashaEnd - date.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const seasonalElement = MONTH_ELEMENTS[date.getMonth()] ?? 'Earth';
  const areaSignals = {
    career: getAreaImpact(signals, 'career', 'support'),
    love: getAreaImpact(signals, 'love', 'support'),
    wellness: getAreaImpact(signals, 'wellness', 'support'),
    wealth: getAreaImpact(signals, 'wealth', 'support'),
    education: getAreaImpact(signals, 'education', 'support'),
    travel: getAreaImpact(signals, 'travel', 'support'),
  };
  const areaTension = {
    career: getAreaImpact(signals, 'career', 'tension'),
    love: getAreaImpact(signals, 'love', 'tension'),
    wellness: getAreaImpact(signals, 'wellness', 'tension'),
    wealth: getAreaImpact(signals, 'wealth', 'tension'),
    education: getAreaImpact(signals, 'education', 'tension'),
    travel: getAreaImpact(signals, 'travel', 'tension'),
  };

  const kpPredictions = Array.isArray(chart.kp?.predictions) ? chart.kp.predictions : [];
  const kpTopArea = kpPredictions.sort((a: any, b: any) => Number(b.confidence ?? 0) - Number(a.confidence ?? 0))[0]?.area ?? 'career';

  return {
    window,
    dateKey: formatDateKey(date),
    westernSun: chart.western?.sun ?? 'Aries',
    westernElement: chart.western?.dominantElement ?? 'Fire',
    westernModality: chart.western?.dominantModality ?? 'Cardinal',
    vedicRashi: chart.vedic?.rashi ?? 'Mesha',
    dashaPlanet: chart.vedic?.currentDasha?.planet ?? 'Sun',
    subDashaPlanet: chart.vedic?.subDasha?.planet ?? chart.vedic?.currentDasha?.planet ?? 'Sun',
    chineseAnimal: chart.chinese?.animal ?? 'Rat',
    chineseElement: chart.chinese?.element ?? 'Wood',
    kpTopArea,
    supportTotal: Number(signals.reduce((sum, signal) => sum + signal.support, 0).toFixed(2)),
    challengeTotal: Number(signals.reduce((sum, signal) => sum + signal.tension, 0).toFixed(2)),
    areaSignals: Object.fromEntries(
      Object.entries(areaSignals).map(([area, value]) => [area, Number(value.toFixed(2))]),
    ) as Record<PredictionArea, number>,
    areaTension: Object.fromEntries(
      Object.entries(areaTension).map(([area, value]) => [area, Number(value.toFixed(2))]),
    ) as Record<PredictionArea, number>,
    signalCount: signals.length,
    dashaDaysRemaining,
    subDashaProgress: Number(getSubDashaProgress(chart.vedic?.currentDasha, chart.vedic?.subDasha, date).toFixed(3)),
    seasonalElementMatch: seasonalElement === (chart.chinese?.element ?? 'Wood') ? 1 : 0,
    confidenceInputs: {
      westernPlanets: Array.isArray(chart.western?.planets) ? chart.western.planets.length : Object.keys(chart.western?.planets ?? {}).length,
      kpPredictions: kpPredictions.length,
      remedies: Array.isArray(chart.vedic?.remedies) ? chart.vedic.remedies.length : 0,
    },
    supportingSignals: signals.slice(0, 5).map((signal) => formatSignal(signal)),
  };
}

