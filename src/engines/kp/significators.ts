import { DashaPlanet, SubLord, Significator } from '../../types/astrology';

/**
 * KP Significator Determination
 *
 * In the Krishnamurti Paddhati system, a planet becomes a significator of a house
 * based on its relationship to the sub-lord positions. The sub-lord of a house cusp
 * determines which planets are effective significators for that house's matters.
 *
 * Significator strength hierarchy:
 * 1. Strong — Planet is the sub-lord of the house cusp itself
 * 2. Moderate — Planet is the star lord of the house cusp
 * 3. Weak — Planet is the sign lord connected to the house
 *
 * Reference: "Krishnamurti Paddhati Reader" by K.S. Krishnamurti
 */

/**
 * Determine which houses each planet signifies based on sub-lord positions.
 *
 * The sub-lord of each house cusp is the most important factor in KP.
 * A planet signifies a house when:
 * - It is the sub-lord of that house cusp (strong signification)
 * - It is the star lord of that house cusp (moderate signification)
 * - It is the sign lord associated with that house cusp (weak signification)
 *
 * @param sublords - Array of SubLord data for all 12 house cusps.
 * @returns Array of Significator entries, one per planet that has significations.
 */
export function getSignificators(sublords: SubLord[]): Significator[] {
  // Track which houses each planet signifies, and at what strength
  const planetMap: Record<DashaPlanet, { houses: Set<number>; bestStrength: number }> = {
    Ketu: { houses: new Set(), bestStrength: 0 },
    Venus: { houses: new Set(), bestStrength: 0 },
    Sun: { houses: new Set(), bestStrength: 0 },
    Moon: { houses: new Set(), bestStrength: 0 },
    Mars: { houses: new Set(), bestStrength: 0 },
    Rahu: { houses: new Set(), bestStrength: 0 },
    Jupiter: { houses: new Set(), bestStrength: 0 },
    Saturn: { houses: new Set(), bestStrength: 0 },
    Mercury: { houses: new Set(), bestStrength: 0 },
  };

  for (const sl of sublords) {
    const house = sl.house;

    // Sub-lord = strong signification (3)
    if (sl.subLord && planetMap[sl.subLord]) {
      planetMap[sl.subLord].houses.add(house);
      planetMap[sl.subLord].bestStrength = Math.max(planetMap[sl.subLord].bestStrength, 3);
    }

    // Star lord = moderate signification (2)
    if (sl.starLord && planetMap[sl.starLord]) {
      planetMap[sl.starLord].houses.add(house);
      planetMap[sl.starLord].bestStrength = Math.max(planetMap[sl.starLord].bestStrength, 2);
    }

    // Sign lord = weak signification (1)
    if (sl.signLord && planetMap[sl.signLord]) {
      planetMap[sl.signLord].houses.add(house);
      planetMap[sl.signLord].bestStrength = Math.max(planetMap[sl.signLord].bestStrength, 1);
    }
  }

  // Convert to Significator array, only including planets that signify at least one house
  const significators: Significator[] = [];
  const allPlanets: DashaPlanet[] = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  ];

  for (const planet of allPlanets) {
    const data = planetMap[planet];
    if (data.houses.size > 0) {
      const strength: 'strong' | 'moderate' | 'weak' =
        data.bestStrength >= 3 ? 'strong' :
        data.bestStrength >= 2 ? 'moderate' : 'weak';

      significators.push({
        planet,
        houses: Array.from(data.houses).sort((a, b) => a - b),
        strength,
      });
    }
  }

  return significators;
}

/**
 * Get the primary significators for a specific house.
 * Returns planets that signify the given house, sorted by strength (strongest first).
 */
export function getHouseSignificators(
  significators: Significator[],
  house: number,
): Significator[] {
  const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
  return significators
    .filter((sig) => sig.houses.includes(house))
    .sort((a, b) => strengthOrder[b.strength] - strengthOrder[a.strength]);
}

/**
 * House-to-life-area mapping used for generating meaningful predictions.
 */
export const HOUSE_MEANINGS: Record<number, { area: string; keywords: string[] }> = {
  1: { area: 'Self & Vitality', keywords: ['personality', 'health', 'new beginnings', 'self-expression'] },
  2: { area: 'Wealth & Family', keywords: ['finances', 'speech', 'family bonds', 'values'] },
  3: { area: 'Courage & Communication', keywords: ['siblings', 'short travel', 'skills', 'initiative'] },
  4: { area: 'Home & Emotional Foundation', keywords: ['property', 'mother', 'inner peace', 'education'] },
  5: { area: 'Creativity & Romance', keywords: ['children', 'romance', 'speculation', 'intelligence'] },
  6: { area: 'Service & Wellness', keywords: ['daily routine', 'healing', 'service', 'personal growth'] },
  7: { area: 'Partnership & Relationships', keywords: ['marriage', 'business partners', 'public dealings'] },
  8: { area: 'Transformation & Renewal', keywords: ['transformation', 'inheritance', 'research', 'depth'] },
  9: { area: 'Wisdom & Higher Learning', keywords: ['long travel', 'spirituality', 'fortune', 'mentor'] },
  10: { area: 'Career & Purpose', keywords: ['profession', 'reputation', 'achievement', 'authority'] },
  11: { area: 'Aspirations & Community', keywords: ['gains', 'friendships', 'wishes fulfilled', 'networks'] },
  12: { area: 'Spiritual Growth & Liberation', keywords: ['meditation', 'foreign lands', 'surrender', 'enlightenment'] },
};
