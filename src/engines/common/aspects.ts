/**
 * Planetary Aspect Calculator
 *
 * Computes major aspects between planets using standard Western orbs.
 * Aspects indicate how planetary energies interact — conjunctions merge them,
 * trines harmonise them, squares create dynamic tension, etc.
 *
 * Reference: Robert Hand, "Planets in Transit"
 */

import type { PlanetPosition, Planet } from '../../types/astrology';

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  exactAngle: number;   // the ideal angle (0/60/90/120/180)
  actualAngle: number;   // the true angular separation
  orb: number;           // how far from exact (0 = perfect)
  interpretation: string;
}

/** Aspect definitions with max orbs. Luminaries get wider orbs. */
const ASPECT_DEFS: { type: AspectType; angle: number; maxOrb: number; maxOrbLuminary: number; keyword: string }[] = [
  { type: 'conjunction', angle: 0,   maxOrb: 8,  maxOrbLuminary: 10, keyword: 'merges energy with' },
  { type: 'sextile',     angle: 60,  maxOrb: 5,  maxOrbLuminary: 6,  keyword: 'harmoniously supports' },
  { type: 'square',      angle: 90,  maxOrb: 7,  maxOrbLuminary: 8,  keyword: 'dynamically challenges' },
  { type: 'trine',       angle: 120, maxOrb: 8,  maxOrbLuminary: 9,  keyword: 'flows effortlessly with' },
  { type: 'opposition',  angle: 180, maxOrb: 8,  maxOrbLuminary: 10, keyword: 'balances opposite to' },
];

const LUMINARIES = new Set<Planet>(['Sun', 'Moon']);
const SIGN_ORDER = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

function planetLongitude(p: PlanetPosition): number {
  const signIdx = SIGN_ORDER.indexOf(p.sign);
  return signIdx * 30 + p.degree;
}

function angularSeparation(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

const PLANET_KEYWORDS: Record<string, string> = {
  Sun: 'core identity', Moon: 'emotional nature', Mercury: 'communication',
  Venus: 'love & values', Mars: 'drive & action', Jupiter: 'growth & wisdom',
  Saturn: 'discipline & mastery', Uranus: 'innovation', Neptune: 'intuition',
  Pluto: 'transformation', NorthNode: 'soul growth', SouthNode: 'past wisdom',
};

/**
 * Compute all major aspects between a set of planet positions.
 */
export function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const skip = new Set(['NorthNode', 'SouthNode']); // nodes don't aspect in most systems

  for (let i = 0; i < planets.length; i++) {
    if (skip.has(planets[i].planet)) continue;
    for (let j = i + 1; j < planets.length; j++) {
      if (skip.has(planets[j].planet)) continue;

      const lon1 = planetLongitude(planets[i]);
      const lon2 = planetLongitude(planets[j]);
      const sep = angularSeparation(lon1, lon2);

      for (const def of ASPECT_DEFS) {
        const isLum = LUMINARIES.has(planets[i].planet) || LUMINARIES.has(planets[j].planet);
        const maxOrb = isLum ? def.maxOrbLuminary : def.maxOrb;
        const orb = Math.abs(sep - def.angle);

        if (orb <= maxOrb) {
          const p1kw = PLANET_KEYWORDS[planets[i].planet] ?? planets[i].planet;
          const p2kw = PLANET_KEYWORDS[planets[j].planet] ?? planets[j].planet;
          aspects.push({
            planet1: planets[i].planet,
            planet2: planets[j].planet,
            type: def.type,
            exactAngle: def.angle,
            actualAngle: Math.round(sep * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            interpretation: `Your ${p1kw} (${planets[i].planet}) ${def.keyword} your ${p2kw} (${planets[j].planet}).`,
          });
          break; // only one aspect per pair
        }
      }
    }
  }

  // sort tightest orbs first
  aspects.sort((a, b) => a.orb - b.orb);
  return aspects;
}
