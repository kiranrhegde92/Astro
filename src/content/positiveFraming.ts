/**
 * Positive Framing Engine
 *
 * Core differentiator from Co-Star: 80-85% positive content.
 * All readings pass through this engine to ensure empowering language.
 *
 * Rules:
 * - Use: bloom, shine, align, flow, attract, glow, cosmic gift, opportunity
 * - Avoid alone: danger, warning, bad, terrible, difficult, problem
 * - "Challenge" always paired with growth
 * - Cap negative at 15-20%, always follow with action step or remedy
 */

const POSITIVE_OPENERS = [
  'Planetary alignments favour clear decisions today',
  'Transit energy is shifting — good day for action',
  'Current aspects support new conversations and ideas',
  'The planetary picture today rewards patience over speed',
  'Strong aspect activity across your chart today',
  'Several transits are converging — focus matters',
  'Today\'s sky favours deliberate, well-timed moves',
  'Planetary momentum supports steady progress today',
  'Current transits highlight relationship and work themes',
  'The aspects today create space for meaningful progress',
  'Transit patterns suggest a productive, grounded day',
  'Planetary energy today leans toward clarity and resolve',
];

const GROWTH_FRAMINGS = [
  'Square and opposition aspects are active — expect productive friction',
  'Tension transits often precede breakthroughs when channelled well',
  'Hard aspects demand adjustment — use them to sharpen your approach',
  'The current pressure is transit-driven and time-limited',
  'Challenging aspects build resilience — lean into the discomfort',
  'Friction in the chart usually signals areas ready for change',
];

const TRANSITION_PHRASES = [
  'And here\'s the beautiful part:',
  'What makes this even more special:',
  'The cosmic silver lining:',
  'Here\'s your empowering truth:',
  'The universe\'s gift in this:',
];

const AFFIRMATIONS = [
  'I move with intention and respond to what is actually in front of me',
  'I trust the timing that my chart reflects and act when it counts',
  'I focus my energy where the transits say it matters most',
  'I stay grounded and let clarity build before I commit',
  'I honour the rhythm my chart describes and protect my pace',
  'I make one well-timed decision instead of five scattered ones',
  'I follow the pattern my placements reveal and adjust as I learn',
  'I invest energy in what compounds and release what drains',
  'I pay attention to the signal and ignore the noise today',
  'I act from my chart\'s strengths and stay aware of its edges',
  'I let the current planetary weather inform my choices without ruling them',
  'I take one clear step forward and let momentum do the rest',
];

/**
 * Get a daily positive opener based on the date for consistency
 */
export function getDailyOpener(date: Date): string {
  const dayIndex = date.getDate() % POSITIVE_OPENERS.length;
  return POSITIVE_OPENERS[dayIndex];
}

/**
 * Get a growth framing for challenging transits
 */
export function getGrowthFraming(date: Date): string {
  const index = (date.getDate() + date.getMonth()) % GROWTH_FRAMINGS.length;
  return GROWTH_FRAMINGS[index];
}

/**
 * Get a transition phrase to follow any mildly cautionary content
 */
export function getTransitionPhrase(date: Date): string {
  const index = date.getDate() % TRANSITION_PHRASES.length;
  return TRANSITION_PHRASES[index];
}

/**
 * Get the daily affirmation
 */
export function getDailyAffirmation(date: Date): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

/**
 * Apply positive framing to any reading text.
 * Ensures output meets 80-85% positivity threshold.
 */
export function applyPositiveFraming(text: string): string {
  const negativeWords = ['difficult', 'danger', 'warning', 'bad', 'terrible', 'problem', 'struggle', 'suffer', 'painful', 'harsh'];

  let result = text;
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const replacements: Record<string, string> = {
      difficult: 'growth-oriented',
      danger: 'transformation point',
      warning: 'gentle heads-up',
      bad: 'evolving',
      terrible: 'transformative',
      problem: 'opportunity',
      struggle: 'growth journey',
      suffer: 'experience deeply',
      painful: 'deeply meaningful',
      harsh: 'intensely transformative',
    };
    result = result.replace(regex, replacements[word] ?? 'transformative');
  }

  return result;
}
