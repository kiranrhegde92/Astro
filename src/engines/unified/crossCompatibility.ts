import { CompatibilityResult, CosmicProfile } from '../../types/astrology';
import { getVedicCompatibility } from '../vedic/compatibility';
import { getChineseCompatibility } from '../chinese/compatibility';

/**
 * Calculate cross-system compatibility between two Cosmic Profiles.
 *
 * Combines scores from Western, Vedic, Chinese, and KP systems
 * into a unified compatibility result. All framing is positive.
 */
export function calculateCrossCompatibility(
  profile1: CosmicProfile,
  profile2: CosmicProfile,
): CompatibilityResult {
  // Western compatibility (element-based)
  const westernScore = calculateWesternCompat(
    profile1.western.element,
    profile2.western.element,
    profile1.western.sun,
    profile2.western.sun,
  );

  // Vedic compatibility (Ashtakoot)
  const vedic = getVedicCompatibility(
    profile1.vedic.rashi,
    profile1.vedic.nakshatra,
    profile2.vedic.rashi,
    profile2.vedic.nakshatra,
  );
  const vedicScore = Math.round((vedic.score / vedic.maxScore) * 100);

  // Chinese compatibility
  const chinese = getChineseCompatibility(
    profile1.chinese.animal,
    profile1.chinese.element,
    profile2.chinese.animal,
    profile2.chinese.element,
  );

  // Overall weighted average
  const overall = Math.round(
    westernScore.score * 0.3 + vedicScore * 0.35 + chinese.score * 0.35
  );

  const shareText = getShareText(overall, profile1, profile2);

  return {
    overall: Math.max(35, overall), // minimum 35% - everyone has some connection
    western: { score: westernScore.score, details: westernScore.details },
    vedic: { score: vedicScore, details: vedic.details },
    chinese: { score: chinese.score, details: chinese.details },
    shareText,
    references: [
      { source: 'Ptolemy\'s Tetrabiblos', type: 'book', tradition: 'western' },
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'San He Classical Texts', type: 'tradition', tradition: 'chinese' },
    ],
  };
}

function calculateWesternCompat(
  element1: string,
  element2: string,
  sign1: string,
  sign2: string,
): { score: number; details: string } {
  const ELEMENT_COMPAT: Record<string, string[]> = {
    Fire: ['Fire', 'Air'],
    Earth: ['Earth', 'Water'],
    Air: ['Air', 'Fire'],
    Water: ['Water', 'Earth'],
  };

  const isCompatible = ELEMENT_COMPAT[element1]?.includes(element2) ?? false;
  const isSameElement = element1 === element2;

  let score: number;
  let details: string;

  if (isSameElement) {
    score = 85;
    details = `Both ${element1} signs! You share a natural understanding and speak the same cosmic language.`;
  } else if (isCompatible) {
    score = 75;
    details = `${element1} and ${element2} create a beautiful harmony - your energies naturally complement and uplift each other.`;
  } else {
    score = 55;
    details = `${element1} meets ${element2} - a dynamic pairing that brings balance! You each offer what the other needs to grow.`;
  }

  return { score, details };
}

function getShareText(overall: number, p1: CosmicProfile, p2: CosmicProfile): string {
  if (overall >= 80) {
    return `Cosmic soulmates! ${p1.western.sun} + ${p2.western.sun} = ${overall}% cosmic match across 3 ancient systems`;
  } else if (overall >= 60) {
    return `Beautiful cosmic connection! ${p1.western.sun} + ${p2.western.sun} = ${overall}% match - the stars are smiling`;
  } else {
    return `Cosmic growth partners! ${p1.western.sun} + ${p2.western.sun} = ${overall}% - together you unlock new dimensions`;
  }
}
