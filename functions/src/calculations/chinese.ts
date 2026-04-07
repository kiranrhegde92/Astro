// Chinese Astrology — Four Pillars (Ba Zi)
// Based on solar calendar, Stems & Branches

export interface ChineseChart {
  animal: string;
  element: string;
  yinYang: string;
  // Four Pillars
  yearPillar: { stem: string; branch: string; animal: string; element: string };
  monthPillar: { stem: string; branch: string; animal: string; element: string };
  dayPillar: { stem: string; branch: string; animal: string; element: string };
  hourPillar: { stem: string; branch: string; animal: string; element: string };
  luckyElements: string[];
  luckyDirections: string[];
  luckyColors: string[];
  luckyNumbers: number[];
}

const HEAVENLY_STEMS = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'];
const EARTHLY_BRANCHES = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];
const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const STEM_ELEMENTS = ['Wood','Wood','Fire','Fire','Earth','Earth','Metal','Metal','Water','Water'];
const BRANCH_ELEMENTS = ['Water','Earth','Wood','Wood','Earth','Fire','Fire','Earth','Metal','Metal','Earth','Water'];
const YIN_YANG = ['Yang','Yin','Yang','Yin','Yang','Yin','Yang','Yin','Yang','Yin'];

const DIRECTION_MAP: Record<string, string> = {
  Wood: 'East', Fire: 'South', Earth: 'Center', Metal: 'West', Water: 'North',
};

const COLOR_MAP: Record<string, string[]> = {
  Wood: ['Green','Teal'], Fire: ['Red','Purple'], Earth: ['Yellow','Brown'],
  Metal: ['White','Gold'], Water: ['Black','Blue'],
};

const LUCKY_NUMBERS: Record<string, number[]> = {
  Wood: [3,4,8], Fire: [2,7,9], Earth: [2,5,8],
  Metal: [4,6,7], Water: [1,6,9],
};

/**
 * Calculate year pillar from birth year using traditional Chinese calendar epoch.
 * Year 4 CE is Jia-Zi year (stem 0, branch 0).
 */
function getYearPillar(year: number) {
  const offset = year - 4;
  const stemIdx = ((offset % 10) + 10) % 10;
  const branchIdx = ((offset % 12) + 12) % 12;
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    animal: ANIMALS[branchIdx],
    element: STEM_ELEMENTS[stemIdx],
  };
}

/**
 * Month pillar — uses solar months (jiéqì).
 * Month number: 1=Tiger (Feb), 2=Rabbit (Mar) … 12=Ox (Jan)
 */
function getMonthPillar(year: number, month: number, day: number) {
  // Simplified: solar month index (Feb=Tiger=branch 2)
  const solarMonths = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Jan→Chou, Feb→Yin…
  const branchIdx = solarMonths[month - 1];

  // Month stem depends on year stem group
  const yearStemIdx = ((year - 4) % 10 + 10) % 10;
  const stemGroupStart = [0, 2, 4, 6, 8][Math.floor(yearStemIdx / 2)];
  const monthOffset = branchIdx >= 2 ? branchIdx - 2 : branchIdx + 10;
  const stemIdx = (stemGroupStart + monthOffset) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    animal: ANIMALS[branchIdx],
    element: STEM_ELEMENTS[stemIdx],
  };
}

/**
 * Day pillar — Julian Day based calculation.
 * JD 0 (Jan 1, 4713 BC) ≈ stem 4, branch 0 in Chinese calendar.
 */
function getDayPillar(date: Date) {
  const jd = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000
  ) + 2440588; // Unix epoch to JD offset

  const stemIdx = ((jd + 4) % 10 + 10) % 10;
  const branchIdx = ((jd + 0) % 12 + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    animal: ANIMALS[branchIdx],
    element: STEM_ELEMENTS[stemIdx],
  };
}

/**
 * Hour pillar — 12 two-hour blocks (Zi=23–01, Chou=01–03 …)
 */
function getHourPillar(dayStemIdx: number, hour: number) {
  const branchIdx = Math.floor(((hour + 1) % 24) / 2);
  // Hour stem starts from group based on day stem
  const stemGroupStart = [0, 2, 4, 6, 8][Math.floor(dayStemIdx / 2)];
  const stemIdx = (stemGroupStart + branchIdx) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    animal: ANIMALS[branchIdx],
    element: STEM_ELEMENTS[stemIdx],
  };
}

export function calculateChineseChart(birthDate: Date): ChineseChart {
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();
  const hour = birthDate.getUTCHours();

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month, day);
  const dayPillar = getDayPillar(birthDate);

  const dayStemIdx = HEAVENLY_STEMS.indexOf(dayPillar.stem);
  const hourPillar = getHourPillar(dayStemIdx, hour);

  // Day master element determines lucky/unlucky elements
  const dayMasterElement = dayPillar.element;
  const yearStemIdx = HEAVENLY_STEMS.indexOf(yearPillar.stem);

  // Lucky elements: elements that support the day master
  const CYCLE = ['Wood','Fire','Earth','Metal','Water'];
  const masterIdx = CYCLE.indexOf(dayMasterElement);
  const luckyElements = [
    CYCLE[(masterIdx + 4) % 5], // element that produces day master
    dayMasterElement,            // same element
  ];

  return {
    animal: yearPillar.animal,
    element: yearPillar.element,
    yinYang: YIN_YANG[yearStemIdx],
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    luckyElements,
    luckyDirections: luckyElements.map(e => DIRECTION_MAP[e]),
    luckyColors: luckyElements.flatMap(e => COLOR_MAP[e] ?? []),
    luckyNumbers: luckyElements.flatMap(e => LUCKY_NUMBERS[e] ?? []),
  };
}
