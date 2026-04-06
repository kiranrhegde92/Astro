import { KPProfile } from '../../types/astrology';
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
 * The KP (Krishnamurti Paddhati) system is based on the Vimshottari Dasha
 * system but adds precise sub-lord divisions for more accurate predictions.
 * The sub-lord is the deciding factor for whether a house's promise manifests.
 *
 * Reference: "Krishnamurti Paddhati Reader" by K.S. Krishnamurti
 */
export function calculateKPProfile(birthDate: Date, birthTime?: string): KPProfile {
  const cusps = calculateKPCusps(birthDate, birthTime);

  // Build sub-lords from cusps
  const sublords = cusps.map((cusp) => ({
    house: cusp.house,
    starLord: cusp.starLord,
    subLord: cusp.subLord,
    signLord: cusp.starLord, // simplified
  }));

  const significators = getSignificators(sublords);

  // Use a default current dasha for predictions
  const defaultDasha = {
    planet: 'Venus' as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  const predictions = getKPPredictions(significators, defaultDasha);

  return {
    sublords,
    cusps,
    significators,
    predictions,
  };
}
