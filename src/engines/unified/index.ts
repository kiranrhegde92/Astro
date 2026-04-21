import { CosmicProfile } from '../../types/astrology';
import { calculateWesternProfile } from '../western';
import { calculateVedicProfile } from '../vedic';
import { calculateChineseProfile } from '../chinese';
import { calculateKPProfile } from '../kp';

/**
 * Calculate a unified Cosmic Profile across all 4 astrology systems.
 *
 * Now passes the computed Vedic dasha to the KP engine so KP predictions
 * use the actual birth-chart dasha instead of a hardcoded default.
 */
export function calculateCosmicProfile(
  birthDate: Date,
  birthTime?: string,
  lat?: number,
  lng?: number,
): CosmicProfile {
  const western = calculateWesternProfile(birthDate, birthTime, lat, lng);
  const vedic = calculateVedicProfile(birthDate, birthTime);
  const chinese = calculateChineseProfile(birthDate, birthTime);
  // Pass the Vedic currentDasha to KP so predictions use the real dasha planet
  const kp = calculateKPProfile(birthDate, birthTime, vedic.currentDasha);

  return { western, vedic, chinese, kp };
}

/**
 * Generate a shareable "Cosmic DNA" summary string.
 */
export function getCosmicDNASummary(profile: CosmicProfile): string {
  const parts = [
    `${profile.western.sun} Sun`,
    `${profile.vedic.rashi} Rashi`,
    `${profile.chinese.element} ${profile.chinese.animal}`,
  ];
  return parts.join(' + ');
}
