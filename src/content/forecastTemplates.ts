import type { CosmicProfile, DashaPlanet, PredictionReference } from '../types/astrology';
import {
  getCurrentSubPeriod,
  getDominantArea,
  getForecastDrivers,
  getForecastImpactScores,
  getNextDashaShift,
  getNextSubPeriodShift,
  getWindowRange,
  getWindowSamples,
  type ForecastArea,
  type ForecastImpactScore,
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
  impactScores: ForecastImpactScore[];
  references: PredictionReference[];
}

// ── Area tone descriptions ─────────────────────────────────────────────────

const AREA_TONE: Record<ForecastArea, string> = {
  career: 'work, leadership, and directional choices',
  love: 'connection, vulnerability, and honest conversation',
  wellness: 'pace, regulation, and recovery',
  wealth: 'resources, pricing, and stability',
  education: 'learning, writing, and sharper thinking',
  travel: 'movement, reach, and perspective shifts',
};

// Short-term (weekly) action prompts — specific and immediate
const AREA_WEEKLY_PROMPTS: Record<ForecastArea, string> = {
  career: 'protect one serious block for the work that advances your position this week',
  love: 'choose the softer honest sentence over the polished distant one',
  wellness: 'slow down early enough this week that the body never has to drag you into it',
  wealth: 'make this week\'s resource decisions from clarity, not a temporary spike in emotion',
  education: 'capture the insight that keeps surfacing before the week fragments it',
  travel: 'build margin around movement instead of filling every gap this week',
};

// Long-term (monthly) ritual prompts — sustained and structural
const AREA_MONTHLY_PROMPTS: Record<ForecastArea, string> = {
  career: 'identify the one move that raises your ceiling this month, then protect the time to execute it fully',
  love: 'deepen one relationship through consistent small acts rather than a single intense gesture',
  wellness: 'build one recovery habit that holds across the whole month, not just during the easy days',
  wealth: 'make one structural financial decision from calm clarity before the month closes',
  education: 'complete one full learning cycle — start it, work through it, close it — before starting the next',
  travel: 'plan the one movement that genuinely widens your perspective and build real margin on both sides',
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

// ── Helpers ────────────────────────────────────────────────────────────────

function getSafePlanet(value: unknown, fallback: DashaPlanet = 'Sun'): DashaPlanet {
  return typeof value === 'string' && value ? (value as DashaPlanet) : fallback;
}

function getCurrentDashaPlanet(profile: Partial<CosmicProfile>): DashaPlanet {
  return profile.vedic?.currentDasha?.planet ?? profile.vedic?.dashas?.find((period) => period?.planet)?.planet ?? 'Sun';
}

// ── Headline ───────────────────────────────────────────────────────────────
// Week: surface the top short-term driver.
// Month: emphasise the arc — multiple drivers or the sustained current.

function getHeadline(
  profile: Partial<CosmicProfile>,
  drivers: string[],
  dominantArea: ForecastArea,
  nextShift: ReturnType<typeof getNextDashaShift>,
  window: ForecastWindow,
) {
  const nextShiftPlanet = nextShift ? getSafePlanet((nextShift as { planet?: unknown }).planet) : null;

  if (window === 'week') {
    if (nextShift && nextShiftPlanet) {
      const shiftDate = new Date(nextShift.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${getCurrentDashaPlanet(profile)} hands the chapter to ${nextShiftPlanet} around ${shiftDate} — this week sits right on that edge.`;
    }
    if (drivers[0]) {
      return `${drivers[0]} keeps shaping ${AREA_TONE[dominantArea]} over the next 7 days.`;
    }
    return `${profile.western?.sun ?? 'Leo'} focus does better with deliberate pacing than scattered urgency this week.`;
  }

  // Month window
  if (nextShift && nextShiftPlanet) {
    const shiftDate = new Date(nextShift.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${getCurrentDashaPlanet(profile)} Mahadasha gives way to ${nextShiftPlanet} around ${shiftDate}, splitting the month into two distinct phases.`;
  }
  if (drivers.length >= 2) {
    return `${drivers[0]} and ${drivers[1]} trade influence across the month, both pointing toward ${AREA_TONE[dominantArea]}.`;
  }
  if (drivers[0]) {
    return `${drivers[0]} defines the sustained current for ${AREA_TONE[dominantArea]} across all 30 days.`;
  }
  return `${profile.western?.sun ?? 'Leo'} energy builds steadily this month — momentum started early compounds better than late corrections.`;
}

// ── Summary ────────────────────────────────────────────────────────────────
// Week: focused and immediate — what opens, what needs care, this week's mood.
// Month: arc-shaped — early/mid/late phases, outer-planet background.

function getSummary(
  supportArea: ForecastArea,
  challengeArea: ForecastArea,
  profile: Partial<CosmicProfile>,
  window: ForecastWindow,
  phases?: { early: ForecastArea; mid: ForecastArea; late: ForecastArea },
) {
  const dashaPlanet = getCurrentDashaPlanet(profile);
  const subPeriod = getCurrentSubPeriod(profile, new Date());
  const subPeriodPlanet = subPeriod ? getSafePlanet((subPeriod as { planet?: unknown }).planet) : null;

  if (window === 'week') {
    return `The next 7 days open most cleanly around ${AREA_TONE[supportArea]}, while ${AREA_TONE[challengeArea]} need slower, more deliberate handling. ${dashaPlanet} timing keeps the larger mood centered on ${DASHA_FOCUS[dashaPlanet]}${subPeriodPlanet ? `, with a ${subPeriodPlanet} sub-period sharpening the smaller day-to-day decisions.` : '.'}`;
  }

  // Month window: describe the arc in three actual phases
  if (phases) {
    return `Days 1-10 lead with ${AREA_TONE[phases.early]}, days 11-20 shift toward ${AREA_TONE[phases.mid]} where pacing matters most, and days 21-30 close on ${AREA_TONE[phases.late]} — steady follow-through beats reactive adjustments. ${dashaPlanet} Mahadasha holds the background tone throughout${subPeriodPlanet ? `, while ${subPeriodPlanet} sub-period activity adds texture mid-month.` : '.'}`;
  }
  return `The month opens with a push toward ${AREA_TONE[supportArea]}, moves through a mid-period where ${AREA_TONE[challengeArea]} demands more careful navigation, and closes with a window that rewards steady follow-through over reactive adjustments. ${dashaPlanet} Mahadasha holds the background tone throughout${subPeriodPlanet ? `, while ${subPeriodPlanet} sub-period activity adds texture to the finer decisions mid-month.` : ', so the larger direction stays consistent even when shorter cycles shift.'}`;
}

// ── Main generator ─────────────────────────────────────────────────────────

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
  const impactScores = getForecastImpactScores(samples);
  const supportArea = getDominantArea(samples, 'supportArea');
  const challengeArea = getDominantArea(samples, 'challengeArea');
  const nextShift = getNextDashaShift(profile, date, window === 'week' ? 7 : 30);
  const nextSubShift = window === 'month' ? getNextSubPeriodShift(profile, date, 30) : undefined;
  const nextSubShiftPlanet = nextSubShift ? getSafePlanet((nextSubShift as { planet?: unknown }).planet) : null;
  const phaseAreas = window === 'month' && samples.length >= 30
    ? {
        early: getDominantArea(samples.slice(0, 10), 'supportArea'),
        mid: getDominantArea(samples.slice(10, 20), 'supportArea'),
        late: getDominantArea(samples.slice(20, 30), 'supportArea'),
      }
    : undefined;
  const brightLabel = brightWindow.flat ? 'Steady tempo — no standout peak' : brightWindow.label;
  const cautionLabel = cautionWindow.flat ? 'No pronounced strain — even keel' : cautionWindow.label;
  const kpPredictions = [...(profile.kp?.predictions ?? [])];
  const kpLead =
    kpPredictions.find((prediction) => prediction.area === supportArea || (supportArea === 'wellness' && prediction.area === 'health')) ??
    kpPredictions.sort((a, b) => b.confidence - a.confidence)[0];
  const currentDashaPlanet = getCurrentDashaPlanet(profile);
  const nextShiftPlanet = nextShift ? getSafePlanet((nextShift as { planet?: unknown }).planet) : null;
  const currentMonthElement = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'][date.getMonth()] ?? 'Earth';
  const nextMonthElement = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'][(date.getMonth() + 1) % 12] ?? 'Earth';
  const subPeriod = getCurrentSubPeriod(profile, date);
  const subPeriodPlanet = subPeriod ? getSafePlanet((subPeriod as { planet?: unknown }).planet) : null;

  const focusAreas = window === 'week'
    ? [
        {
          label: 'Western',
          text: drivers[0]
            ? `This week's clearest driver is ${drivers[0]}. Use that opening directly for ${AREA_TONE[supportArea]}.`
            : `Your chart is strongest when you ${AREA_WEEKLY_PROMPTS[supportArea]}.`,
        },
        {
          label: 'Vedic',
          text: nextShift
            ? `${currentDashaPlanet} Mahadasha begins giving way to ${nextShiftPlanet ?? 'the next cycle'} this week — timing is shifting mid-cycle rather than staying flat.`
            : `${currentDashaPlanet} Mahadasha keeps this week focused on ${DASHA_FOCUS[currentDashaPlanet]}${subPeriodPlanet ? `, with ${subPeriodPlanet} sub-period energy sharpening the near-term decisions.` : '.'}`,
        },
        {
          label: 'Chinese',
          text: `${currentMonthElement} seasonal tone meets your ${profile.chinese?.element ?? 'Wood'} nature this week. The cleaner move is to ${AREA_WEEKLY_PROMPTS[supportArea]}.`,
        },
        {
          label: 'KP',
          text: kpLead
            ? `KP highlights ${kpLead.area === 'health' ? 'wellness' : kpLead.area} this week — act inside the 1–2 day open window rather than the pressured one.`
            : `KP timing this week says the best outcomes come from fewer, exact decisions rather than reactive pivots.`,
        },
      ]
    : [
        {
          label: 'Western',
          text: drivers.length >= 2
            ? `${drivers[0]} and ${drivers[1]} trade influence across the month. The sustained western opening points toward ${AREA_TONE[supportArea]} — pace yourself for steady effort rather than a single concentrated push.`
            : drivers[0]
            ? `${drivers[0]} is the dominant western current for the month. It favors ${AREA_TONE[supportArea]} most in the first and final weeks.`
            : `The month-long western pattern favors ${AREA_TONE[supportArea]}. Distribute effort evenly rather than front-loading or leaving it for the end.`,
        },
        {
          label: 'Vedic',
          text: nextShift
            ? `The ${currentDashaPlanet}-to-${nextShiftPlanet ?? 'next cycle'} Mahadasha transition lands inside this month. The first half and second half carry meaningfully different tones — decisions made before the shift carry different weight than those made after.`
            : nextSubShiftPlanet
            ? `${currentDashaPlanet} Mahadasha runs the full 30 days, but your ${subPeriodPlanet ?? 'current'} sub-period hands off to ${nextSubShiftPlanet} inside this window — expect the tone to tilt mid-month even though the larger chapter stays the same.`
            : `${currentDashaPlanet} Mahadasha runs the full 30 days. Invest consistently in ${DASHA_FOCUS[currentDashaPlanet]}; the compound effect of steady attention outperforms short bursts${subPeriodPlanet ? `. The ${subPeriodPlanet} sub-period adds a sharper lens mid-month.` : '.'}`,
        },
        {
          label: 'Chinese',
          text: currentMonthElement !== nextMonthElement
            ? `The month opens under ${currentMonthElement} seasonal energy and transitions toward ${nextMonthElement} in the final stretch. Your ${profile.chinese?.element ?? 'Wood'} nature interacts differently with each — use the ${currentMonthElement} phase to push, and the ${nextMonthElement} phase to consolidate.`
            : `${currentMonthElement} seasonal energy holds steadily across the full month. Your ${profile.chinese?.element ?? 'Wood'} nature has a clean window to build without seasonal interference — commit to the structural move, not the reactive one.`,
        },
        {
          label: 'KP',
          text: kpLead
            ? `KP keeps ${kpLead.area === 'health' ? 'wellness' : kpLead.area} as a recurring signal across the month. Spread major decisions across the open phases rather than clustering them — the month has at least two distinct high-confidence windows.`
            : `KP timing over 30 days says the cleaner wins come from reading phase shifts early and positioning before pressure builds, not from reacting after the fact.`,
        },
      ];

  return {
    window,
    title: window === 'week' ? 'Next 7 days' : 'Next 30 days',
    headline: getHeadline(profile, drivers, supportArea, nextShift, window),
    summary: getSummary(supportArea, challengeArea, profile, window, phaseAreas),
    focusAreas,
    brightWindow: brightLabel,
    cautionWindow: cautionLabel,
    ritualPrompt: window === 'week' ? AREA_WEEKLY_PROMPTS[supportArea] : AREA_MONTHLY_PROMPTS[supportArea],
    drivers,
    impactScores,
    references: [
      { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
      { source: 'Planets in Transit', type: 'book', tradition: 'western' },
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
      { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
    ],
  };
}
