import { Rashi, Nakshatra, VedicProfile, DashaPeriod, PlanetPosition, WesternSign } from '../../types/astrology';
import { getRashi, RASHI_DATA } from './rashi';
import { getNakshatra } from './nakshatra';
import { calculateDashas, getCurrentDasha } from './dasha';
import { getRemedies } from './remedies';

export { getRashi, RASHI_DATA } from './rashi';
export { getNakshatra, NAKSHATRA_DATA } from './nakshatra';
export { calculateDashas, getCurrentDasha } from './dasha';
export { getRemedies } from './remedies';

const SIGNS: WesternSign[] = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

/**
 * Compute the Lahiri ayanamsa for a given date.
 */
function getLahiriAyanamsa(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const yearsSinceJ2000 = (date.getTime() - J2000_MS) / (365.25 * 86_400_000);
  return 23.85319 + 0.013970 * yearsSinceJ2000;
}

/**
 * Convert Western (tropical) planet positions to Vedic (sidereal) positions
 * by subtracting the Lahiri ayanamsa.
 */
export function toSiderealPositions(tropicalPlanets: PlanetPosition[], date: Date): PlanetPosition[] {
  const ayanamsa = getLahiriAyanamsa(date);
  return tropicalPlanets.map(p => {
    const tropLon = SIGNS.indexOf(p.sign) * 30 + p.degree;
    let sidLon = tropLon - ayanamsa;
    if (sidLon < 0) sidLon += 360;
    const signIdx = Math.floor(sidLon / 30) % 12;
    const deg = Math.round((sidLon % 30) * 100) / 100;
    return {
      ...p,
      sign: SIGNS[signIdx],
      degree: deg,
    };
  });
}

/**
 * Calculate a complete Vedic astrology profile from birth date.
 *
 * The Vedic system uses the sidereal zodiac (offset ~24° from tropical/Western).
 * Moon sign (Rashi) is primary, Nakshatra provides deeper personality/timing insights,
 * and the Vimshottari Dasha system provides life-timing predictions.
 *
 * Reference: Brihat Parashara Hora Shastra
 */
export function calculateVedicProfile(birthDate: Date, birthTime?: string): VedicProfile {
  const rashi = getRashi(birthDate, birthTime);
  const { nakshatra, pada } = getNakshatra(birthDate, birthTime);
  const dashas = calculateDashas(birthDate, nakshatra, pada);
  const currentDasha = getCurrentDasha(dashas, new Date());
  const remedies = getRemedies(rashi, nakshatra, currentDasha);

  return {
    rashi,
    nakshatra,
    nakshatraPada: pada,
    moonSign: rashi,
    dashas,
    currentDasha,
    remedies,
  };
}
