import type { WesternProfile, PlanetPosition, Planet, WesternSign } from '../../types/astrology';
import {
  getWesternSunSign,
  getWesternMoonSign,
  getWesternRisingSign,
  getElement,
  getModality,
  getRulingPlanet,
  _approxSunLongitude,
  _longitudeToSignIndex,
  _longitudeToDegreeInSign,
} from './zodiac';

// Re-export everything from zodiac for convenience
export {
  getWesternSunSign,
  getWesternMoonSign,
  getWesternRisingSign,
  getElement,
  getModality,
  getRulingPlanet,
  SIGN_DATE_RANGES,
  SIGN_ELEMENTS,
  SIGN_MODALITIES,
  RULING_PLANETS,
} from './zodiac';

// ---------- Zodiac helpers ----------

const ZODIAC_ORDER: WesternSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ---------- Approximate planetary positions ----------

/**
 * Mean orbital elements for simplified planetary longitude estimation.
 * Each entry: [meanLongitudeAtJ2000 (deg), dailyMotion (deg/day), eccentricity, perihelionJ2000 (deg)]
 */
const ORBITAL_ELEMENTS: Record<string, [number, number, number, number]> = {
  Mercury: [252.251, 4.09233445,  0.205635, 77.456],
  Venus:   [181.980, 1.60213049,  0.006773, 131.564],
  Mars:    [355.433, 0.52402068,  0.093405, 336.060],
  Jupiter: [ 34.351, 0.08308529,  0.048498, 14.331],
  Saturn:  [ 50.077, 0.03344414,  0.054151, 93.057],
  Uranus:  [314.055, 0.01172834,  0.047168, 173.005],
  Neptune: [304.349, 0.00598103,  0.008586, 48.124],
  Pluto:   [238.929, 0.00397557,  0.248808, 224.075],
};

/**
 * Compute approximate heliocentric ecliptic longitude for a planet.
 * Uses mean anomaly + equation of center (first-order) for a rough estimate.
 */
function approxHelioLongitude(planet: string, date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (date.getTime() - J2000_MS) / 86_400_000;

  const [L0, n, e, w] = ORBITAL_ELEMENTS[planet];

  // Mean longitude
  const L = (L0 + n * d) % 360;

  // Mean anomaly
  let M = ((L - w) % 360 + 360) % 360;
  const Mrad = M * (Math.PI / 180);

  // Equation of center (first two terms)
  const C =
    (2 * e - (e ** 3) / 4) * Math.sin(Mrad) +
    (5 / 4) * (e ** 2) * Math.sin(2 * Mrad) +
    (13 / 12) * (e ** 3) * Math.sin(3 * Mrad);

  const Cdeg = C * (180 / Math.PI);
  let longitude = ((L + Cdeg) % 360 + 360) % 360;
  return longitude;
}

/**
 * Very rough geocentric correction: for inner planets (Mercury, Venus) we
 * just use the heliocentric longitude as-is (this is a known simplification).
 * For outer planets, heliocentric ≈ geocentric to within a few degrees for
 * most practical purposes when we only need the sign.
 */
function approxGeoLongitude(planet: string, date: Date): number {
  const sunLon = _approxSunLongitude(date);
  const helioLon = approxHelioLongitude(planet, date);

  if (planet === 'Mercury' || planet === 'Venus') {
    // For inner planets, a simple approximation: their geocentric position
    // oscillates around the Sun. We return the heliocentric position which
    // gives a reasonable sign estimate for a client-side app.
    return helioLon;
  }

  // For outer planets, heliocentric is close enough to geocentric for sign-level accuracy
  return helioLon;
}

/**
 * Approximate Moon ecliptic longitude using a more detailed model.
 * Based on simplified Brown's lunar theory terms.
 */
function approxMoonLongitude(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (date.getTime() - J2000_MS) / 86_400_000;

  const toRad = Math.PI / 180;

  // Moon's mean longitude
  const L = (218.316 + 13.176396 * d) % 360;
  // Moon's mean anomaly
  const M = (134.963 + 13.064993 * d) % 360;
  // Moon's mean distance (mean elongation)
  const D = (297.850 + 12.190749 * d) % 360;

  // Ecliptic longitude with principal perturbation terms
  let longitude =
    L +
    6.289 * Math.sin(M * toRad) +                     // equation of center
    1.274 * Math.sin((2 * D - M) * toRad) +            // evection
    0.658 * Math.sin(2 * D * toRad) +                  // variation
    0.214 * Math.sin(2 * M * toRad) -                  // annual equation
    0.186 * Math.sin(((134.963 + 13.064993 * d) - (357.528 + 0.9856003 * d)) * toRad) -
    0.114 * Math.sin(2 * (93.272 + 13.229350 * d) * toRad);

  longitude = ((longitude % 360) + 360) % 360;
  return longitude;
}

/**
 * Approximate the mean longitude of the Moon's North Node (Rahu).
 */
function approxNorthNodeLongitude(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (date.getTime() - J2000_MS) / 86_400_000;

  // Mean longitude of the ascending node
  let omega = 125.044 - 0.0529539 * d;
  omega = ((omega % 360) + 360) % 360;
  return omega;
}

/**
 * Build an array of approximate PlanetPosition entries for all planets.
 */
function computePlanetPositions(date: Date): PlanetPosition[] {
  const positions: PlanetPosition[] = [];

  // Sun
  const sunLon = _approxSunLongitude(date);
  positions.push({
    planet: 'Sun',
    sign: ZODIAC_ORDER[_longitudeToSignIndex(sunLon)],
    degree: Math.round(_longitudeToDegreeInSign(sunLon) * 100) / 100,
  });

  // Moon (detailed model)
  const moonLon = approxMoonLongitude(date);
  positions.push({
    planet: 'Moon',
    sign: ZODIAC_ORDER[_longitudeToSignIndex(moonLon)],
    degree: Math.round(_longitudeToDegreeInSign(moonLon) * 100) / 100,
  });

  // Planets
  const planetNames: Planet[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  for (const name of planetNames) {
    const lon = approxGeoLongitude(name, date);
    positions.push({
      planet: name,
      sign: ZODIAC_ORDER[_longitudeToSignIndex(lon)],
      degree: Math.round(_longitudeToDegreeInSign(lon) * 100) / 100,
    });
  }

  // North Node
  const nnLon = approxNorthNodeLongitude(date);
  positions.push({
    planet: 'NorthNode',
    sign: ZODIAC_ORDER[_longitudeToSignIndex(nnLon)],
    degree: Math.round(_longitudeToDegreeInSign(nnLon) * 100) / 100,
  });

  // South Node (opposite the North Node)
  const snLon = (nnLon + 180) % 360;
  positions.push({
    planet: 'SouthNode',
    sign: ZODIAC_ORDER[_longitudeToSignIndex(snLon)],
    degree: Math.round(_longitudeToDegreeInSign(snLon) * 100) / 100,
  });

  return positions;
}

// ---------- Main Export ----------

/**
 * Calculate a complete Western astrology profile from birth data.
 *
 * @param birthDate  Date of birth
 * @param birthTime  Optional time in "HH:MM" (24-hour, local time)
 * @param lat        Optional birth latitude  (degrees, + = N)
 * @param lng        Optional birth longitude (degrees, + = E)
 */
export function calculateWesternProfile(
  birthDate: Date,
  birthTime?: string,
  lat?: number,
  lng?: number,
): WesternProfile {
  const sun = getWesternSunSign(birthDate);
  const moon = getWesternMoonSign(birthDate);
  const rising = getWesternRisingSign(birthDate, birthTime, lat, lng);

  const planets = computePlanetPositions(birthDate);

  return {
    sun,
    moon,
    rising,
    element: getElement(sun),
    modality: getModality(sun),
    planets,
  };
}
