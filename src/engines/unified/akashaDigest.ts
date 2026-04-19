import type { ChartResult } from '../../services/functionsService';
import type { AkashaDigest } from '../../../functions/src/akasha/types';
import type { VedicChart } from '../../../functions/src/calculations/vedic';
import type { WesternChart } from '../../../functions/src/calculations/western';
import type { KPChart } from '../../../functions/src/calculations/kp';
import type { ChineseChart } from '../../../functions/src/calculations/chinese';

export type { AkashaDigest } from '../../../functions/src/akasha/types';

export type AkashaChartInput = ChartResult['chart'];

const VEDIC_SIGN_LORDS: Record<string, string> = {
  Mesha: 'Mars',
  Vrishabha: 'Venus',
  Mithuna: 'Mercury',
  Karka: 'Moon',
  Simha: 'Sun',
  Kanya: 'Mercury',
  Tula: 'Venus',
  Vrischika: 'Mars',
  Dhanu: 'Jupiter',
  Makara: 'Saturn',
  Kumbha: 'Saturn',
  Meena: 'Jupiter',
};

const VEDIC_SIGN_ORDER = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const KP_DIGEST_HOUSES = [1, 2, 5, 7, 10, 11];

const CHINESE_HEAVENLY_STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const CHINESE_EARTHLY_BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const CHINESE_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const CHINESE_STEM_ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];

const ELEMENT_RELATIONS: Record<string, Record<string, string>> = {
  Wood: { Wood: 'same', Fire: 'generates', Earth: 'controls', Metal: 'controlled-by', Water: 'generated-by' },
  Fire: { Fire: 'same', Earth: 'generates', Metal: 'controls', Water: 'controlled-by', Wood: 'generated-by' },
  Earth: { Earth: 'same', Metal: 'generates', Water: 'controls', Wood: 'controlled-by', Fire: 'generated-by' },
  Metal: { Metal: 'same', Water: 'generates', Wood: 'controls', Fire: 'controlled-by', Earth: 'generated-by' },
  Water: { Water: 'same', Wood: 'generates', Fire: 'controls', Earth: 'controlled-by', Metal: 'generated-by' },
};

export function buildAkashaDigest(chart: AkashaChartInput): AkashaDigest {
  return {
    vedic: buildVedicSection(chart.vedic as VedicChart),
    western: buildWesternSection(chart.western as WesternChart),
    kp: buildKpSection(chart.kp as KPChart),
    chinese: buildChineseSection(chart.chinese as ChineseChart),
  };
}

function buildVedicSection(chart: VedicChart): AkashaDigest['vedic'] {
  const lagnaIndex = VEDIC_SIGN_ORDER.indexOf(chart.lagna);
  const seventhSign = lagnaIndex >= 0 ? VEDIC_SIGN_ORDER[(lagnaIndex + 6) % 12] : null;
  const tenthSign = lagnaIndex >= 0 ? VEDIC_SIGN_ORDER[(lagnaIndex + 9) % 12] : null;

  const seventhLord = seventhSign ? VEDIC_SIGN_LORDS[seventhSign] ?? null : null;
  const tenthLord = tenthSign ? VEDIC_SIGN_LORDS[tenthSign] ?? null : null;

  const planetsBySign = (sign: string | null): string[] => {
    if (!sign) return [];
    return Object.entries(chart.planets ?? {})
      .filter(([, data]) => data?.sign === sign)
      .map(([name]) => titleCase(name));
  };

  return {
    ascendant: chart.lagna,
    moonSign: chart.rashi,
    moonNakshatra: chart.nakshatra,
    seventhLord,
    seventhHousePlanets: planetsBySign(seventhSign),
    tenthLord,
    tenthHousePlanets: planetsBySign(tenthSign),
    currentMahaDasha: chart.currentDasha?.planet ?? '',
    currentAntarDasha: chart.subDasha?.planet ?? '',
    dashaEndsOn: chart.subDasha?.endDate ?? '',
  };
}

function buildWesternSection(chart: WesternChart): AkashaDigest['western'] {
  const venusSign = chart.planets?.VENUS?.sign ?? '';
  const marsSign = chart.planets?.MARS?.sign ?? '';
  return {
    sunSign: chart.sun,
    moonSign: chart.moon,
    risingSign: chart.rising ?? null,
    venusSign,
    marsSign,
    majorTransits: [],
  };
}

function buildKpSection(chart: KPChart): AkashaDigest['kp'] {
  const significators: Record<string, string[]> = {};
  const source = chart.significators ?? {};
  for (const house of KP_DIGEST_HOUSES) {
    const planets = source[house] ?? [];
    significators[String(house)] = planets.slice(0, 3).map(titleCase);
  }
  return {
    significators,
    rulingPlanets: [],
  };
}

function buildChineseSection(chart: ChineseChart): AkashaDigest['chinese'] {
  const yp = chart.yearPillar;
  const yearPillar = yp ? `${yp.element} ${yp.animal}` : '';

  const now = getCurrentYearPillar(new Date().getUTCFullYear());
  const relation = chart.element && now.element
    ? (ELEMENT_RELATIONS[chart.element]?.[now.element] ?? 'neutral')
    : 'neutral';

  return {
    animal: chart.animal,
    element: chart.element,
    yearPillar,
    currentYear: {
      animal: now.animal,
      element: now.element,
      relation,
    },
  };
}

function getCurrentYearPillar(year: number) {
  const offset = year - 4;
  const stemIdx = ((offset % 10) + 10) % 10;
  const branchIdx = ((offset % 12) + 12) % 12;
  return {
    stem: CHINESE_HEAVENLY_STEMS[stemIdx],
    branch: CHINESE_EARTHLY_BRANCHES[branchIdx],
    animal: CHINESE_ANIMALS[branchIdx],
    element: CHINESE_STEM_ELEMENTS[stemIdx],
  };
}

function titleCase(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
