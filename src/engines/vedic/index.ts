import { Rashi, Nakshatra, VedicProfile, DashaPeriod } from '../../types/astrology';
import { getRashi, RASHI_DATA } from './rashi';
import { getNakshatra } from './nakshatra';
import { calculateDashas, getCurrentDasha } from './dasha';
import { getRemedies } from './remedies';

export { getRashi, RASHI_DATA } from './rashi';
export { getNakshatra, NAKSHATRA_DATA } from './nakshatra';
export { calculateDashas, getCurrentDasha } from './dasha';
export { getRemedies } from './remedies';

/**
 * Calculate a complete Vedic astrology profile from birth date.
 *
 * The Vedic system uses the sidereal zodiac (offset ~23.5° from tropical/Western).
 * Moon sign (Rashi) is primary, Nakshatra provides deeper personality/timing insights,
 * and the Vimshottari Dasha system provides life-timing predictions.
 *
 * Reference: Brihat Parashara Hora Shastra
 */
export function calculateVedicProfile(birthDate: Date): VedicProfile {
  const rashi = getRashi(birthDate);
  const { nakshatra, pada } = getNakshatra(birthDate);
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
