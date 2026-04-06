import { ChineseAnimal, ChineseElement } from '../../types/astrology';
import { getElementCompatibility } from './elements';

/**
 * Triangle of Affinity groups — animals that share deep natural harmony.
 * Each triangle represents a group of three animals with complementary energies.
 */
const AFFINITY_TRIANGLES: ChineseAnimal[][] = [
  ['Rat', 'Dragon', 'Monkey'],     // Ambitious innovators
  ['Ox', 'Snake', 'Rooster'],      // Thoughtful achievers
  ['Tiger', 'Horse', 'Dog'],       // Passionate idealists
  ['Rabbit', 'Goat', 'Pig'],       // Gentle peacemakers
];

/**
 * Traditional "Six Harmony" pairs — animals with a special bond of mutual support.
 */
const SIX_HARMONIES: [ChineseAnimal, ChineseAnimal][] = [
  ['Rat', 'Ox'],
  ['Tiger', 'Pig'],
  ['Rabbit', 'Dog'],
  ['Dragon', 'Rooster'],
  ['Snake', 'Monkey'],
  ['Horse', 'Goat'],
];

/**
 * Traditionally challenging pairings — framed as growth-oriented relationships
 * that push both partners toward deeper self-awareness and personal evolution.
 */
const GROWTH_PAIRS: [ChineseAnimal, ChineseAnimal][] = [
  ['Rat', 'Horse'],
  ['Ox', 'Goat'],
  ['Tiger', 'Monkey'],
  ['Rabbit', 'Rooster'],
  ['Dragon', 'Dog'],
  ['Snake', 'Pig'],
];

/**
 * Check if two animals are in the same affinity triangle.
 */
function areInAffinityTriangle(a1: ChineseAnimal, a2: ChineseAnimal): boolean {
  return AFFINITY_TRIANGLES.some(
    (triangle) => triangle.includes(a1) && triangle.includes(a2),
  );
}

/**
 * Check if two animals form a Six Harmony pair.
 */
function areSixHarmony(a1: ChineseAnimal, a2: ChineseAnimal): boolean {
  return SIX_HARMONIES.some(
    ([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1),
  );
}

/**
 * Check if two animals are a growth (traditionally "clash") pair.
 */
function areGrowthPair(a1: ChineseAnimal, a2: ChineseAnimal): boolean {
  return GROWTH_PAIRS.some(
    ([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1),
  );
}

/**
 * Calculate comprehensive Chinese astrology compatibility between two individuals.
 *
 * Factors considered:
 * - Triangle of Affinity (shared group of three)
 * - Six Harmonies (special bonded pairs)
 * - Growth pairs (traditionally challenging but reframed as catalysts)
 * - Same animal (kindred spirits)
 * - Element compatibility (generative vs. overcoming cycle)
 *
 * All results are framed positively — every pairing has gifts to offer.
 *
 * @returns An object with an overall score (0-100) and detailed description.
 */
export function getChineseCompatibility(
  animal1: ChineseAnimal,
  element1: ChineseElement,
  animal2: ChineseAnimal,
  element2: ChineseElement,
): { score: number; details: string } {
  let animalScore: number;
  let animalDetails: string;

  // --- Animal compatibility ---
  if (animal1 === animal2) {
    animalScore = 85;
    animalDetails =
      `Two ${animal1}s together share an intuitive understanding that runs deep. ` +
      `You mirror each other's strengths and naturally create a space of comfort ` +
      `and mutual respect. This kinship makes communication effortless and teamwork joyful.`;
  } else if (areSixHarmony(animal1, animal2)) {
    animalScore = 95;
    animalDetails =
      `${animal1} and ${animal2} form one of the Six Harmonies — a pairing blessed with ` +
      `natural magnetism and deep emotional resonance. You complement each other ` +
      `beautifully, each bringing exactly what the other needs to thrive. ` +
      `This is one of the most naturally supportive connections in Chinese astrology.`;
  } else if (areInAffinityTriangle(animal1, animal2)) {
    animalScore = 90;
    animalDetails =
      `${animal1} and ${animal2} belong to the same Triangle of Affinity — a group of ` +
      `kindred spirits who share core values and complementary talents. Together you ` +
      `form a powerhouse of creativity and mutual encouragement, inspiring each other ` +
      `to reach new heights.`;
  } else if (areGrowthPair(animal1, animal2)) {
    animalScore = 65;
    animalDetails =
      `${animal1} and ${animal2} are growth teachers for one another. While your energies ` +
      `may sometimes feel like opposite poles, this dynamic tension is a gift — it pushes ` +
      `both of you to develop qualities you might not cultivate on your own. Many of the ` +
      `most transformative and passionate relationships are born from this pairing. ` +
      `Embrace the adventure of growing together.`;
  } else {
    animalScore = 75;
    animalDetails =
      `${animal1} and ${animal2} bring a lovely blend of different perspectives to the ` +
      `relationship. Your unique strengths create a balanced partnership where both ` +
      `individuals can shine. With mutual appreciation, this connection offers a ` +
      `wonderful journey of discovery and shared happiness.`;
  }

  // --- Element compatibility ---
  const elementResult = getElementCompatibility(element1, element2);

  // --- Combined score: weighted average (animal 60%, element 40%) ---
  const combinedScore = Math.round(animalScore * 0.6 + elementResult.score * 0.4);

  const details =
    `${animalDetails}\n\n` +
    `Elemental Harmony: ${elementResult.description}\n\n` +
    `Overall, your combined cosmic blueprint scores ${combinedScore} out of 100. ` +
    `Remember, every connection holds unique gifts — the stars illuminate the path, ` +
    `but your love and intention shape the journey.`;

  return {
    score: combinedScore,
    details,
  };
}
