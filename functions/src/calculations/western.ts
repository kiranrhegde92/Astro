import { getAllPlanets, getHouses, getAspects, dateToJulian, PlanetPosition } from './ephemeris';

export interface WesternChart {
  sun: string;           // Sun sign
  moon: string;          // Moon sign
  rising: string;        // Ascendant sign
  planets: Record<string, { sign: string; degree: number; retrograde: boolean; house: number }>;
  houses: number[];      // 12 house cusp longitudes
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  dominantElement: string;
  dominantModality: string;
}

const ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

function planetToHouse(planetLon: number, cusps: number[]): number {
  for (let h = 1; h <= 12; h++) {
    const start = cusps[h];
    const end = cusps[h === 12 ? 1 : h + 1];
    if (start <= end) {
      if (planetLon >= start && planetLon < end) return h;
    } else {
      // Spans 0°
      if (planetLon >= start || planetLon < end) return h;
    }
  }
  return 1;
}

export function calculateWesternChart(
  birthDate: Date,
  lat: number,
  lng: number
): WesternChart {
  const jd = dateToJulian(birthDate);
  const positions = getAllPlanets(jd); // Tropical (no ayanamsa)
  const houses = getHouses(jd, lat, lng, 'P');
  const aspects = getAspects(positions);

  const planetData: WesternChart['planets'] = {};
  for (const [name, pos] of Object.entries(positions)) {
    planetData[name] = {
      sign: pos.sign,
      degree: Math.round(pos.degree * 100) / 100,
      retrograde: pos.retrograde,
      house: planetToHouse(pos.longitude, houses.cusps),
    };
  }

  // Dominant element/modality count
  const elementCount: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCount: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const personalPlanets = ['SUN','MOON','MERCURY','VENUS','MARS'];
  for (const p of personalPlanets) {
    if (positions[p]) {
      elementCount[ELEMENTS[positions[p].sign]] = (elementCount[ELEMENTS[positions[p].sign]] || 0) + 1;
      modalityCount[MODALITIES[positions[p].sign]] = (modalityCount[MODALITIES[positions[p].sign]] || 0) + 1;
    }
  }
  const dominantElement = Object.entries(elementCount).sort((a,b) => b[1]-a[1])[0][0];
  const dominantModality = Object.entries(modalityCount).sort((a,b) => b[1]-a[1])[0][0];

  // Rising sign from ascendant longitude
  const risingSigns = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const risingIndex = Math.floor(houses.ascendant / 30) % 12;

  return {
    sun: positions.SUN?.sign ?? 'Unknown',
    moon: positions.MOON?.sign ?? 'Unknown',
    rising: risingSigns[risingIndex],
    planets: planetData,
    houses: houses.cusps.slice(1), // houses 1–12
    aspects: aspects.map(a => ({ planet1: a.planet1, planet2: a.planet2, aspect: a.aspect, orb: a.orb })),
    dominantElement,
    dominantModality,
  };
}
