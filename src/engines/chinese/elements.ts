import { ChineseElement } from '../../types/astrology';

/**
 * The Generative (Sheng) Cycle — elements that naturally nourish one another:
 * Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal,
 * Metal collects Water (condensation), Water nourishes Wood.
 */
const GENERATIVE_CYCLE: Record<ChineseElement, ChineseElement> = {
  Wood: 'Fire',
  Fire: 'Earth',
  Earth: 'Metal',
  Metal: 'Water',
  Water: 'Wood',
};

/**
 * The Overcoming (Ke) Cycle — elements that challenge each other toward growth:
 * Wood parts Earth, Earth absorbs Water, Water tempers Fire,
 * Fire melts Metal, Metal cuts Wood.
 */
const OVERCOMING_CYCLE: Record<ChineseElement, ChineseElement> = {
  Wood: 'Earth',
  Earth: 'Water',
  Water: 'Fire',
  Fire: 'Metal',
  Metal: 'Wood',
};

/**
 * Calculate compatibility between two Chinese elements.
 * Returns a score (0–100) and a positive description of the dynamic.
 */
export function getElementCompatibility(
  e1: ChineseElement,
  e2: ChineseElement,
): { score: number; description: string } {
  // Same element — deep mutual understanding
  if (e1 === e2) {
    return {
      score: 85,
      description:
        `Two ${e1} energies together share a profound mutual understanding. ` +
        `You naturally resonate with each other's rhythms and values, creating a ` +
        `relationship built on effortless harmony and shared vision.`,
    };
  }

  // Generative cycle: e1 generates e2
  if (GENERATIVE_CYCLE[e1] === e2) {
    return {
      score: 95,
      description:
        `${e1} naturally nourishes ${e2} in the generative cycle. ` +
        `This is a beautifully supportive pairing where ${e1} provides the ` +
        `foundation for ${e2} to flourish. Together you create an uplifting ` +
        `flow of creative energy.`,
    };
  }

  // Generative cycle: e2 generates e1
  if (GENERATIVE_CYCLE[e2] === e1) {
    return {
      score: 92,
      description:
        `${e2} naturally nourishes ${e1} in the generative cycle. ` +
        `You receive wonderful supportive energy from this connection, ` +
        `helping you grow and express your gifts more fully.`,
    };
  }

  // Overcoming cycle: e1 overcomes e2
  if (OVERCOMING_CYCLE[e1] === e2) {
    return {
      score: 70,
      description:
        `${e1} and ${e2} share a dynamic of growth and transformation. ` +
        `${e1} brings constructive challenge that inspires ${e2} to evolve. ` +
        `This pairing is a catalyst for personal development — like a ` +
        `skilled mentor guiding you toward your highest potential.`,
    };
  }

  // Overcoming cycle: e2 overcomes e1
  if (OVERCOMING_CYCLE[e2] === e1) {
    return {
      score: 68,
      description:
        `${e2} and ${e1} share a transformative dynamic. ` +
        `${e2} offers constructive challenges that help ${e1} discover ` +
        `hidden strengths. This connection is a powerful teacher, ` +
        `encouraging resilience and inspiring breakthroughs.`,
    };
  }

  // Default: no direct cycle relationship (shouldn't happen with 5 elements, but just in case)
  return {
    score: 75,
    description:
      `${e1} and ${e2} bring complementary energies to the relationship. ` +
      `While each element dances to its own rhythm, together they create ` +
      `a beautifully balanced dynamic full of new perspectives.`,
  };
}
