import { DashaPlanet, DashaPeriod, Significator, EventPrediction } from '../../types/astrology';
import { HOUSE_MEANINGS } from './significators';

/**
 * KP Prediction Engine
 *
 * Generates positively-framed life predictions based on KP significators
 * and the current Vimshottari Dasha period. In the KP system, the sub-lord
 * is the deciding factor for whether a house's promise will manifest.
 *
 * All predictions emphasize empowerment, growth, and opportunity.
 *
 * Reference: "Krishnamurti Paddhati Reader" by K.S. Krishnamurti
 */

const SOURCE = 'Krishnamurti Paddhati Reader';

/**
 * Mapping from life areas to the primary houses that govern them.
 */
const AREA_HOUSES: Record<EventPrediction['area'], number[]> = {
  career: [10, 6, 2],
  love: [7, 5, 11],
  health: [1, 6, 8],
  wealth: [2, 11, 5],
  education: [4, 5, 9],
  travel: [3, 9, 12],
};

/**
 * Positive prediction templates for each life area.
 * Each template can be customized with planet and timing details.
 */
const PREDICTION_TEMPLATES: Record<EventPrediction['area'], string[]> = {
  career: [
    'Your professional path is illuminated by powerful cosmic support. {planet} as a strong significator of your career houses brings fresh opportunities for recognition and advancement. Trust your instincts — your skills are about to be noticed by the right people.',
    'A period of meaningful professional growth is unfolding. The influence of {planet} on your career sector suggests new responsibilities that align beautifully with your talents. This is an excellent time to take initiative on projects close to your heart.',
    'The cosmic currents favor bold career moves. With {planet} activating your houses of achievement, doors are opening that may have seemed closed before. Your dedication is creating a foundation for lasting success.',
  ],
  love: [
    'Your heart space is glowing with warmth and possibility. {planet} energizes your relationship houses, inviting deeper connections and heartfelt communication. Whether single or partnered, love is expanding in beautiful ways.',
    'Romantic and relational energies are flowing beautifully in your favor. {planet} highlights your partnership sector, bringing opportunities for meaningful connection, mutual understanding, and joyful togetherness.',
    'The universe is conspiring to bring more love into your life. With {planet} influencing your houses of romance and partnership, expect moments of genuine warmth, surprising kindness, and deeper emotional bonds.',
  ],
  health: [
    'Your vitality is supported by a harmonious cosmic alignment. {planet} strengthens your houses of wellness, encouraging you to invest in self-care routines that nourish both body and spirit. Listen to your body — it has wisdom to share.',
    'A wonderful period for establishing healthy habits and feeling your best. {planet} activates your wellness sector, bringing renewed energy and motivation to prioritize your well-being. Small consistent steps will yield remarkable results.',
    'The stars encourage a holistic approach to your health. With {planet} influencing your vitality houses, this is an ideal time to explore new wellness practices, strengthen your routines, and celebrate the incredible vessel that carries your spirit.',
  ],
  wealth: [
    'Financial abundance is flowing toward you. {planet} activates your wealth houses, signaling opportunities for increased income, wise investments, and unexpected gains. Your relationship with prosperity is evolving in a positive direction.',
    'The cosmic blueprint supports financial growth and stability. With {planet} influencing your houses of wealth and gains, your efforts are poised to bear fruit. Trust your financial intuition — it is sharper than usual.',
    'A prosperous period is taking shape. {planet} energizes your financial sector, bringing opportunities to grow your resources through both traditional channels and creative ventures. Abundance follows where gratitude leads.',
  ],
  education: [
    'Your capacity for learning and intellectual growth is amplified. {planet} illuminates your houses of knowledge, making this an exceptional time for studies, certifications, or exploring a subject that fascinates you.',
    'The stars are aligned for educational breakthroughs. With {planet} activating your wisdom houses, complex ideas become clearer and your ability to absorb new information is remarkably enhanced. Feed your curiosity generously.',
    'A period of accelerated learning and insight is upon you. {planet} supports your houses of education and higher knowledge, creating ideal conditions for academic achievement, skill development, and intellectual exploration.',
  ],
  travel: [
    'The world is calling you forward. {planet} activates your travel houses, suggesting rewarding journeys — whether physical trips or inner explorations. Movement and change bring fresh inspiration and valuable connections.',
    'Exciting travel opportunities are on the horizon. With {planet} energizing your houses of journeys and exploration, this is a wonderful time to plan adventures, visit new places, or reconnect with distant loved ones.',
    'The cosmos encourages expansion through movement and exploration. {planet} highlights your travel sector, indicating that journeys taken during this period — near or far — will bring meaningful experiences and broadened perspectives.',
  ],
};

/**
 * Timing descriptions based on the Dasha planet's nature.
 */
const TIMING_GUIDANCE: Record<DashaPlanet, string> = {
  Ketu: 'Events may manifest swiftly and with spiritual significance during this period. Stay present and trust sudden insights.',
  Venus: 'This is a graceful period where outcomes unfold through beauty, relationships, and creative expression. Allow things to blossom naturally.',
  Sun: 'Results come through confident action and leadership. Step into your authority — this is your time to shine.',
  Moon: 'Timing aligns with emotional readiness and intuitive nudges. Trust your feelings as a compass for decisions.',
  Mars: 'Expect dynamic, action-oriented developments. Your courage and decisiveness accelerate positive outcomes.',
  Rahu: 'Unconventional paths and surprising opportunities define this period. Be open to innovation and unexpected blessings.',
  Jupiter: 'Expansion and wisdom guide the timing. Generous, optimistic actions attract abundant rewards during this period.',
  Saturn: 'Patience and steady effort are your greatest allies. Rewards come through disciplined commitment — and they are lasting.',
  Mercury: 'Communication and intellectual agility drive outcomes. Stay curious, network actively, and express your ideas clearly.',
};

/**
 * Generate positively-framed KP predictions based on significators and current Dasha.
 *
 * For each life area, the engine identifies which significators are relevant,
 * selects an appropriate prediction template, and adds timing guidance based
 * on the current Dasha planet.
 *
 * @param significators - The calculated significators for the chart.
 * @param currentDasha - The currently active Vimshottari Dasha period.
 * @returns Array of EventPrediction objects, one per life area.
 */
export function getKPPredictions(
  significators: Significator[],
  currentDasha: DashaPeriod,
): EventPrediction[] {
  const predictions: EventPrediction[] = [];
  const dashaPlanet = currentDasha.planet;

  const areas: EventPrediction['area'][] = ['career', 'love', 'health', 'wealth', 'education', 'travel'];

  for (const area of areas) {
    const relevantHouses = AREA_HOUSES[area];

    // Find the strongest significator for this area's houses
    const relevantSigs = significators.filter((sig) =>
      sig.houses.some((h) => relevantHouses.includes(h)),
    );

    // Sort by strength: strong > moderate > weak
    const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
    relevantSigs.sort((a, b) => strengthOrder[b.strength] - strengthOrder[a.strength]);

    // Use the strongest significator, or fall back to the Dasha planet
    const primaryPlanet = relevantSigs.length > 0 ? relevantSigs[0].planet : dashaPlanet;
    const strength = relevantSigs.length > 0 ? relevantSigs[0].strength : 'moderate';

    // Calculate confidence based on significator strength and relevance
    let confidence: number;
    if (relevantSigs.length === 0) {
      confidence = 0.5;
    } else if (strength === 'strong') {
      confidence = relevantSigs.length >= 2 ? 0.9 : 0.8;
    } else if (strength === 'moderate') {
      confidence = relevantSigs.length >= 2 ? 0.75 : 0.65;
    } else {
      confidence = 0.55;
    }

    // Select a prediction template (vary based on significator count for diversity)
    const templates = PREDICTION_TEMPLATES[area];
    const templateIndex = relevantSigs.length % templates.length;
    const template = templates[templateIndex];

    // Build the prediction text
    const predictionText = template.replace('{planet}', primaryPlanet);

    // Build timing guidance
    const dashaEnd = currentDasha.endDate;
    const timingText =
      `${TIMING_GUIDANCE[dashaPlanet]} ` +
      `This influence is active through your ${dashaPlanet} Dasha period ` +
      `(until ${dashaEnd.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}).`;

    // Add relevant house meanings as context
    const houseContext = relevantHouses
      .map((h) => HOUSE_MEANINGS[h])
      .filter(Boolean)
      .map((m) => m!.area)
      .join(', ');

    predictions.push({
      area,
      prediction: `${predictionText} (Houses of ${houseContext})`,
      timing: timingText,
      confidence: Math.round(confidence * 100) / 100,
      source: SOURCE,
    });
  }

  return predictions;
}
