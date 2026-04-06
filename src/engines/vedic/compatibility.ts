import { Rashi, Nakshatra } from '../../types/astrology';

/**
 * Vedic Compatibility (Kundali Milan / Ashtakoot)
 *
 * Simplified Ashtakoot system scores compatibility across 8 factors (Koots),
 * each contributing points to a maximum of 36. Higher scores indicate
 * stronger natural harmony.
 *
 * All results are framed positively - lower scores indicate "growth partnerships"
 * where both individuals help each other evolve.
 *
 * Reference: Brihat Parashara Hora Shastra, Chapter on Marriage Compatibility
 */

const RASHI_LIST: Rashi[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

/** Nadi groups (each Nakshatra falls into one of 3 Nadi categories) */
const NADI_GROUPS: Record<string, number> = {
  Ashwini: 0, Bharani: 1, Krittika: 2, Rohini: 0, Mrigashira: 1, Ardra: 2,
  Punarvasu: 0, Pushya: 1, Ashlesha: 2, Magha: 0, 'Purva Phalguni': 1,
  'Uttara Phalguni': 2, Hasta: 0, Chitra: 1, Swati: 2, Vishakha: 0,
  Anuradha: 1, Jyeshtha: 2, Mula: 0, 'Purva Ashadha': 1, 'Uttara Ashadha': 2,
  Shravana: 0, Dhanishta: 1, Shatabhisha: 2, 'Purva Bhadrapada': 0,
  'Uttara Bhadrapada': 1, Revati: 2,
};

/** Gana (temperament) groups */
const GANA_GROUPS: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
  Ashwini: 'Deva', Bharani: 'Manushya', Krittika: 'Rakshasa',
  Rohini: 'Manushya', Mrigashira: 'Deva', Ardra: 'Manushya',
  Punarvasu: 'Deva', Pushya: 'Deva', Ashlesha: 'Rakshasa',
  Magha: 'Rakshasa', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya',
  Hasta: 'Deva', Chitra: 'Rakshasa', Swati: 'Deva', Vishakha: 'Rakshasa',
  Anuradha: 'Deva', Jyeshtha: 'Rakshasa', Mula: 'Rakshasa',
  'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya', Shravana: 'Deva',
  Dhanishta: 'Rakshasa', Shatabhisha: 'Rakshasa',
  'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya', Revati: 'Deva',
};

function getRashiIndex(rashi: Rashi): number {
  return RASHI_LIST.indexOf(rashi);
}

/**
 * Calculate Vedic compatibility score (out of 36 points).
 * Uses simplified Ashtakoot matching.
 */
export function getVedicCompatibility(
  rashi1: Rashi,
  nakshatra1: Nakshatra,
  rashi2: Rashi,
  nakshatra2: Nakshatra,
): { score: number; maxScore: number; details: string } {
  let totalScore = 0;

  // 1. Nadi Koot (8 points) - Different Nadi = 8 points
  const nadi1 = NADI_GROUPS[nakshatra1] ?? 0;
  const nadi2 = NADI_GROUPS[nakshatra2] ?? 0;
  totalScore += nadi1 !== nadi2 ? 8 : 0;

  // 2. Bhakoot (7 points) - Rashi compatibility
  const diff = Math.abs(getRashiIndex(rashi1) - getRashiIndex(rashi2));
  const bhakootGood = [1, 3, 4, 5, 7, 9, 10, 11].includes(diff);
  totalScore += bhakootGood ? 7 : 0;

  // 3. Gana (6 points) - Temperament match
  const gana1 = GANA_GROUPS[nakshatra1] ?? 'Manushya';
  const gana2 = GANA_GROUPS[nakshatra2] ?? 'Manushya';
  if (gana1 === gana2) totalScore += 6;
  else if (
    (gana1 === 'Deva' && gana2 === 'Manushya') ||
    (gana1 === 'Manushya' && gana2 === 'Deva')
  ) totalScore += 5;
  else totalScore += 1;

  // 4. Simplified remaining koots (Varna 1, Vasya 2, Tara 3, Yoni 4, Maitri 5 = 15 pts)
  // Use a deterministic but varied score based on rashi/nakshatra positions
  const combinedIndex = (getRashiIndex(rashi1) + getRashiIndex(rashi2)) % 15;
  const remainingScore = Math.max(6, Math.min(14, combinedIndex + 3));
  totalScore += remainingScore;

  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let details: string;
  if (percentage >= 75) {
    details = 'A beautifully harmonious connection! Your cosmic energies naturally complement each other, creating a bond that flows effortlessly.';
  } else if (percentage >= 55) {
    details = 'A wonderfully balanced partnership! You bring different strengths that create a dynamic and enriching connection.';
  } else if (percentage >= 35) {
    details = 'A relationship rich with growth potential! You are cosmic teachers for each other, helping one another evolve and expand.';
  } else {
    details = 'A transformative soul connection! Your differences are your greatest gifts - together you push each other toward your highest potential.';
  }

  return { score: totalScore, maxScore, details };
}
