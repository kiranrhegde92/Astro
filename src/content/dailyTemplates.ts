import type { ChineseAnimal, CosmicProfile, DailyReading, PredictionReference, Rashi, WesternSign } from '../types/astrology';
import { getDateKey } from '../utils/dateUtils';
import { getDailyAffirmation, getDailyOpener } from './positiveFraming';
import { generateSignalDailyReading } from './predictionSignals';

const LEGACY_REFERENCES: PredictionReference[] = [
  { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
  { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
  { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
  { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
];

function generateLegacyReading(
  date: Date,
  sunSign: WesternSign,
  rashi: Rashi,
  animal: ChineseAnimal,
): DailyReading {
  const opener = getDailyOpener(date);
  const affirmation = getDailyAffirmation(date);

  return {
    date: getDateKey(date),
    western: {
      overall: `${sunSign} energy responds best to a cleaner pace and a smaller number of meaningful commitments today.`,
      love: `Let warmth show up through steadiness, not performance. ${sunSign} charm lands better when it is relaxed.`,
      career: `Push the work that already matters instead of starting five new things at once.`,
      wellness: `Give your body rhythm before the world asks for output.`,
      luckyNumber: ((date.getDate() + date.getMonth()) % 9) + 1,
    },
    vedic: {
      dasha: `Your current planetary period amplifies your ${rashi} tone today. Timing matters more than speed.`,
      nakshatra: `Lunar emphasis favors patience, reflection, and one well-timed move over scattered effort.`,
      remedy: {
        type: 'ritual',
        name: 'Quiet reset',
        description: 'Take a few calm minutes before your first major decision so the day starts from center.',
        source: 'Brihat Parashara Hora Shastra',
      },
      mantra: 'Om Namah Shivaya',
    },
    kp: {
      eventTiming: 'KP timing favors exact decisions once the atmosphere feels quieter.',
      significatorInsight: 'Your active houses respond better to precision than urgency today.',
      sublordGuidance: 'Let the first clean opening matter more than the loudest one.',
    },
    chinese: {
      element: `Your ${animal} nature benefits from steadier rhythm than reactivity today.`,
      animal: `The ${animal} in you does best when you protect attention and move deliberately.`,
      luckyDirection: 'East',
    },
    unified: {
      cosmicVibe: opener,
      affirmation,
      shareText: `${opener} | ${sunSign} + ${rashi} + ${animal} | CosmicSelf`,
    },
    references: LEGACY_REFERENCES,
    positivityScore: 0.74,
  };
}

export function generateDailyReading(
  date: Date,
  profile: Partial<CosmicProfile>,
): DailyReading;
export function generateDailyReading(
  date: Date,
  sunSign: WesternSign,
  rashi: Rashi,
  animal: ChineseAnimal,
): DailyReading;
export function generateDailyReading(
  date: Date,
  profileOrSunSign: Partial<CosmicProfile> | WesternSign,
  rashi?: Rashi,
  animal?: ChineseAnimal,
): DailyReading {
  if (typeof profileOrSunSign === 'string') {
    return generateLegacyReading(date, profileOrSunSign, rashi ?? 'Simha', animal ?? 'Dragon');
  }

  if (profileOrSunSign?.western && profileOrSunSign.vedic && profileOrSunSign.chinese) {
    return generateSignalDailyReading(date, profileOrSunSign);
  }

  return generateLegacyReading(
    date,
    profileOrSunSign?.western?.sun ?? 'Leo',
    profileOrSunSign?.vedic?.rashi ?? 'Simha',
    profileOrSunSign?.chinese?.animal ?? 'Dragon',
  );
}

