import type { CosmicProfile, PredictionReference } from '../types/astrology';

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
  references: PredictionReference[];
}

const WESTERN_FOCUS: Record<CosmicProfile['western']['element'], string> = {
  Fire: 'initiating a move you have already been circling',
  Earth: 'building steadier routines and cleaner boundaries',
  Air: 'talking openly and refining your point of view',
  Water: 'trusting feeling before over-explaining it',
};

const DASHA_FOCUS: Record<CosmicProfile['vedic']['currentDasha']['planet'], string> = {
  Ketu: 'letting go of stale attachments so the next chapter can breathe',
  Venus: 'softening the pace and choosing what feels nourishing',
  Sun: 'stepping into visibility without diluting your standards',
  Moon: 'responding to emotional truth before it hardens into stress',
  Mars: 'moving decisively while staying careful with tone',
  Rahu: 'working with ambition without letting it run the whole room',
  Jupiter: 'learning, teaching, and widening the horizon of the month',
  Saturn: 'committing to patient effort instead of chasing immediate proof',
  Mercury: 'writing, planning, and making small decisions earlier',
};

const CHINESE_FOCUS: Record<CosmicProfile['chinese']['element'], string> = {
  Wood: 'growth that compounds through repetition instead of urgency',
  Fire: 'energy that becomes magnetic when it has a clear outlet',
  Earth: 'stability that comes from tending the basics first',
  Metal: 'clarity that appears once the unnecessary gets cut away',
  Water: 'flow that works best when the plan stays adaptable',
};

const MONTH_TONES = [
  'This period rewards fewer, cleaner commitments.',
  'The next stretch is strongest when you protect your pace.',
  'Momentum builds once you stop splitting your attention.',
  'The month improves when instinct and structure are allowed to work together.',
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatRange(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

function getSeed(date: Date, profile: CosmicProfile) {
  return (
    date.getFullYear() +
    date.getMonth() * 13 +
    date.getDate() * 7 +
    profile.western.sun.length +
    profile.vedic.rashi.length +
    profile.chinese.animal.length
  );
}

export function generatePeriodForecast(
  date: Date,
  profile: CosmicProfile,
  window: ForecastWindow
): PeriodForecast {
  const seed = getSeed(date, profile);
  const brightOffset = window === 'week' ? (seed % 3) + 1 : (seed % 9) + 4;
  const cautionOffset = brightOffset + (window === 'week' ? 3 : 9);
  const brightWindow = formatRange(addDays(date, brightOffset), addDays(date, brightOffset + (window === 'week' ? 2 : 5)));
  const cautionWindow = formatRange(addDays(date, cautionOffset), addDays(date, cautionOffset + (window === 'week' ? 1 : 4)));

  const westernFocus = WESTERN_FOCUS[profile.western.element];
  const vedicFocus = DASHA_FOCUS[profile.vedic.currentDasha.planet];
  const chineseFocus = CHINESE_FOCUS[profile.chinese.element];
  const monthTone = MONTH_TONES[seed % MONTH_TONES.length];
  const kpSignal =
    profile.kp?.predictions[seed % profile.kp.predictions.length]?.area ?? 'timing';

  const title = window === 'week' ? 'Next 7 days' : 'Next 30 days';
  const headline =
    window === 'week'
      ? `${profile.western.sun} drive meets ${profile.vedic.currentDasha.planet} timing this week.`
      : `${profile.chinese.element} ${profile.chinese.animal} rhythm shapes the month ahead.`;
  const summary =
    window === 'week'
      ? `Your ${profile.vedic.rashi} Rashi and ${profile.chinese.animal} temperament point to a shorter cycle built around recovery, focus, and better timing.`
      : `${monthTone} Your chart wants steadier choices, clearer priorities, and practical momentum instead of scattered effort.`;

  const focusAreas = [
    {
      label: 'Western',
      text:
        window === 'week'
          ? `Use your ${profile.western.element.toLowerCase()} element for ${westernFocus}.`
          : `Your ${profile.western.modality.toLowerCase()} style does best when the month has one anchor priority.`,
    },
    {
      label: 'Vedic',
      text:
        window === 'week'
          ? `${profile.vedic.currentDasha.planet} Mahadasha favors ${vedicFocus}.`
          : `The ${profile.vedic.currentDasha.planet} period keeps asking for patience before payoff.`,
    },
    {
      label: 'Chinese',
      text:
        window === 'week'
          ? `${profile.chinese.element} energy supports ${chineseFocus}.`
          : `The ${profile.chinese.animal} in you benefits from rhythm, routine, and fewer reactive pivots.`,
    },
    {
      label: 'KP',
      text:
        window === 'week'
          ? `Practical timing is sharpest around ${kpSignal} decisions.`
          : `KP timing says the month improves when you decide what can wait and what needs exact action now.`,
    },
  ];

  const ritualPrompt =
    window === 'week'
      ? 'Choose one thing to repeat every morning before you chase anything new.'
      : 'Name the one chapter you want this month to be remembered for, then protect time for it.';

  return {
    window,
    title,
    headline,
    summary,
    focusAreas,
    brightWindow,
    cautionWindow,
    ritualPrompt,
    references: [
      { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
      { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
    ],
  };
}
