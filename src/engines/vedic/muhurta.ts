import type { Nakshatra } from '../../types/astrology';

export interface MuhurtaSnapshot {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  quality: 'favorable' | 'mixed' | 'caution';
  goodFor: string[];
  avoid: string[];
}

const TITHIS = [
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const YOGAS = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva',
  'Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'
];

const KARANAS = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function approximateSunLongitude(date: Date) {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const day = (date.getTime() - startOfYear.getTime()) / 86400000;
  return normalizeAngle(280.46 + 0.9856474 * day);
}

function approximateMoonLongitude(date: Date) {
  const epoch = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - epoch) / 86400000;
  return normalizeAngle(218.316 + 13.176396 * days);
}

export function calculateMuhurta(date = new Date(), currentNakshatra?: Nakshatra): MuhurtaSnapshot {
  const sun = approximateSunLongitude(date);
  const moon = approximateMoonLongitude(date);
  const lunarDifference = normalizeAngle(moon - sun);
  const tithiIndex = Math.floor(lunarDifference / 12) % 30;
  const yogaIndex = Math.floor(normalizeAngle(moon + sun) / (360 / 27)) % 27;
  const karanaIndex = Math.floor(lunarDifference / 6) % KARANAS.length;

  const tithi = TITHIS[tithiIndex];
  const yoga = YOGAS[yogaIndex];
  const karana = KARANAS[karanaIndex];
  const nakshatra = currentNakshatra ?? 'Ashwini';

  const favorableTithis = new Set(['Dvitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi']);
  const cautionTithis = new Set(['Chaturthi', 'Ashtami', 'Navami', 'Chaturdashi', 'Amavasya']);

  const quality: MuhurtaSnapshot['quality'] = cautionTithis.has(tithi)
    ? 'caution'
    : favorableTithis.has(tithi)
      ? 'favorable'
      : 'mixed';

  const goodFor = quality === 'favorable'
    ? ['starting focused work', 'planning travel', 'important conversations']
    : quality === 'mixed'
      ? ['routine tasks', 'refinement', 'finishing unfinished work']
      : ['rest, prayer, cleanup, journaling'];

  const avoid = quality === 'caution'
    ? ['major commitments', 'heated arguments', 'risky speculation']
    : quality === 'mixed'
      ? ['rushing decisions', 'overpromising', 'unnecessary conflict']
      : ['forceful shortcuts', 'ego-driven reactions'];

  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    quality,
    goodFor,
    avoid,
  };
}
