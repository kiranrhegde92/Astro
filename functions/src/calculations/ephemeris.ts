// Swiss Ephemeris wrapper
// Docs: https://www.astro.com/swisseph/swephprg.htm
import * as swisseph from 'swisseph';

export interface PlanetPosition {
  longitude: number;   // 0–360 ecliptic longitude
  latitude: number;
  distance: number;    // AU
  speed: number;       // degrees/day (negative = retrograde)
  retrograde: boolean;
  sign: string;        // zodiac sign name
  signIndex: number;   // 0=Aries … 11=Pisces
  degree: number;      // degree within sign (0–29.99)
}

export interface HouseCusps {
  cusps: number[];     // [0] unused, [1]–[12] house cusps in longitude
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
}

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

export const PLANETS = {
  SUN:     swisseph.SE_SUN,
  MOON:    swisseph.SE_MOON,
  MERCURY: swisseph.SE_MERCURY,
  VENUS:   swisseph.SE_VENUS,
  MARS:    swisseph.SE_MARS,
  JUPITER: swisseph.SE_JUPITER,
  SATURN:  swisseph.SE_SATURN,
  URANUS:  swisseph.SE_URANUS,
  NEPTUNE: swisseph.SE_NEPTUNE,
  PLUTO:   swisseph.SE_PLUTO,
  MEAN_NODE: swisseph.SE_MEAN_NODE,  // Rahu (North Node)
};

export function dateToJulian(date: Date): number {
  return swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
    swisseph.SE_GREG_CAL
  );
}

function longitudeToSign(lon: number): { sign: string; signIndex: number; degree: number } {
  const signIndex = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[signIndex], signIndex, degree: lon % 30 };
}

export function getPlanetPosition(julianDay: number, planet: number, flags = swisseph.SEFLG_SWIEPH): PlanetPosition {
  const result = swisseph.swe_calc_ut(julianDay, planet, flags);
  if (result.error) throw new Error(`Ephemeris error for planet ${planet}: ${result.error}`);

  const longitude = result.longitude;
  const { sign, signIndex, degree } = longitudeToSign(longitude);

  return {
    longitude,
    latitude: result.latitude,
    distance: result.distance,
    speed: result.longitudeSpeed,
    retrograde: result.longitudeSpeed < 0,
    sign,
    signIndex,
    degree,
  };
}

export function getAllPlanets(julianDay: number, ayanamsa?: number): Record<string, PlanetPosition> {
  const flags = ayanamsa !== undefined
    ? swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL
    : swisseph.SEFLG_SWIEPH;

  if (ayanamsa !== undefined) {
    swisseph.swe_set_sid_mode(ayanamsa, 0, 0);
  }

  const positions: Record<string, PlanetPosition> = {};
  for (const [name, id] of Object.entries(PLANETS)) {
    try {
      positions[name] = getPlanetPosition(julianDay, id, flags);
    } catch {
      // Skip planet if calculation fails
    }
  }

  // Ketu = Rahu + 180
  if (positions.MEAN_NODE) {
    const ketuLon = (positions.MEAN_NODE.longitude + 180) % 360;
    const { sign, signIndex, degree } = longitudeToSign(ketuLon);
    positions.KETU = { ...positions.MEAN_NODE, longitude: ketuLon, sign, signIndex, degree };
  }

  return positions;
}

export function getHouses(
  julianDay: number,
  lat: number,
  lng: number,
  system = 'P' // P = Placidus
): HouseCusps {
  const result = swisseph.swe_houses(julianDay, lat, lng, system.charCodeAt(0));
  if (result.error) throw new Error(`House calculation error: ${result.error}`);
  return {
    cusps: result.house,
    ascendant: result.ascendant,
    mc: result.mc,
    armc: result.armc,
    vertex: result.vertex,
  };
}

export function getAspects(
  positions: Record<string, PlanetPosition>,
  orb = 8
): Array<{ planet1: string; planet2: string; aspect: string; degrees: number; orb: number }> {
  const ASPECT_TYPES: Record<number, string> = {
    0: 'Conjunction', 60: 'Sextile', 90: 'Square',
    120: 'Trine', 150: 'Quincunx', 180: 'Opposition',
  };

  const planets = Object.keys(positions);
  const aspects = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = positions[planets[i]];
      const p2 = positions[planets[j]];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const [angle, name] of Object.entries(ASPECT_TYPES)) {
        const exactOrb = Math.abs(diff - Number(angle));
        if (exactOrb <= orb) {
          aspects.push({
            planet1: planets[i],
            planet2: planets[j],
            aspect: name,
            degrees: Number(angle),
            orb: Math.round(exactOrb * 10) / 10,
          });
        }
      }
    }
  }
  return aspects;
}
