import { getAllPlanets, getHouseCusps, getLahiriAyanamsa } from './ephemeris';

export interface VedicChart {
  rashi: string;
  lagna: string;
  nakshatra: string;
  nakshatraPada: number;
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
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
];

const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

function getNakshatraInfo(moonLon: number) {
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonLon / nakshatraSpan) % 27;
  const pada = Math.floor((moonLon % nakshatraSpan) / (nakshatraSpan / 4)) + 1;
  return {
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraPada: pada,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex],
    nakshatraIndex,
    longitudeInNakshatra: moonLon % nakshatraSpan,
  };
}

function calculateDasha(birthDate: Date, moonLon: number) {
  const { nakshatraLord, longitudeInNakshatra } = getNakshatraInfo(moonLon);
  const nakshatraSpan = 360 / 27;
  const fractionElapsed = longitudeInNakshatra / nakshatraSpan;
  const totalYearsInDasha = DASHA_YEARS[nakshatraLord];
  const yearsElapsed = fractionElapsed * totalYearsInDasha;

  const dashaStart = new Date(birthDate);
  dashaStart.setFullYear(dashaStart.getFullYear() - Math.floor(yearsElapsed));
  dashaStart.setMonth(dashaStart.getMonth() - Math.round((yearsElapsed % 1) * 12));

  let idx = DASHA_ORDER.indexOf(nakshatraLord);
  const now = new Date();
  const dashas: Array<{ planet: string; start: Date; end: Date }> = [];
  let cursor = new Date(dashaStart);

  for (let i = 0; i < 18; i++) {
    const planet = DASHA_ORDER[idx % 9];
    const years = DASHA_YEARS[planet];
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + years);
    dashas.push({ planet, start: new Date(cursor), end });
    if (end > now && i > 0) break;
    cursor = new Date(end);
    idx++;
  }

  const currentDasha = dashas.find(d => d.start <= now && d.end >= now) ?? dashas[dashas.length - 1];
  const dashaStartIdx = DASHA_ORDER.indexOf(currentDasha.planet);
  const dashaSpanMs = currentDasha.end.getTime() - currentDasha.start.getTime();
  let subCursor = new Date(currentDasha.start);
  let subDasha = { planet: currentDasha.planet, startDate: currentDasha.start.toISOString(), endDate: currentDasha.end.toISOString() };

  for (let i = 0; i < 9; i++) {
    const subPlanet = DASHA_ORDER[(dashaStartIdx + i) % 9];
    const subFraction = DASHA_YEARS[subPlanet] / 120;
    const subEnd = new Date(subCursor.getTime() + dashaSpanMs * subFraction);
    if (subCursor <= now && subEnd >= now) {
      subDasha = { planet: subPlanet, startDate: subCursor.toISOString(), endDate: subEnd.toISOString() };
      break;
    }
    subCursor = subEnd;
  }

  return {
    currentDasha: { planet: currentDasha.planet, startDate: currentDasha.start.toISOString(), endDate: currentDasha.end.toISOString() },
    subDasha,
  };
}

export function calculateVedicChart(birthDate: Date, lat: number, lng: number): VedicChart {
  const ayanamsa = getLahiriAyanamsa(birthDate);
  const positions = getAllPlanets(birthDate, true); // sidereal
  const houses = getHouseCusps(birthDate, lat, lng);

  const siderealAsc = ((houses.ascendant - ayanamsa) + 360) % 360;
  const lagnaIndex = Math.floor(siderealAsc / 30) % 12;

  const moonLon = positions.MOON?.longitude ?? 0;
  const { nakshatra, nakshatraPada, nakshatraLord } = getNakshatraInfo(moonLon);
  const { currentDasha, subDasha } = calculateDasha(birthDate, moonLon);

  const planetData: VedicChart['planets'] = {};
  for (const [name, pos] of Object.entries(positions)) {
    const signIndex = Math.floor(pos.longitude / 30) % 12;
    const houseNum = ((signIndex - lagnaIndex + 12) % 12) + 1;
    planetData[name] = { sign: SIGNS[signIndex], degree: Math.round(pos.degree * 100) / 100, retrograde: pos.retrograde, house: houseNum };
  }

  const rashiIndex = Math.floor(moonLon / 30) % 12;

  return {
    rashi: SIGNS[rashiIndex],
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
