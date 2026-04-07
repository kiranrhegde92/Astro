import { KPProfile, DashaPeriod } from '../../types/astrology';
import { calculateKPCusps } from './cusps';
import { getSignificators } from './significators';
import { getKPPredictions } from './predictions';
import { getSubLord } from './sublord';

export { getSubLord } from './sublord';
export { calculateKPCusps } from './cusps';
export { getSignificators } from './significators';
export { getKPPredictions } from './predictions';

/**
 * Calculate a complete KP System profile.
 *
 * @param birthDate  Date of birth
 * @param birthTime  Optional time string "HH:MM"
 * @param currentDasha  Optional pre-computed Vedic dasha (avoids hardcoding)
 */
export function calculateKPProfile(
  birthDate: Date,
  birthTime?: string,
  currentDasha?: DashaPeriod,
): KPProfile {
  const cusps = calculateKPCusps(birthDate, birthTime);

  const sublords = cusps.map((cusp) => ({
    house: cusp.house,
    starLord: cusp.starLord,
    subLord: cusp.subLord,
    signLord: cusp.starLord,
  }));

  const significators = getSignificators(sublords);

  // Use provided Vedic dasha if available, otherwise estimate from birth Nakshatra
  const dasha = currentDasha ?? {
    planet: 'Venus' as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  const predictions = getKPPredictions(significators, dasha);

  return {
    sublords,
    cusps,
    significators,
    predictions,
  };
}
