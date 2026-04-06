import { ChineseAnimal, ChineseElement, FourPillars } from '../../types/astrology';

/**
 * 10 Heavenly Stems (Tiangan)
 * Each stem is associated with an element and a Yin/Yang polarity.
 */
const HEAVENLY_STEMS = [
  'Jia',  // Wood Yang
  'Yi',   // Wood Yin
  'Bing', // Fire Yang
  'Ding', // Fire Yin
  'Wu',   // Earth Yang
  'Ji',   // Earth Yin
  'Geng', // Metal Yang
  'Xin',  // Metal Yin
  'Ren',  // Water Yang
  'Gui',  // Water Yin
] as const;

/**
 * 12 Earthly Branches (Dizhi) mapped to animals.
 */
const EARTHLY_BRANCHES: ChineseAnimal[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

/** Map each Heavenly Stem to its element */
const STEM_ELEMENTS: Record<string, ChineseElement> = {
  Jia: 'Wood', Yi: 'Wood',
  Bing: 'Fire', Ding: 'Fire',
  Wu: 'Earth', Ji: 'Earth',
  Geng: 'Metal', Xin: 'Metal',
  Ren: 'Water', Gui: 'Water',
};

/**
 * Map each Earthly Branch (animal) to its fixed element.
 * This is the traditional "fixed element" of each branch.
 */
const BRANCH_ELEMENTS: Record<ChineseAnimal, ChineseElement> = {
  Rat: 'Water',
  Ox: 'Earth',
  Tiger: 'Wood',
  Rabbit: 'Wood',
  Dragon: 'Earth',
  Snake: 'Fire',
  Horse: 'Fire',
  Goat: 'Earth',
  Monkey: 'Metal',
  Rooster: 'Metal',
  Dog: 'Earth',
  Pig: 'Water',
};

/**
 * Get the Heavenly Stem index for a given year.
 * The sexagenary cycle: stems repeat every 10 years.
 * Reference: 1984 (Jia Zi year) => stem index 0.
 */
function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/**
 * Get the Earthly Branch index for a given year.
 * Reference: 1984 (Jia Zi year) => branch index 0.
 */
function getYearBranchIndex(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

/**
 * Calculate month pillar stem index.
 * The month stem depends on the year stem according to the "Five Tiger Escape" rule.
 * Month 1 (Tiger month) starts the cycle.
 * Formula: monthStemIndex = (yearStemIndex % 5) * 2 + (monthNumber - 1)
 * where monthNumber is 1–12 (Chinese lunar months approximated by solar months).
 */
function getMonthStemIndex(yearStemIndex: number, month: number): number {
  // The stem of month 1 (Tiger month, ~February) is determined by the year stem.
  // Year stems 0,5 (Jia,Ji) → month 1 stem = Bing (2)
  // Year stems 1,6 (Yi,Geng) → month 1 stem = Wu (4)
  // Year stems 2,7 (Bing,Xin) → month 1 stem = Geng (6)
  // Year stems 3,8 (Ding,Ren) → month 1 stem = Ren (8)
  // Year stems 4,9 (Wu,Gui) → month 1 stem = Jia (0)
  const baseStems = [2, 4, 6, 8, 0];
  const baseStem = baseStems[yearStemIndex % 5];
  return (baseStem + (month - 1)) % 10;
}

/**
 * Get the month branch index.
 * Month 1 (Chinese month ~ February) = Tiger (index 2).
 */
function getMonthBranchIndex(month: number): number {
  // Month 1 => Tiger (index 2), Month 2 => Rabbit (3), etc.
  return (month + 1) % 12;
}

/**
 * Calculate the day pillar using a simplified formula.
 * This is an approximation based on the number of days since a known reference date.
 * Reference: January 1, 1900 was a Jia-Zi (stem 0, branch 0) day — adjusted to Jan 31, 1900.
 */
function getDayPillarIndices(date: Date): { stemIndex: number; branchIndex: number } {
  // Reference: January 31, 1900 = Jia-Zi day (sexagenary day 1)
  const refDate = new Date(1900, 0, 31); // Jan 31, 1900
  const diffMs = date.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const stemIndex = ((diffDays % 10) + 10) % 10;
  const branchIndex = ((diffDays % 12) + 12) % 12;

  return { stemIndex, branchIndex };
}

/**
 * Calculate the hour pillar.
 * Chinese hours (Shi Chen) are 2-hour blocks starting at 23:00 (Zi/Rat hour).
 * The hour stem depends on the day stem using the "Five Rat Escape" rule.
 */
function getHourBranchIndex(hour: number): number {
  // Hour 23-0: Rat (0), 1-2: Ox (1), 3-4: Tiger (2), etc.
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

function getHourStemIndex(dayStemIndex: number, hourBranchIndex: number): number {
  // The stem of the Zi (Rat) hour depends on the day stem:
  // Day stems 0,5 (Jia,Ji) → Zi hour stem = Jia (0)
  // Day stems 1,6 (Yi,Geng) → Zi hour stem = Bing (2)
  // Day stems 2,7 (Bing,Xin) → Zi hour stem = Wu (4)
  // Day stems 3,8 (Ding,Ren) → Zi hour stem = Geng (6)
  // Day stems 4,9 (Wu,Gui) → Zi hour stem = Ren (8)
  const baseStems = [0, 2, 4, 6, 8];
  const baseStem = baseStems[dayStemIndex % 5];
  return (baseStem + hourBranchIndex) % 10;
}

/**
 * Parse a time string like "14:30" or "2:30 PM" into a 24-hour value.
 */
function parseHour(timeStr: string): number {
  const normalized = timeStr.trim().toUpperCase();
  const pmMatch = normalized.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/);
  if (pmMatch) {
    let h = parseInt(pmMatch[1], 10);
    const period = pmMatch[3];
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h;
  }
  const match24 = normalized.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    return parseInt(match24[1], 10);
  }
  return 12; // default to noon if unparseable
}

/**
 * Calculate the Four Pillars (Ba Zi) of Chinese astrology.
 *
 * Each pillar consists of a Heavenly Stem and an Earthly Branch,
 * representing year, month, day, and hour of birth.
 *
 * @param birthDate - The date of birth
 * @param birthTime - Optional time string (e.g. "14:30" or "2:30 PM")
 */
export function calculateFourPillars(birthDate: Date, birthTime?: string): FourPillars {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 1-12
  const hour = birthTime ? parseHour(birthTime) : 12;

  // --- Year Pillar ---
  const yearStemIdx = getYearStemIndex(year);
  const yearBranchIdx = getYearBranchIndex(year);

  // --- Month Pillar ---
  const monthStemIdx = getMonthStemIndex(yearStemIdx, month);
  const monthBranchIdx = getMonthBranchIndex(month);

  // --- Day Pillar ---
  const { stemIndex: dayStemIdx, branchIndex: dayBranchIdx } = getDayPillarIndices(birthDate);

  // --- Hour Pillar ---
  const hourBranchIdx = getHourBranchIndex(hour);
  const hourStemIdx = getHourStemIndex(dayStemIdx, hourBranchIdx);

  return {
    year: {
      stem: HEAVENLY_STEMS[yearStemIdx],
      branch: EARTHLY_BRANCHES[yearBranchIdx],
      element: STEM_ELEMENTS[HEAVENLY_STEMS[yearStemIdx]],
    },
    month: {
      stem: HEAVENLY_STEMS[monthStemIdx],
      branch: EARTHLY_BRANCHES[monthBranchIdx],
      element: STEM_ELEMENTS[HEAVENLY_STEMS[monthStemIdx]],
    },
    day: {
      stem: HEAVENLY_STEMS[dayStemIdx],
      branch: EARTHLY_BRANCHES[dayBranchIdx],
      element: STEM_ELEMENTS[HEAVENLY_STEMS[dayStemIdx]],
    },
    hour: {
      stem: HEAVENLY_STEMS[hourStemIdx],
      branch: EARTHLY_BRANCHES[hourBranchIdx],
      element: STEM_ELEMENTS[HEAVENLY_STEMS[hourStemIdx]],
    },
  };
}
