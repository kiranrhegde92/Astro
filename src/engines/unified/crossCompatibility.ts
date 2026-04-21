import { CompatibilityResult, CosmicProfile, WesternSign } from '../../types/astrology';
import type { RelationshipMode } from '../../types/appData';
import { getVedicCompatibility } from '../vedic/compatibility';
import { getChineseCompatibility } from '../chinese/compatibility';
import { getCurrentTransits } from '../common/transits';
import { getMoonPhase } from '../../utils/moonPhase';
import { getDateKey } from '../../utils/dateUtils';

/**
 * Mode-aware weighting for compatibility dimensions.
 *
 * Romantic: emphasizes Vedic (emotional/karmic) and Western (element chemistry)
 * Friend: balanced across all systems
 * Work: emphasizes Chinese (element/timing) and Western (communication elements)
 * Family: emphasizes Vedic (karmic bonds) with gentle Chinese weighting
 */
const MODE_WEIGHTS: Record<RelationshipMode, { western: number; vedic: number; chinese: number }> = {
  romantic: { western: 0.30, vedic: 0.40, chinese: 0.30 },
  friend:   { western: 0.33, vedic: 0.34, chinese: 0.33 },
  work:     { western: 0.35, vedic: 0.25, chinese: 0.40 },
  family:   { western: 0.25, vedic: 0.45, chinese: 0.30 },
};

/**
 * Calculate cross-system compatibility between two Cosmic Profiles.
 *
 * Combines scores from Western, Vedic, Chinese, and KP systems
 * into a unified compatibility result. All framing is positive.
 * The optional `mode` parameter adjusts system weighting.
 */
export function calculateCrossCompatibility(
  profile1: CosmicProfile,
  profile2: CosmicProfile,
  mode: RelationshipMode = 'romantic',
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

  // Mode-aware weighted average
  const weights = MODE_WEIGHTS[mode];
  const overall = Math.round(
    westernScore.score * weights.western + vedicScore * weights.vedic + chinese.score * weights.chinese
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

const ELEMENT_OF_SIGN: Record<WesternSign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const ELEMENT_CHEMISTRY: Record<string, Record<string, number>> = {
  Fire: { Fire: 4, Air: 5, Earth: -3, Water: -4 },
  Earth: { Earth: 4, Water: 5, Fire: -4, Air: -3 },
  Air: { Air: 4, Fire: 5, Water: -3, Earth: -3 },
  Water: { Water: 4, Earth: 5, Fire: -4, Air: -3 },
};

const MODE_WEEKDAY_LIFT: Record<RelationshipMode, number[]> = {
  // Sun Mon Tue Wed Thu Fri Sat
  romantic: [2, -1,  0,  1,  3,  5,  3],
  friend:   [3,  0,  1,  2,  1,  3,  4],
  work:     [-2, 3,  4,  3,  2, -1, -2],
  family:   [4,  1,  0,  2,  1,  2,  3],
};

export interface CompatibilityDaySnapshot {
  dateKey: string;
  dayOfMonth: number;
  weekday: number;
  score: number;
  tone: 'peak' | 'bright' | 'steady' | 'tender' | 'low';
  note: string;
}

export interface CompatibilityForecast {
  baseScore: number;
  days: CompatibilityDaySnapshot[];
  peak: CompatibilityDaySnapshot;
  low: CompatibilityDaySnapshot;
  average: number;
}

function toneFor(score: number, base: number): CompatibilityDaySnapshot['tone'] {
  const delta = score - base;
  if (delta >= 6) return 'peak';
  if (delta >= 2) return 'bright';
  if (delta <= -6) return 'low';
  if (delta <= -2) return 'tender';
  return 'steady';
}

type NoteTone = CompatibilityDaySnapshot['tone'];

const MODE_NOTES: Record<RelationshipMode, Record<NoteTone, (moonEl: string, phase: string) => string>> = {
  romantic: {
    peak: (el, phase) => `${phase} in a ${el} Moon — date night energy, say the warm thing out loud.`,
    bright: (el) => `${el} Moon flows with you two — good day for affection without agenda.`,
    steady: () => `Steady chemistry — nothing to force, nothing to fix.`,
    tender: (el) => `${el} Moon runs quieter — small gestures land harder than big plans.`,
    low: (el) => `${el} Moon tension — don't litigate old hurts today; revisit when it clears.`,
  },
  friend: {
    peak: (el, phase) => `${phase} in a ${el} Moon — call them, plan the hangout, this is a green light.`,
    bright: (el) => `${el} Moon lifts the vibe — easy day for inside jokes and catch-ups.`,
    steady: () => `Easy, drama-free day — good background energy for anything casual.`,
    tender: (el) => `${el} Moon is a bit flat — don't read too much into short replies.`,
    low: (el) => `${el} Moon friction — skip the group chat debate, reconnect when it passes.`,
  },
  work: {
    peak: (el, phase) => `${phase} in a ${el} Moon — pitch the big idea, book the meeting, close the loop.`,
    bright: (el) => `${el} Moon sharpens collaboration — good for decisions and ship days.`,
    steady: () => `Workmanlike day — execute the plan you already have.`,
    tender: (el) => `${el} Moon slows things — async beats live meetings today.`,
    low: (el) => `${el} Moon tension — avoid big negotiations; document, don't decide.`,
  },
  family: {
    peak: (el, phase) => `${phase} in a ${el} Moon — rare warm window; plan the visit or the hard-but-loving talk.`,
    bright: (el) => `${el} Moon softens the edges — family calls land easier today.`,
    steady: () => `Quiet family day — keep it simple, don't stir old stuff.`,
    tender: (el) => `${el} Moon feels tired — send a short check-in, skip the deep dive.`,
    low: (el) => `${el} Moon friction — let old patterns pass through; don't re-engage today.`,
  },
};

function noteFor(
  tone: NoteTone,
  dayMoonElement: string,
  moonPhaseLabel: string,
  mode: RelationshipMode,
): string {
  const notes = MODE_NOTES[mode] ?? MODE_NOTES.romantic;
  return notes[tone](dayMoonElement, moonPhaseLabel);
}

export function calculateCompatibilityForecast(
  profile1: CosmicProfile,
  profile2: CosmicProfile,
  mode: RelationshipMode = 'romantic',
  startDate: Date = new Date(),
  days: number = 30,
): CompatibilityForecast {
  const base = calculateCrossCompatibility(profile1, profile2, mode).overall;
  const e1 = ELEMENT_OF_SIGN[profile1.western.sun];
  const e2 = ELEMENT_OF_SIGN[profile2.western.sun];
  const weekdayLift = MODE_WEEKDAY_LIFT[mode];

  const snapshots: CompatibilityDaySnapshot[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const transits = getCurrentTransits(d);
    const moon = transits.find((p) => p.planet === 'Moon');
    const moonElement = moon ? ELEMENT_OF_SIGN[moon.sign] : 'Fire';
    const venus = transits.find((p) => p.planet === 'Venus');
    const venusElement = venus ? ELEMENT_OF_SIGN[venus.sign] : 'Earth';
    const mercury = transits.find((p) => p.planet === 'Mercury');
    const mercuryRetro = mercury?.retrograde ? -3 : 0;

    const moonLift = (ELEMENT_CHEMISTRY[e1]?.[moonElement] ?? 0) + (ELEMENT_CHEMISTRY[e2]?.[moonElement] ?? 0);
    const venusLift = mode === 'romantic' || mode === 'family'
      ? Math.floor(((ELEMENT_CHEMISTRY[e1]?.[venusElement] ?? 0) + (ELEMENT_CHEMISTRY[e2]?.[venusElement] ?? 0)) / 2)
      : 0;

    const phase = getMoonPhase(d);
    const phaseBoost =
      phase.key === 'full' ? 4 :
      phase.key === 'new' ? 2 :
      phase.key === 'waxing-gibbous' || phase.key === 'waxing-crescent' ? 1 :
      phase.key === 'waning-crescent' ? -2 : 0;

    const weekday = d.getDay();
    const wkLift = weekdayLift[weekday] ?? 0;

    const delta = Math.max(-15, Math.min(15, moonLift + venusLift + mercuryRetro + phaseBoost + wkLift));
    const score = Math.max(30, Math.min(99, Math.round(base + delta)));

    const tone = toneFor(score, base);
    snapshots.push({
      dateKey: getDateKey(d),
      dayOfMonth: d.getDate(),
      weekday,
      score,
      tone,
      note: noteFor(tone, moonElement, phase.label, mode),
    });
  }

  const peak = snapshots.reduce((best, s) => (s.score > best.score ? s : best), snapshots[0]);
  const low = snapshots.reduce((worst, s) => (s.score < worst.score ? s : worst), snapshots[0]);
  const average = Math.round(snapshots.reduce((sum, s) => sum + s.score, 0) / snapshots.length);

  return { baseScore: base, days: snapshots, peak, low, average };
}
