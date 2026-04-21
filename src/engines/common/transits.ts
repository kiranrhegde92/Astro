/**
 * Transit Calculator
 *
 * Computes current (today's) planetary positions using the same orbital
 * models as the birth chart, then compares them against natal positions
 * to identify active transits.
 *
 * Reference: Robert Hand, "Planets in Transit"
 */

import type { PlanetPosition, Planet, WesternSign } from '../../types/astrology';

const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const toRad = Math.PI / 180;
const ZODIAC: WesternSign[] = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

/* ── Sun longitude ─────────────────────────────────────────────────── */
function sunLongitude(d: number): number {
  const L = (280.460 + 0.9856474 * d) % 360;
  const g = ((357.528 + 0.9856003 * d) % 360) * toRad;
  let lon = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  return ((lon % 360) + 360) % 360;
}

/* ── Moon longitude (6-term Brown) ─────────────────────────────────── */
function moonLongitude(d: number): number {
  const L = (218.316 + 13.176396 * d) % 360;
  const M = (134.963 + 13.064993 * d) % 360;
  const D = (297.850 + 12.190749 * d) % 360;
  let lon = L
    + 6.289 * Math.sin(M * toRad)
    + 1.274 * Math.sin((2*D - M) * toRad)
    + 0.658 * Math.sin(2*D * toRad)
    + 0.214 * Math.sin(2*M * toRad)
    - 0.186 * Math.sin((357.528 + 0.9856003*d) * toRad)
    - 0.114 * Math.sin(2*(93.272 + 13.229350*d) * toRad);
  return ((lon % 360) + 360) % 360;
}

/* ── Outer planet longitude (mean elements + equation of center) ──── */
const ELEMENTS: Record<string, [number,number,number,number]> = {
  Mercury: [252.251, 4.09233445,  0.205635, 77.456],
  Venus:   [181.980, 1.60213049,  0.006773, 131.564],
  Mars:    [355.433, 0.52402068,  0.093405, 336.060],
  Jupiter: [ 34.351, 0.08308529,  0.048498, 14.331],
  Saturn:  [ 50.077, 0.03344414,  0.054151, 93.057],
};

function planetLongitude(planet: string, d: number): number {
  const [L0, n, e, w] = ELEMENTS[planet];
  const L = (L0 + n * d) % 360;
  let M = ((L - w) % 360 + 360) % 360;
  const Mrad = M * toRad;
  const C = (2*e - e**3/4) * Math.sin(Mrad)
          + (5/4) * e**2 * Math.sin(2*Mrad);
  return (((L + C * (180/Math.PI)) % 360) + 360) % 360;
}

/* ── North Node ────────────────────────────────────────────────────── */
function northNodeLon(d: number): number {
  return ((125.044 - 0.0529539 * d) % 360 + 360) % 360;
}

/* ── Retrograde detection ─────────────────────────────────────────── */
function isRetrograde(planet: string, d: number): boolean {
  if (planet === 'Sun' || planet === 'Moon') return false;
  const today    = planetLongitude(planet, d);
  const tomorrow = planetLongitude(planet, d + 1);
  let diff = tomorrow - today;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

/* ── Build full position set for a given date ─────────────────────── */
function toLon(sign: WesternSign, deg: number) { return ZODIAC.indexOf(sign) * 30 + deg; }

function lonToPosition(planet: Planet, lon: number, d: number, retroCheck: boolean): PlanetPosition {
  const norm = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(norm / 30) % 12;
  const deg = Math.round((norm % 30) * 100) / 100;
  return {
    planet,
    sign: ZODIAC[signIdx],
    degree: deg,
    retrograde: retroCheck && ELEMENTS[planet as string] ? isRetrograde(planet as string, d) : false,
  };
}

/**
 * Calculate current planetary positions for today (or any date).
 */
export function getCurrentTransits(date = new Date()): PlanetPosition[] {
  const d = (date.getTime() - J2000_MS) / 86_400_000;
  const positions: PlanetPosition[] = [];

  positions.push(lonToPosition('Sun',    sunLongitude(d),  d, false));
  positions.push(lonToPosition('Moon',   moonLongitude(d), d, false));
  for (const name of ['Mercury','Venus','Mars','Jupiter','Saturn'] as Planet[]) {
    positions.push(lonToPosition(name, planetLongitude(name as string, d), d, true));
  }
  const nn = northNodeLon(d);
  positions.push(lonToPosition('NorthNode', nn, d, false));
  positions.push(lonToPosition('SouthNode', (nn + 180) % 360, d, false));

  return positions;
}

/* ── Transit-to-natal comparison ──────────────────────────────────── */
export interface TransitHit {
  transitPlanet: Planet;
  natalPlanet: Planet;
  aspect: string;    // 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
  orb: number;
  interpretation: string;
}

const ASPECT_ANGLES = [
  { name: 'conjunction', angle: 0,   maxOrb: 6 },
  { name: 'opposition',  angle: 180, maxOrb: 6 },
  { name: 'trine',       angle: 120, maxOrb: 6 },
  { name: 'square',      angle: 90,  maxOrb: 5 },
  { name: 'sextile',     angle: 60,  maxOrb: 4 },
];

const TRANSIT_MEANINGS: Record<string, Record<string, string>> = {
  conjunction: {
    Sun: 'Transit Sun conjunct natal %NATAL% — heightened vitality and visibility in %NATAL% themes.',
    Moon: 'Transit Moon conjunct natal %NATAL% — emotional sensitivity around %NATAL% matters peaks today.',
    Mercury: 'Transit Mercury conjunct natal %NATAL% — clarity in communication and %NATAL%-related decisions.',
    Venus: 'Transit Venus conjunct natal %NATAL% — ease and harmony in %NATAL% areas, good for relationships.',
    Mars: 'Transit Mars conjunct natal %NATAL% — increased drive and assertiveness around %NATAL% themes.',
    Jupiter: 'Transit Jupiter conjunct natal %NATAL% — expansion and opportunity in %NATAL% matters.',
    Saturn: 'Transit Saturn conjunct natal %NATAL% — structure and discipline required in %NATAL% areas.',
  },
  trine: {
    default: 'Transit %TRANSIT% trine natal %NATAL% — flowing support, natural ease in related areas.',
  },
  square: {
    default: 'Transit %TRANSIT% square natal %NATAL% — productive tension that pushes growth.',
  },
  opposition: {
    default: 'Transit %TRANSIT% opposite natal %NATAL% — awareness through contrast, balance needed.',
  },
  sextile: {
    default: 'Transit %TRANSIT% sextile natal %NATAL% — gentle opportunity if you act on it.',
  },
};

/**
 * Sort modes:
 *  'forecast' (default) — slow planets first (Jupiter/Saturn define weekly/monthly trends)
 *  'daily'              — fast planets first (Moon/Sun change day to day)
 */
export function findActiveTransits(
  natalPlanets: PlanetPosition[],
  transitDate = new Date(),
  sortMode: 'daily' | 'forecast' = 'forecast',
): TransitHit[] {
  const transits = getCurrentTransits(transitDate);
  const hits: TransitHit[] = [];

  for (const tp of transits) {
    for (const np of natalPlanets) {
      if (tp.planet === np.planet) continue; // skip self
      const tLon = toLon(tp.sign, tp.degree);
      const nLon = toLon(np.sign, np.degree);
      let sep = Math.abs(tLon - nLon) % 360;
      if (sep > 180) sep = 360 - sep;

      for (const asp of ASPECT_ANGLES) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.maxOrb) {
          const meanings = TRANSIT_MEANINGS[asp.name];
          const template = (meanings as any)[tp.planet] ?? (meanings as any).default ?? '';
          const interp = template.replace('%TRANSIT%', tp.planet).replace('%NATAL%', np.planet);
          hits.push({ transitPlanet: tp.planet, natalPlanet: np.planet, aspect: asp.name, orb: Math.round(orb * 100)/100, interpretation: interp });
          break;
        }
      }
    }
  }

  if (sortMode === 'daily') {
    // Daily mode: Moon first (13°/day), then other fast movers, then outer planets.
    // This ensures the daily reading reflects what is unique to TODAY.
    const DAILY_TIER: Partial<Record<string, number>> = {
      Moon: 0,
      Sun: 1, Mercury: 1, Venus: 1, Mars: 2,
      Jupiter: 3, Saturn: 3, Uranus: 3, Neptune: 3, Pluto: 3, NorthNode: 3, SouthNode: 3,
    };
    hits.sort((a, b) => {
      const aT = DAILY_TIER[a.transitPlanet] ?? 2;
      const bT = DAILY_TIER[b.transitPlanet] ?? 2;
      if (aT !== bT) return aT - bT;
      return a.orb - b.orb;
    });
  } else {
    // Forecast mode: slow planets first (they define the sustained trend).
    const slowPlanets = new Set<Planet>(['Jupiter', 'Saturn', 'NorthNode', 'SouthNode']);
    hits.sort((a, b) => {
      const aW = slowPlanets.has(a.transitPlanet) ? 0 : 1;
      const bW = slowPlanets.has(b.transitPlanet) ? 0 : 1;
      if (aW !== bW) return aW - bW;
      return a.orb - b.orb;
    });
  }

  return hits.slice(0, 6); // top 6 most significant
}
