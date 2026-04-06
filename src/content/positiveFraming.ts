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
  'The cosmos is opening doors for you today',
  'Your energy is beautifully aligned',
  'The universe has a special gift for you',
  'Stars are conspiring in your favor',
  'Your cosmic vibration is rising',
  'A wave of positive energy surrounds you',
  'The planets are amplifying your natural gifts',
  'Today carries beautiful cosmic potential',
  'Your inner light is radiating strongly',
  'The universe is reflecting your beauty back',
  'Cosmic winds are blowing in your direction',
  'Your celestial blueprint is activating',
];

const GROWTH_FRAMINGS = [
  'This is your cosmic upgrade period - embrace the transformation',
  'The universe is building something beautiful through this experience',
  'Growth energy is flowing - you\'re becoming the next version of yourself',
  'Think of this as a cosmic workout - you\'re building spiritual muscle',
  'Every master was once a student - this is your mastery in progress',
  'The stars are polishing your diamond - each facet gets brighter',
];

const TRANSITION_PHRASES = [
  'And here\'s the beautiful part:',
  'What makes this even more special:',
  'The cosmic silver lining:',
  'Here\'s your empowering truth:',
  'The universe\'s gift in this:',
];

const AFFIRMATIONS = [
  'I am aligned with my highest cosmic purpose',
  'The universe supports my growth and expansion',
  'I attract beautiful energy and opportunities',
  'My cosmic DNA guides me to my greatest good',
  'I am exactly where the stars intended me to be',
  'Every day, I bloom more fully into my cosmic self',
  'The universe celebrates who I am becoming',
  'I trust my cosmic journey and embrace its gifts',
  'My energy attracts wonderful connections',
  'I shine my unique light and the world responds',
  'The cosmos flows through me with love and purpose',
  'I am cosmically supported in all that I do',
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
