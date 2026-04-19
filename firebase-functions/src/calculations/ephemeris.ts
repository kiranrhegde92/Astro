/**
 * Ephemeris wrapper using astronomy-engine (pure JS, no native deps).
 * https://github.com/cosinekitty/astronomy
 */
import * as Astronomy from 'astronomy-engine';

export interface PlanetPosition {
  longitude: number;   // 0–360 ecliptic longitude
  latitude: number;
  distance: number;
  speed: number;
  retrograde: boolean;
  sign: string;
  signIndex: number;
  degree: number;
}

export interface HouseCusps {
  cusps: number[];     // [0] unused, [1]–[12]
  ascendant: number;
  mc: number;
}

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

// Lahiri ayanamsa (degrees) for a given year — linear approximation
// Reference: 23°51' on Jan 1, 2000, precessing at ~50.3"/year
export function getLahiriAyanamsa(date: Date): number {
  const jd = dateToJulian(date);
  const j2000 = 2451545.0;
  const daysSinceJ2000 = jd - j2000;
  const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
  return 23.853 + yearsSinceJ2000 * (50.3 / 3600);
}

export function dateToJulian(date: Date): number {
  return Astronomy.MakeTime(date).ut + 2451545.0; // AstroTime.ut is days since J2000
}

function longitudeToSign(lon: number) {
  const norm = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(norm / 30) % 12;
  return { sign: SIGNS[signIndex], signIndex, degree: norm % 30 };
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  SUN:     Astronomy.Body.Sun,
  MOON:    Astronomy.Body.Moon,
  MERCURY: Astronomy.Body.Mercury,
  VENUS:   Astronomy.Body.Venus,
  MARS:    Astronomy.Body.Mars,
  JUPITER: Astronomy.Body.Jupiter,
  SATURN:  Astronomy.Body.Saturn,
  URANUS:  Astronomy.Body.Uranus,
  NEPTUNE: Astronomy.Body.Neptune,
  PLUTO:   Astronomy.Body.Pluto,
};

function getEclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): { lon: number; lat: number; dist: number } {
  if (body === Astronomy.Body.Sun) {
    const eq = Astronomy.SunPosition(time);
    return { lon: eq.elon, lat: eq.elat, dist: 1.0 };
  }
  // Get heliocentric ecliptic, then convert to geocentric
  const ecl = Astronomy.EclipticGeoMoon !== undefined && body === Astronomy.Body.Moon
    ? (() => { const m = Astronomy.EclipticGeoMoon(time); return { lon: m.lon, lat: m.lat, dist: m.dist }; })()
    : (() => {
        const vec = Astronomy.GeoVector(body, time, false);
        const eclVec = Astronomy.Ecliptic(vec);
        return { lon: eclVec.elon, lat: eclVec.elat, dist: Math.sqrt(vec.x**2+vec.y**2+vec.z**2) };
      })();
  return ecl;
}

function getSpeed(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  try {
    const dt = 0.5; // half day
    const t1 = new Astronomy.AstroTime(time.ut - dt);
    const t2 = new Astronomy.AstroTime(time.ut + dt);
    const e1 = getEclipticLongitude(body, t1);
    const e2 = getEclipticLongitude(body, t2);
    let diff = e2.lon - e1.lon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff / (2 * dt);
  } catch { return 0; }
}

export function getAllPlanets(date: Date, applyAyanamsa = false): Record<string, PlanetPosition> {
  const time = Astronomy.MakeTime(date);
  const ayanamsa = applyAyanamsa ? getLahiriAyanamsa(date) : 0;
  const positions: Record<string, PlanetPosition> = {};

  for (const [name, body] of Object.entries(BODY_MAP)) {
    try {
      const ecl = getEclipticLongitude(body, time);
      const speed = getSpeed(body, time);
      const lon = ((ecl.lon - ayanamsa) + 360) % 360;
      const { sign, signIndex, degree } = longitudeToSign(lon);
      positions[name] = {
        longitude: lon,
        latitude: ecl.lat,
        distance: ecl.dist,
        speed,
        retrograde: speed < 0,
        sign, signIndex, degree,
      };
    } catch { /* skip */ }
  }

  // Mean Node (Rahu) — approximate: moves ~-19.3°/year from J2000 at 125.04°
  try {
    const jd = dateToJulian(date);
    const yearsSinceJ2000 = (jd - 2451545.0) / 365.25;
    const rahuLon = ((125.04 - 19.3 * yearsSinceJ2000 - ayanamsa) % 360 + 360) % 360;
    const { sign, signIndex, degree } = longitudeToSign(rahuLon);
    positions['MEAN_NODE'] = { longitude: rahuLon, latitude: 0, distance: 0, speed: -0.053, retrograde: true, sign, signIndex, degree };
    const ketuLon = (rahuLon + 180) % 360;
    const k = longitudeToSign(ketuLon);
    positions['KETU'] = { longitude: ketuLon, latitude: 0, distance: 0, speed: -0.053, retrograde: true, ...k };
  } catch { /* skip */ }

  return positions;
}

export function getHouseCusps(date: Date, lat: number, lng: number): HouseCusps {
  const time = Astronomy.MakeTime(date);

  // RAMC = Right Ascension of Midheaven
  const ramc = Astronomy.SiderealTime(time) * 15 + lng; // degrees
  const obliquity = 23.4393 - 0.0000004 * (dateToJulian(date) - 2451545.0) / 36525;

  // MC longitude
  const mcRad = Math.atan2(Math.sin(ramc * Math.PI / 180), Math.cos(ramc * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180));
  const mc = ((mcRad * 180 / Math.PI) + 360) % 360;

  // Ascendant
  const latR = lat * Math.PI / 180;
  const ramcR = ramc * Math.PI / 180;
  const oblR = obliquity * Math.PI / 180;
  const ascRad = Math.atan2(Math.cos(ramcR), -Math.sin(ramcR) * Math.cos(oblR) - Math.tan(latR) * Math.sin(oblR));
  const asc = ((ascRad * 180 / Math.PI) + 360) % 360;

  // Placidus house cusps (simplified — use equal houses as fallback)
  // Full Placidus requires iterative solution; we approximate with Porphyry here
  const cusps = [0];
  for (let h = 1; h <= 12; h++) {
    cusps.push(((asc + (h - 1) * 30) % 360));
  }

  // Place MC at cusp 10
  cusps[10] = mc;
  cusps[4] = (mc + 180) % 360;

  return { cusps, ascendant: asc, mc };
}

export function getAspects(
  positions: Record<string, PlanetPosition>,
  orb = 8
): Array<{ planet1: string; planet2: string; aspect: string; degrees: number; orb: number }> {
  const ASPECT_ANGLES: Record<number, string> = {
    0: 'Conjunction', 60: 'Sextile', 90: 'Square', 120: 'Trine', 150: 'Quincunx', 180: 'Opposition',
  };
  const planets = Object.keys(positions);
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = positions[planets[i]];
      const p2 = positions[planets[j]];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;
      for (const [angle, name] of Object.entries(ASPECT_ANGLES)) {
        const exactOrb = Math.abs(diff - Number(angle));
        if (exactOrb <= orb) {
          aspects.push({ planet1: planets[i], planet2: planets[j], aspect: name, degrees: Number(angle), orb: Math.round(exactOrb * 10) / 10 });
        }
      }
    }
  }
  return aspects;
}
