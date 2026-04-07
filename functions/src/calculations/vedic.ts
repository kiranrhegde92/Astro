import * as swisseph from 'swisseph';
import { getAllPlanets, getHouses, dateToJulian } from './ephemeris';

export interface VedicChart {
  rashi: string;           // Moon sign (sidereal)
  lagna: string;           // Ascendant (sidereal)
  nakshatra: string;       // Moon nakshatra
  nakshatraPada: number;   // 1–4
  nakshatraLord: string;
  planets: Record<string, { sign: string; degree: number; retrograde: boolean; house: number }>;
  currentDasha: { planet: string; startDate: string; endDate: string };
  subDasha: { planet: string; startDate: string; endDate: string };
  ayanamsa: number;
}

const SIGNS = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
];

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const NAKSHATRA_LORDS = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // 1–9
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // 10–18
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury', // 19–27
];

// Vimshottari dasha periods in years
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

function getNakshatraInfo(moonLon: number) {
  const nakshatraIndex = Math.floor(moonLon / (360 / 27));
  const pada = Math.floor((moonLon % (360 / 27)) / (360 / 27 / 4)) + 1;
  return {
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraPada: pada,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex],
    nakshatraIndex,
    longitudeInNakshatra: moonLon % (360 / 27),
  };
}

function calculateDasha(birthDate: Date, moonLon: number) {
  const { nakshatraLord, nakshatraIndex, longitudeInNakshatra } = getNakshatraInfo(moonLon);

  // How far through the current nakshatra span at birth
  const nakshatraSpan = 360 / 27; // ~13.333°
  const fractionElapsed = longitudeInNakshatra / nakshatraSpan;
  const totalYearsInDasha = DASHA_YEARS[nakshatraLord];
  const yearsElapsed = fractionElapsed * totalYearsInDasha;

  // Start of current dasha (at birth, partially elapsed)
  const dashaStart = new Date(birthDate);
  dashaStart.setFullYear(dashaStart.getFullYear() - yearsElapsed);

  const dashaOrder = DASHA_ORDER;
  const startIdx = dashaOrder.indexOf(nakshatraLord);

  // Build dasha timeline
  const dashas: Array<{ planet: string; start: Date; end: Date }> = [];
  let cursor = new Date(dashaStart);
  let idx = startIdx;
  const now = new Date();

  for (let i = 0; i < 18; i++) {
    const planet = dashaOrder[idx % 9];
    const years = DASHA_YEARS[planet];
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + years);
    dashas.push({ planet, start: new Date(cursor), end });
    if (end > now && dashas.length > 1) break;
    cursor = new Date(end);
    idx++;
  }

  // Find current dasha
  const currentDasha = dashas.find(d => d.start <= now && d.end >= now) ?? dashas[dashas.length - 1];

  // Sub-dasha (antardasha) within current dasha
  const dashaStartIdx = dashaOrder.indexOf(currentDasha.planet);
  const dashaSpanMs = currentDasha.end.getTime() - currentDasha.start.getTime();
  let subCursor = new Date(currentDasha.start);
  let subDasha = { planet: currentDasha.planet, startDate: currentDasha.start.toISOString(), endDate: currentDasha.end.toISOString() };

  for (let i = 0; i < 9; i++) {
    const subPlanet = dashaOrder[(dashaStartIdx + i) % 9];
    const subFraction = DASHA_YEARS[subPlanet] / 120; // 120 = total dasha cycle
    const subEndMs = subCursor.getTime() + dashaSpanMs * subFraction;
    const subEnd = new Date(subEndMs);
    if (subCursor <= now && subEnd >= now) {
      subDasha = { planet: subPlanet, startDate: subCursor.toISOString(), endDate: subEnd.toISOString() };
      break;
    }
    subCursor = subEnd;
  }

  return {
    currentDasha: {
      planet: currentDasha.planet,
      startDate: currentDasha.start.toISOString(),
      endDate: currentDasha.end.toISOString(),
    },
    subDasha,
  };
}

export function calculateVedicChart(
  birthDate: Date,
  lat: number,
  lng: number
): VedicChart {
  const jd = dateToJulian(birthDate);

  // Use Lahiri ayanamsa (SE_SIDM_LAHIRI = 1)
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);

  const positions = getAllPlanets(jd, swisseph.SE_SIDM_LAHIRI);
  const houses = getHouses(jd, lat, lng, 'P'); // Placidus for Vedic lagna

  // Sidereal ascendant
  const siderealAsc = ((houses.ascendant - ayanamsa) + 360) % 360;
  const lagnaIndex = Math.floor(siderealAsc / 30) % 12;

  const moonLon = positions.MOON?.longitude ?? 0;
  const { nakshatra, nakshatraPada, nakshatraLord } = getNakshatraInfo(moonLon);
  const { currentDasha, subDasha } = calculateDasha(birthDate, moonLon);

  const planetData: VedicChart['planets'] = {};
  for (const [name, pos] of Object.entries(positions)) {
    const signIndex = Math.floor(pos.longitude / 30) % 12;
    // Calculate house from sidereal lagna
    const houseNum = ((signIndex - lagnaIndex + 12) % 12) + 1;
    planetData[name] = {
      sign: SIGNS[signIndex],
      degree: Math.round(pos.degree * 100) / 100,
      retrograde: pos.retrograde,
      house: houseNum,
    };
  }

  return {
    rashi: positions.MOON?.sign ?? SIGNS[Math.floor(moonLon / 30) % 12],
    lagna: SIGNS[lagnaIndex],
    nakshatra,
    nakshatraPada,
    nakshatraLord,
    planets: planetData,
    currentDasha,
    subDasha,
    ayanamsa: Math.round(ayanamsa * 1000) / 1000,
  };
}
