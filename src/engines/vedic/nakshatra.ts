import { Nakshatra, DashaPlanet } from '../../types/astrology';

/**
 * Compute the Lahiri (Chitrapaksha) ayanamsa for a given date.
 * Rate: ~50.3 arcsec/year = 0.013970°/year. Reference at J2000.0: 23.85319°.
 */
function getLahiriAyanamsa(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const yearsSinceJ2000 = (date.getTime() - J2000_MS) / (365.25 * 86_400_000);
  return 23.85319 + 0.013970 * yearsSinceJ2000;
}

/**
 * Each Nakshatra spans 13 degrees and 20 minutes (13.3333... degrees).
 * 360 / 27 = 13°20'
 */
const NAKSHATRA_SPAN = 360 / 27; // 13.3333...

export interface NakshatraInfo {
  name: Nakshatra;
  rulingPlanet: DashaPlanet;
  deity: string;
  symbol: string;
  startDegree: number;
  endDegree: number;
  qualities: string[];
}

/**
 * The 27 Nakshatras (Lunar Mansions) of Vedic astrology.
 * Each spans 13°20' of the sidereal zodiac, and is divided into 4 padas of 3°20' each.
 */
export const NAKSHATRA_DATA: NakshatraInfo[] = [
  {
    name: 'Ashwini',
    rulingPlanet: 'Ketu',
    deity: 'Ashwini Kumaras (Divine Physicians)',
    symbol: 'Horse Head',
    startDegree: 0,
    endDegree: 13 + 20 / 60,
    qualities: ['Swift healing energy', 'Pioneering spirit', 'Miraculous vitality', 'Quick initiative'],
  },
  {
    name: 'Bharani',
    rulingPlanet: 'Venus',
    deity: 'Yama (God of Dharma)',
    symbol: 'Yoni (Womb)',
    startDegree: 13 + 20 / 60,
    endDegree: 26 + 40 / 60,
    qualities: ['Creative power', 'Transformative strength', 'Nurturing abundance', 'Moral courage'],
  },
  {
    name: 'Krittika',
    rulingPlanet: 'Sun',
    deity: 'Agni (God of Fire)',
    symbol: 'Razor / Flame',
    startDegree: 26 + 40 / 60,
    endDegree: 40,
    qualities: ['Purifying brilliance', 'Sharp intellect', 'Protective warmth', 'Truthful clarity'],
  },
  {
    name: 'Rohini',
    rulingPlanet: 'Moon',
    deity: 'Brahma (Creator)',
    symbol: 'Chariot / Ox Cart',
    startDegree: 40,
    endDegree: 53 + 20 / 60,
    qualities: ['Magnetic beauty', 'Fertile creativity', 'Material abundance', 'Artistic grace'],
  },
  {
    name: 'Mrigashira',
    rulingPlanet: 'Mars',
    deity: 'Soma (Moon God)',
    symbol: 'Deer Head',
    startDegree: 53 + 20 / 60,
    endDegree: 66 + 40 / 60,
    qualities: ['Gentle curiosity', 'Seeking nature', 'Joyful exploration', 'Perceptive awareness'],
  },
  {
    name: 'Ardra',
    rulingPlanet: 'Rahu',
    deity: 'Rudra (Storm God)',
    symbol: 'Teardrop / Diamond',
    startDegree: 66 + 40 / 60,
    endDegree: 80,
    qualities: ['Intellectual depth', 'Transformative insight', 'Emotional authenticity', 'Renewing power'],
  },
  {
    name: 'Punarvasu',
    rulingPlanet: 'Jupiter',
    deity: 'Aditi (Mother of Gods)',
    symbol: 'Bow and Quiver',
    startDegree: 80,
    endDegree: 93 + 20 / 60,
    qualities: ['Boundless optimism', 'Renewal and return', 'Generous wisdom', 'Spiritual resilience'],
  },
  {
    name: 'Pushya',
    rulingPlanet: 'Saturn',
    deity: 'Brihaspati (Divine Teacher)',
    symbol: 'Flower / Circle',
    startDegree: 93 + 20 / 60,
    endDegree: 106 + 40 / 60,
    qualities: ['Nourishing strength', 'Spiritual devotion', 'Charitable heart', 'Auspicious fortune'],
  },
  {
    name: 'Ashlesha',
    rulingPlanet: 'Mercury',
    deity: 'Sarpa (Serpent Gods)',
    symbol: 'Coiled Serpent',
    startDegree: 106 + 40 / 60,
    endDegree: 120,
    qualities: ['Mystical perception', 'Hypnotic charisma', 'Strategic brilliance', 'Kundalini power'],
  },
  {
    name: 'Magha',
    rulingPlanet: 'Ketu',
    deity: 'Pitris (Ancestral Spirits)',
    symbol: 'Royal Throne',
    startDegree: 120,
    endDegree: 133 + 20 / 60,
    qualities: ['Regal authority', 'Ancestral blessings', 'Noble bearing', 'Leadership magnetism'],
  },
  {
    name: 'Purva Phalguni',
    rulingPlanet: 'Venus',
    deity: 'Bhaga (God of Fortune)',
    symbol: 'Front Legs of Bed / Hammock',
    startDegree: 133 + 20 / 60,
    endDegree: 146 + 40 / 60,
    qualities: ['Creative delight', 'Romantic joy', 'Artistic talent', 'Prosperity and ease'],
  },
  {
    name: 'Uttara Phalguni',
    rulingPlanet: 'Sun',
    deity: 'Aryaman (God of Patronage)',
    symbol: 'Back Legs of Bed',
    startDegree: 146 + 40 / 60,
    endDegree: 160,
    qualities: ['Generous friendship', 'Humanitarian warmth', 'Trustworthy leadership', 'Lasting partnerships'],
  },
  {
    name: 'Hasta',
    rulingPlanet: 'Moon',
    deity: 'Savitar (Sun God of Inspiration)',
    symbol: 'Open Hand',
    startDegree: 160,
    endDegree: 173 + 20 / 60,
    qualities: ['Skilled craftsmanship', 'Healing hands', 'Witty intelligence', 'Manifesting power'],
  },
  {
    name: 'Chitra',
    rulingPlanet: 'Mars',
    deity: 'Vishvakarma (Divine Architect)',
    symbol: 'Shining Jewel',
    startDegree: 173 + 20 / 60,
    endDegree: 186 + 40 / 60,
    qualities: ['Dazzling creativity', 'Architectural vision', 'Magnetic beauty', 'Artistic mastery'],
  },
  {
    name: 'Swati',
    rulingPlanet: 'Rahu',
    deity: 'Vayu (God of Wind)',
    symbol: 'Coral / Young Sprout',
    startDegree: 186 + 40 / 60,
    endDegree: 200,
    qualities: ['Independent spirit', 'Flexible adaptability', 'Diplomatic grace', 'Self-directed growth'],
  },
  {
    name: 'Vishakha',
    rulingPlanet: 'Jupiter',
    deity: 'Indra & Agni (Power and Fire)',
    symbol: 'Triumphal Arch',
    startDegree: 200,
    endDegree: 213 + 20 / 60,
    qualities: ['Focused determination', 'Purposeful ambition', 'Celebratory triumph', 'Spiritual dedication'],
  },
  {
    name: 'Anuradha',
    rulingPlanet: 'Saturn',
    deity: 'Mitra (God of Friendship)',
    symbol: 'Lotus Flower',
    startDegree: 213 + 20 / 60,
    endDegree: 226 + 40 / 60,
    qualities: ['Devoted friendship', 'Organizational skill', 'Cooperative harmony', 'Spiritual discipline'],
  },
  {
    name: 'Jyeshtha',
    rulingPlanet: 'Mercury',
    deity: 'Indra (King of Gods)',
    symbol: 'Circular Amulet / Umbrella',
    startDegree: 226 + 40 / 60,
    endDegree: 240,
    qualities: ['Protective authority', 'Elder wisdom', 'Courageous valor', 'Resourceful intelligence'],
  },
  {
    name: 'Mula',
    rulingPlanet: 'Ketu',
    deity: 'Nirriti (Goddess of Dissolution)',
    symbol: 'Bundle of Roots',
    startDegree: 240,
    endDegree: 253 + 20 / 60,
    qualities: ['Root-level transformation', 'Philosophical depth', 'Investigative power', 'Liberation seeking'],
  },
  {
    name: 'Purva Ashadha',
    rulingPlanet: 'Venus',
    deity: 'Apas (Water Goddess)',
    symbol: 'Elephant Tusk / Winnowing Fan',
    startDegree: 253 + 20 / 60,
    endDegree: 266 + 40 / 60,
    qualities: ['Invincible spirit', 'Purifying energy', 'Inspiring enthusiasm', 'Unshakeable conviction'],
  },
  {
    name: 'Uttara Ashadha',
    rulingPlanet: 'Sun',
    deity: 'Vishwadevas (Universal Gods)',
    symbol: 'Elephant Tusk / Small Bed',
    startDegree: 266 + 40 / 60,
    endDegree: 280,
    qualities: ['Universal leadership', 'Final victory', 'Righteous purpose', 'Unwavering commitment'],
  },
  {
    name: 'Shravana',
    rulingPlanet: 'Moon',
    deity: 'Vishnu (The Preserver)',
    symbol: 'Three Footprints / Ear',
    startDegree: 280,
    endDegree: 293 + 20 / 60,
    qualities: ['Deep listening', 'Knowledge preservation', 'Connective wisdom', 'Pervasive awareness'],
  },
  {
    name: 'Dhanishta',
    rulingPlanet: 'Mars',
    deity: 'Vasus (Gods of Abundance)',
    symbol: 'Musical Drum',
    startDegree: 293 + 20 / 60,
    endDegree: 306 + 40 / 60,
    qualities: ['Musical talent', 'Wealth attraction', 'Rhythmic vitality', 'Philanthropic generosity'],
  },
  {
    name: 'Shatabhisha',
    rulingPlanet: 'Rahu',
    deity: 'Varuna (God of Cosmic Waters)',
    symbol: 'Empty Circle / Hundred Flowers',
    startDegree: 306 + 40 / 60,
    endDegree: 320,
    qualities: ['Healing mastery', 'Mystical insight', 'Scientific acumen', 'Boundary-dissolving vision'],
  },
  {
    name: 'Purva Bhadrapada',
    rulingPlanet: 'Jupiter',
    deity: 'Aja Ekapada (One-Footed Goat)',
    symbol: 'Front of Funeral Cot / Two-Faced Man',
    startDegree: 320,
    endDegree: 333 + 20 / 60,
    qualities: ['Spiritual fire', 'Transformative wisdom', 'Passionate idealism', 'Occult knowledge'],
  },
  {
    name: 'Uttara Bhadrapada',
    rulingPlanet: 'Saturn',
    deity: 'Ahir Budhnya (Serpent of the Deep)',
    symbol: 'Back of Funeral Cot / Twin',
    startDegree: 333 + 20 / 60,
    endDegree: 346 + 40 / 60,
    qualities: ['Cosmic empathy', 'Deep meditation', 'Spiritual depth', 'Selfless compassion'],
  },
  {
    name: 'Revati',
    rulingPlanet: 'Mercury',
    deity: 'Pushan (God of Nourishment)',
    symbol: 'Fish / Drum',
    startDegree: 346 + 40 / 60,
    endDegree: 360,
    qualities: ['Safe journeying', 'Nourishing protection', 'Creative abundance', 'Transcendent love'],
  },
];

/**
 * Approximate the Moon's ecliptic longitude for a given date.
 * Uses simplified lunar position calculation from mean orbital elements.
 * Reference epoch: J2000.0 (January 1, 2000, 12:00 TT).
 */
function approximateMoonLongitude(date: Date): number {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);

  const meanLongitude = 218.3165 + 13.176358 * daysSinceJ2000;
  const meanAnomaly = (134.963 + 13.064993 * daysSinceJ2000) * (Math.PI / 180);
  const meanElongation = (297.8502 + 12.190749 * daysSinceJ2000) * (Math.PI / 180);
  const argLatitude = (93.272 + 13.229350 * daysSinceJ2000) * (Math.PI / 180);
  const sunMeanAnomaly = (357.5291 + 0.985600 * daysSinceJ2000) * (Math.PI / 180);

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
 * Convert tropical longitude to sidereal using the dynamic Lahiri ayanamsa.
 */
function tropicalToSidereal(tropicalDegree: number, date: Date): number {
  let sidereal = tropicalDegree - getLahiriAyanamsa(date);
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

/**
 * Calculate the Nakshatra and pada (quarter) for a given birth date.
 *
 * Each Nakshatra spans 13°20' (13.3333 degrees) of the sidereal zodiac.
 * Each pada spans 3°20' (3.3333 degrees), dividing each Nakshatra into 4 quarters.
 */
export function getNakshatra(date: Date): { nakshatra: Nakshatra; pada: number } {
  const tropicalLongitude = approximateMoonLongitude(date);
  const siderealLongitude = tropicalToSidereal(tropicalLongitude, date);

  const nakshatraIndex = Math.floor(siderealLongitude / NAKSHATRA_SPAN) % 27;
  const positionInNakshatra = siderealLongitude - nakshatraIndex * NAKSHATRA_SPAN;
  const padaSpan = NAKSHATRA_SPAN / 4;
  const pada = Math.min(Math.floor(positionInNakshatra / padaSpan) + 1, 4);

  return {
    nakshatra: NAKSHATRA_DATA[nakshatraIndex].name,
    pada,
  };
}
