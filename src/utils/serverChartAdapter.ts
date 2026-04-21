import type {
  ChineseProfile,
  DashaPeriod,
  KPProfile,
  PlanetPosition,
  WesternProfile,
  VedicProfile,
} from '../types/astrology';

const PLANET_NAME_MAP: Record<string, PlanetPosition['planet']> = {
  SUN: 'Sun',
  MOON: 'Moon',
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn',
  URANUS: 'Uranus',
  NEPTUNE: 'Neptune',
  PLUTO: 'Pluto',
  NORTHNODE: 'NorthNode',
  SOUTHNODE: 'SouthNode',
};

function toDate(value?: string) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function mapWesternProfile(western?: any): WesternProfile | undefined {
  if (!western) return undefined;

  const planets: PlanetPosition[] = Object.entries(western.planets ?? {})
    .map(([planet, value]: [string, any]) => {
      const mapped = PLANET_NAME_MAP[planet];
      if (!mapped) return null;
      return {
        planet: mapped,
        sign: value.sign,
        degree: Number(value.degree ?? 0),
        house: typeof value.house === 'number' ? value.house : undefined,
        retrograde: Boolean(value.retrograde),
      } satisfies PlanetPosition;
    })
    .filter(Boolean) as PlanetPosition[];

  return {
    sun: western.sun,
    moon: western.moon,
    rising: western.rising,
    element: western.dominantElement,
    modality: western.dominantModality,
    planets,
    houses: Array.isArray(western.houses) ? western.houses : undefined,
  };
}

function mapVedicProfile(vedic?: any): VedicProfile | undefined {
  if (!vedic) return undefined;

  const subPeriod: DashaPeriod | undefined = vedic.subDasha
    ? {
        planet: vedic.subDasha.planet,
        startDate: toDate(vedic.subDasha.startDate),
        endDate: toDate(vedic.subDasha.endDate),
      }
    : undefined;

  const currentDasha: DashaPeriod = {
    planet: vedic.currentDasha?.planet ?? 'Sun',
    startDate: toDate(vedic.currentDasha?.startDate),
    endDate: toDate(vedic.currentDasha?.endDate),
    subPeriods: subPeriod ? [subPeriod] : undefined,
  };

  return {
    rashi: vedic.rashi,
    nakshatra: vedic.nakshatra,
    nakshatraPada: Number(vedic.nakshatraPada ?? 1),
    moonSign: vedic.rashi,
    dashas: [currentDasha],
    currentDasha,
    remedies: Array.isArray(vedic.remedies) ? vedic.remedies : [],
  };
}

function mapChineseProfile(chinese?: any): ChineseProfile | undefined {
  if (!chinese) return undefined;

  return {
    animal: chinese.animal,
    element: chinese.element,
    yinYang: chinese.yinYang,
    pillars: chinese.yearPillar
      ? {
          year: { stem: chinese.yearPillar.stem, branch: chinese.yearPillar.animal, element: chinese.yearPillar.element },
          month: { stem: chinese.monthPillar.stem, branch: chinese.monthPillar.animal, element: chinese.monthPillar.element },
          day: { stem: chinese.dayPillar.stem, branch: chinese.dayPillar.animal, element: chinese.dayPillar.element },
          hour: { stem: chinese.hourPillar.stem, branch: chinese.hourPillar.animal, element: chinese.hourPillar.element },
        }
      : undefined,
    luckyNumbers: Array.isArray(chinese.luckyNumbers) ? chinese.luckyNumbers : [],
    luckyColors: Array.isArray(chinese.luckyColors) ? chinese.luckyColors : [],
    compatibleAnimals: [],
    incompatibleAnimals: [],
  };
}

function mapKPProfile(kp?: any): KPProfile | undefined {
  if (!kp) return undefined;

  return {
    sublords: Object.values(kp.planets ?? {}).map((planet: any) => ({
      house: Number(planet.house ?? 1),
      starLord: planet.nakshatraLord ?? 'Sun',
      subLord: planet.subLord ?? 'Sun',
      signLord: planet.subSubLord ?? planet.nakshatraLord ?? 'Sun',
    })),
    cusps: Array.isArray(kp.houseCusps)
      ? kp.houseCusps.map((house: any) => ({
          house: house.house,
          degree: 0,
          sign: house.sign,
          starLord: house.nakshatraLord,
          subLord: house.subLord,
        }))
      : [],
    significators: Object.entries(kp.significators ?? {}).map(([house, planets]: [string, any]) => ({
      planet: (Array.isArray(planets) && planets[0]) || 'Sun',
      houses: [Number(house)],
      strength: 'moderate' as const,
    })),
    predictions: [],
  };
}

export function buildProfilesFromServerChart(chart?: any): {
  western?: WesternProfile;
  vedic?: VedicProfile;
  chinese?: ChineseProfile;
  kp?: KPProfile;
} {
  if (!chart) return {};

  return {
    western: mapWesternProfile(chart.western),
    vedic: mapVedicProfile(chart.vedic),
    chinese: mapChineseProfile(chart.chinese),
    kp: mapKPProfile(chart.kp),
  };
}
