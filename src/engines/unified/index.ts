import { CosmicProfile } from '../../types/astrology';
import { calculateWesternProfile } from '../western';
import { calculateVedicProfile } from '../vedic';
import { calculateChineseProfile } from '../chinese';
import { calculateKPProfile } from '../kp';

/**
 * Calculate a unified Cosmic Profile across all 4 astrology systems.
 *
 * This is the core differentiator of CosmicSelf - no other app combines
 * Western, Vedic, Chinese, and KP systems into a single cosmic identity.
 */
export function calculateCosmicProfile(
  birthDate: Date,
  birthTime?: string,
  lat?: number,
  lng?: number,
): CosmicProfile {
  return {
    western: calculateWesternProfile(birthDate, birthTime, lat, lng),
    vedic: calculateVedicProfile(birthDate),
    chinese: calculateChineseProfile(birthDate, birthTime),
    kp: calculateKPProfile(birthDate, birthTime),
  };
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
