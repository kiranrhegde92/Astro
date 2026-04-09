import type { CosmicProfile, DashaPlanet, PredictionReference } from '../types/astrology';
import {
  getCurrentSubPeriod,
  getDominantArea,
  getForecastDrivers,
  getNextDashaShift,
  getWindowRange,
  getWindowSamples,
  type ForecastArea,
} from './predictionSignals';

export type ForecastWindow = 'week' | 'month';

export interface PeriodForecast {
  window: ForecastWindow;
  title: string;
  headline: string;
  summary: string;
  focusAreas: Array<{
    label: string;
    text: string;
  }>;
  brightWindow: string;
  cautionWindow: string;
  ritualPrompt: string;
  drivers?: string[];
  references: PredictionReference[];
}

const AREA_TONE: Record<ForecastArea, string> = {
  career: 'work, leadership, and directional choices',
  love: 'connection, vulnerability, and honest conversation',
  wellness: 'pace, regulation, and recovery',
  wealth: 'resources, pricing, and stability',
  education: 'learning, writing, and sharper thinking',
  travel: 'movement, reach, and perspective shifts',
};

const AREA_PROMPTS: Record<ForecastArea, string> = {
  career: 'protect one serious block for the thing that advances your work for real',
  love: 'choose the softer honest sentence over the polished distant one',
  wellness: 'slow down early enough that the body never has to drag you into it',
  wealth: 'make resource decisions from clarity, not from a temporary spike in emotion',
  education: 'capture insight while it is live and before the day fragments it',
  travel: 'build margin around movement instead of filling every gap',
};

const DASHA_FOCUS: Record<DashaPlanet, string> = {
  Ketu: 'release, pruning, and spiritual distance from the noise',
  Venus: 'beauty, relating, and value alignment',
  Sun: 'visibility, authorship, and cleaner self-respect',
  Moon: 'emotional truth, rhythm, and inner regulation',
  Mars: 'boldness, friction, and exact action',
  Rahu: 'ambition, experimentation, and rapid change',
  Jupiter: 'teaching, learning, and expansion',
  Saturn: 'discipline, patience, and sustainable structure',
  Mercury: 'writing, planning, and better decisions made earlier',
};

function getSafePlanet(value: unknown, fallback: DashaPlanet = 'Sun'): DashaPlanet {
  return typeof value === 'string' && value ? (value as DashaPlanet) : fallback;
}

function getCurrentDashaPlanet(profile: Partial<CosmicProfile>): DashaPlanet {
  return profile.vedic?.currentDasha?.planet ?? profile.vedic?.dashas?.find((period) => period?.planet)?.planet ?? 'Sun';
}

function getHeadline(
  profile: Partial<CosmicProfile>,
  drivers: string[],
  dominantArea: ForecastArea,
  nextShift: ReturnType<typeof getNextDashaShift>,
  window: ForecastWindow,
) {
  const nextShiftPlanet = nextShift ? getSafePlanet((nextShift as { planet?: unknown }).planet) : null;

  if (nextShift && nextShiftPlanet) {
    const shiftDate = new Date(nextShift.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${getCurrentDashaPlanet(profile)} hands the chapter to ${nextShiftPlanet} around ${shiftDate}.`;
  }

  if (drivers[0]) {
    return `${drivers[0]} keeps shaping ${AREA_TONE[dominantArea]} over the next ${window === 'week' ? 'week' : 'month'}.`;
  }

  return `${profile.western?.sun ?? 'Leo'} focus does better with deliberate pacing than scattered urgency.`;
}

function getSummary(
  supportArea: ForecastArea,
  challengeArea: ForecastArea,
  profile: Partial<CosmicProfile>,
  window: ForecastWindow,
) {
  const dashaPlanet = getCurrentDashaPlanet(profile);
  const subPeriod = getCurrentSubPeriod(profile, new Date());
  const subPeriodPlanet = subPeriod ? getSafePlanet((subPeriod as { planet?: unknown }).planet) : null;
  const span = window === 'week' ? 'The next 7 days' : 'The next 30 days';

  return `${span} open most cleanly around ${AREA_TONE[supportArea]}, while ${AREA_TONE[challengeArea]} need slower handling. ${dashaPlanet} timing keeps the larger mood centered on ${DASHA_FOCUS[dashaPlanet]}${subPeriodPlanet ? `, with a ${subPeriodPlanet} sub-period sharpening the smaller decisions.` : '.'}`;
}

export function generatePeriodForecast(
  date: Date,
  profile: Partial<CosmicProfile>,
  window: ForecastWindow,
): PeriodForecast {
  const samples = getWindowSamples(profile, date, window);
  const brightSpan = window === 'week' ? 2 : 5;
  const cautionSpan = window === 'week' ? 2 : 4;
  const brightWindow = getWindowRange(samples, 'support', brightSpan);
  const cautionWindow = getWindowRange(samples, 'challenge', cautionSpan);
  const drivers = getForecastDrivers(samples);
  const supportArea = getDominantArea(samples, 'supportArea');
  const challengeArea = getDominantArea(samples, 'challengeArea');
  const nextShift = getNextDashaShift(profile, date, window === 'week' ? 7 : 30);
  const kpPredictions = [...(profile.kp?.predictions ?? [])];
  const kpLead =
    kpPredictions.find((prediction) => prediction.area === supportArea || (supportArea === 'wellness' && prediction.area === 'health')) ??
    kpPredictions.sort((a, b) => b.confidence - a.confidence)[0];
  const currentDashaPlanet = getCurrentDashaPlanet(profile);
  const nextShiftPlanet = nextShift ? getSafePlanet((nextShift as { planet?: unknown }).planet) : null;
  const currentMonthElement = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'][date.getMonth()] ?? 'Earth';

  return {
    window,
    title: window === 'week' ? 'Next 7 days' : 'Next 30 days',
    headline: getHeadline(profile, drivers, supportArea, nextShift, window),
    summary: getSummary(supportArea, challengeArea, profile, window),
    focusAreas: [
      {
        label: 'Western',
        text: drivers[0]
          ? `The clearest western driver is ${drivers[0]}. Use that opening for ${AREA_TONE[supportArea]}.`
          : `Your chart is strongest when ${AREA_PROMPTS[supportArea]}.`,
      },
      {
        label: 'Vedic',
        text: nextShift
          ? `${currentDashaPlanet} Mahadasha begins giving way to ${nextShiftPlanet ?? 'the next cycle'}, so timing is shifting mid-cycle instead of staying flat.`
          : `${currentDashaPlanet} Mahadasha keeps the whole window focused on ${DASHA_FOCUS[currentDashaPlanet]}.`,
      },
      {
        label: 'Chinese',
        text: `${currentMonthElement} seasonal tone interacts with your ${profile.chinese?.element ?? 'Wood'} nature. The cleaner move is ${AREA_PROMPTS[supportArea]}.`,
      },
      {
        label: 'KP',
        text: kpLead
          ? `KP keeps highlighting ${kpLead.area === 'health' ? 'wellness' : kpLead.area} matters, especially when you act during the open window instead of the pressured one.`
          : `KP timing says the best outcomes come from fewer, exact decisions rather than reactive pivots.`,
      },
    ],
    brightWindow: brightWindow.label,
    cautionWindow: cautionWindow.label,
    ritualPrompt: AREA_PROMPTS[supportArea],
    drivers,
    references: [
      { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
      { source: 'Planets in Transit', type: 'book', tradition: 'western' },
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
      { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
    ],
  };
}
