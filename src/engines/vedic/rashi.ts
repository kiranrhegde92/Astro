import { Rashi, WesternSign, WesternElement } from '../../types/astrology';

/**
 * Compute the Lahiri (Chitrapaksha) ayanamsa for a given date.
 * The ayanamsa grows by ~50.3 arcseconds (≈0.01397°) per year.
 * Reference value at J2000.0: 23.85319°.
 */
function getLahiriAyanamsa(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const yearsSinceJ2000 = (date.getTime() - J2000_MS) / (365.25 * 86_400_000);
  return 23.85319 + 0.013970 * yearsSinceJ2000;
}

export interface RashiInfo {
  name: Rashi;
  westernEquivalent: WesternSign;
  rulingPlanet: string;
  element: WesternElement;
  quality: 'Movable' | 'Fixed' | 'Dual';
  description: string;
}

/**
 * The 12 Rashis (sidereal signs) of Vedic astrology, each spanning 30 degrees.
 */
export const RASHI_DATA: RashiInfo[] = [
  {
    name: 'Mesha',
    westernEquivalent: 'Aries',
    rulingPlanet: 'Mars',
    element: 'Fire',
    quality: 'Movable',
    description:
      'Natural leaders blessed with courage, initiative, and a pioneering spirit. Mesha natives radiate confidence and inspire action in those around them.',
  },
  {
    name: 'Vrishabha',
    westernEquivalent: 'Taurus',
    rulingPlanet: 'Venus',
    element: 'Earth',
    quality: 'Fixed',
    description:
      'Gifted with patience, artistic sensibility, and steadfast determination. Vrishabha natives bring stability and beauty to everything they touch.',
  },
  {
    name: 'Mithuna',
    westernEquivalent: 'Gemini',
    rulingPlanet: 'Mercury',
    element: 'Air',
    quality: 'Dual',
    description:
      'Blessed with intellectual curiosity, eloquent communication, and versatile talents. Mithuna natives are natural connectors who thrive on learning and sharing knowledge.',
  },
  {
    name: 'Karka',
    westernEquivalent: 'Cancer',
    rulingPlanet: 'Moon',
    element: 'Water',
    quality: 'Movable',
    description:
      'Deeply intuitive and nurturing souls with a powerful emotional intelligence. Karka natives create safe spaces and foster genuine bonds wherever they go.',
  },
  {
    name: 'Simha',
    westernEquivalent: 'Leo',
    rulingPlanet: 'Sun',
    element: 'Fire',
    quality: 'Fixed',
    description:
      'Radiant, generous, and naturally charismatic. Simha natives shine with creative vitality and inspire loyalty and admiration through their warm-hearted leadership.',
  },
  {
    name: 'Kanya',
    westernEquivalent: 'Virgo',
    rulingPlanet: 'Mercury',
    element: 'Earth',
    quality: 'Dual',
    description:
      'Gifted with analytical brilliance, a service-oriented heart, and meticulous attention to detail. Kanya natives elevate everything through their pursuit of excellence.',
  },
  {
    name: 'Tula',
    westernEquivalent: 'Libra',
    rulingPlanet: 'Venus',
    element: 'Air',
    quality: 'Movable',
    description:
      'Natural diplomats blessed with grace, fairness, and an innate sense of harmony. Tula natives bring balance and beauty to relationships and communities.',
  },
  {
    name: 'Vrischika',
    westernEquivalent: 'Scorpio',
    rulingPlanet: 'Mars',
    element: 'Water',
    quality: 'Fixed',
    description:
      'Intensely perceptive and transformative individuals with remarkable inner strength. Vrischika natives possess the power of deep insight and profound regeneration.',
  },
  {
    name: 'Dhanu',
    westernEquivalent: 'Sagittarius',
    rulingPlanet: 'Jupiter',
    element: 'Fire',
    quality: 'Dual',
    description:
      'Blessed with wisdom, optimism, and an expansive vision of life. Dhanu natives are seekers of truth who inspire others with their philosophical depth and adventurous spirit.',
  },
  {
    name: 'Makara',
    westernEquivalent: 'Capricorn',
    rulingPlanet: 'Saturn',
    element: 'Earth',
    quality: 'Movable',
    description:
      'Endowed with discipline, ambition, and enduring perseverance. Makara natives build lasting legacies through their structured approach and unwavering commitment.',
  },
  {
    name: 'Kumbha',
    westernEquivalent: 'Aquarius',
    rulingPlanet: 'Saturn',
    element: 'Air',
    quality: 'Fixed',
    description:
      'Visionary thinkers with humanitarian ideals and inventive minds. Kumbha natives champion progress and inspire collective well-being through their unique perspective.',
  },
  {
    name: 'Meena',
    westernEquivalent: 'Pisces',
    rulingPlanet: 'Jupiter',
    element: 'Water',
    quality: 'Dual',
    description:
      'Deeply compassionate and spiritually attuned beings with rich imaginations. Meena natives possess the gift of empathy and channel universal love into creative expression.',
  },
];

/**
 * Map a Rashi to its Western zodiac equivalent.
 */
export function rashiToWesternSign(rashi: Rashi): WesternSign {
  const info = RASHI_DATA.find((r) => r.name === rashi);
  if (!info) {
    throw new Error(`Unknown Rashi: ${rashi}`);
  }
  return info.westernEquivalent;
}

/**
 * Approximate the Moon's ecliptic longitude for a given date.
 *
 * This uses a simplified lunar position calculation based on mean orbital elements.
 * The Moon completes one full orbit (~360 degrees) in approximately 27.321661 days.
 * Reference epoch: J2000.0 (January 1, 2000, 12:00 TT).
 */
function approximateMoonLongitude(date: Date): number {
  // J2000.0 epoch
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);

  // Mean longitude of the Moon at J2000.0: 218.3165 degrees
  // Mean daily motion: 13.176358 degrees/day
  const meanLongitude = 218.3165 + 13.176358 * daysSinceJ2000;

  // Mean anomaly of the Moon
  const meanAnomaly = (134.963 + 13.064993 * daysSinceJ2000) * (Math.PI / 180);

  // Mean elongation of the Moon
  const meanElongation = (297.8502 + 12.190749 * daysSinceJ2000) * (Math.PI / 180);

  // Argument of latitude
  const argLatitude = (93.272 + 13.229350 * daysSinceJ2000) * (Math.PI / 180);

  // Mean anomaly of the Sun
  const sunMeanAnomaly = (357.5291 + 0.985600 * daysSinceJ2000) * (Math.PI / 180);

  // Principal perturbation terms (in degrees)
  const correction =
    6.289 * Math.sin(meanAnomaly) -
    1.274 * Math.sin(2 * meanElongation - meanAnomaly) +
    0.658 * Math.sin(2 * meanElongation) +
    0.214 * Math.sin(2 * meanAnomaly) -
    0.186 * Math.sin(sunMeanAnomaly) -
    0.114 * Math.sin(2 * argLatitude);

  let longitude = (meanLongitude + correction) % 360;
  if (longitude < 0) longitude += 360;

  return longitude;
}

/**
 * Convert a tropical ecliptic longitude to sidereal using the dynamic Lahiri ayanamsa.
 */
function tropicalToSidereal(tropicalDegree: number, date: Date): number {
  let sidereal = tropicalDegree - getLahiriAyanamsa(date);
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

/**
 * Build a Date that incorporates an optional "HH:MM" birth-time string.
 * If birthTime is omitted the original date is returned unchanged.
 */
export function withBirthTime(date: Date, birthTime?: string): Date {
  if (!birthTime) return date;
  const [h, m] = birthTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return date;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Calculate the Vedic Moon sign (Rashi) for a given birth date using the sidereal zodiac.
 */
export function getRashi(date: Date, birthTime?: string): Rashi {
  date = withBirthTime(date, birthTime);
  const tropicalLongitude = approximateMoonLongitude(date);
  const siderealLongitude = tropicalToSidereal(tropicalLongitude, date);

  // Each Rashi spans 30 degrees
  const rashiIndex = Math.floor(siderealLongitude / 30) % 12;
  return RASHI_DATA[rashiIndex].name;
}
