import { DashaPlanet, Nakshatra } from '../../types/astrology';

/**
 * KP (Krishnamurti Paddhati) Sub-Lord System
 *
 * The zodiac is divided into 27 Nakshatras, each spanning 13°20' (800').
 * Each Nakshatra is further subdivided into 9 sub-divisions proportional
 * to the Vimshottari Dasha periods of the 9 planets.
 *
 * Total Dasha years: 120
 * Planet periods: Ketu=7, Venus=20, Sun=6, Moon=10, Mars=7,
 *                 Rahu=18, Jupiter=16, Saturn=19, Mercury=17
 *
 * Each sub-division within a Nakshatra spans:
 *   (planet's dasha years / 120) * 13°20'
 *
 * Reference: "Krishnamurti Paddhati Reader" by K.S. Krishnamurti
 */

/** Vimshottari Dasha order and period durations (in years). */
const DASHA_ORDER: DashaPlanet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

const DASHA_YEARS: Record<DashaPlanet, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const TOTAL_DASHA_YEARS = 120;

/** Nakshatra span in degrees. */
const NAKSHATRA_SPAN = 13 + 20 / 60; // 13.33333... degrees

/** All 27 Nakshatras in order, with their ruling planet (star lord). */
const NAKSHATRAS: { name: Nakshatra; lord: DashaPlanet }[] = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' },
];

export interface KPSubLordEntry {
  /** Sequential number 1-249. */
  number: number;
  /** Start degree in the zodiac (0-360). */
  startDegree: number;
  /** End degree in the zodiac (0-360). */
  endDegree: number;
  /** The Nakshatra (constellation) this sub-division falls in. */
  nakshatra: Nakshatra;
  /** The star lord (Nakshatra lord). */
  starLord: DashaPlanet;
  /** The sub-lord — the planet ruling this sub-division. */
  subLord: DashaPlanet;
}

/**
 * Build the complete KP Sub-Lord Table — 249 sub-divisions of the zodiac.
 *
 * For each of the 27 Nakshatras, the 13°20' span is divided into 9 sub-parts
 * proportional to the Dasha periods. The sub-lord sequence within each Nakshatra
 * starts from the star lord's position in the Dasha order and cycles through.
 */
function buildSubLordTable(): KPSubLordEntry[] {
  const table: KPSubLordEntry[] = [];
  let entryNumber = 1;

  for (let n = 0; n < 27; n++) {
    const nak = NAKSHATRAS[n];
    const nakStart = n * NAKSHATRA_SPAN;

    // Find the starting index in DASHA_ORDER for this Nakshatra's star lord
    const starLordIdx = DASHA_ORDER.indexOf(nak.lord);

    let offset = 0;
    for (let s = 0; s < 9; s++) {
      const subLordIdx = (starLordIdx + s) % 9;
      const subLordPlanet = DASHA_ORDER[subLordIdx];
      const subSpan = (DASHA_YEARS[subLordPlanet] / TOTAL_DASHA_YEARS) * NAKSHATRA_SPAN;

      const startDegree = nakStart + offset;
      const endDegree = nakStart + offset + subSpan;

      table.push({
        number: entryNumber,
        startDegree: roundDeg(startDegree),
        endDegree: roundDeg(endDegree),
        nakshatra: nak.name,
        starLord: nak.lord,
        subLord: subLordPlanet,
      });

      offset += subSpan;
      entryNumber++;
    }
  }

  return table;
}

/** Round a degree value to 6 decimal places to avoid floating-point noise. */
function roundDeg(deg: number): number {
  return Math.round(deg * 1000000) / 1000000;
}

/**
 * The complete 249-entry KP Sub-Lord Table.
 * Pre-computed at module load for fast lookups.
 */
export const KP_SUBLORD_TABLE: KPSubLordEntry[] = buildSubLordTable();

/**
 * Look up the star lord and sub-lord for a given zodiacal degree.
 *
 * @param degree - Position in the zodiac (0-360).
 * @returns The star lord (Nakshatra lord) and sub-lord for that degree.
 */
export function getSubLord(degree: number): { starLord: DashaPlanet; subLord: DashaPlanet } {
  // Normalize to 0-360
  const normalized = ((degree % 360) + 360) % 360;

  // Binary-style search through the table
  for (const entry of KP_SUBLORD_TABLE) {
    if (normalized >= entry.startDegree && normalized < entry.endDegree) {
      return {
        starLord: entry.starLord,
        subLord: entry.subLord,
      };
    }
  }

  // Edge case: exactly 360° wraps to the first entry
  const first = KP_SUBLORD_TABLE[0];
  return {
    starLord: first.starLord,
    subLord: first.subLord,
  };
}

/**
 * Get the full sub-lord entry for a given zodiacal degree.
 */
export function getSubLordEntry(degree: number): KPSubLordEntry | undefined {
  const normalized = ((degree % 360) + 360) % 360;
  return KP_SUBLORD_TABLE.find(
    (entry) => normalized >= entry.startDegree && normalized < entry.endDegree,
  );
}

export { DASHA_ORDER, DASHA_YEARS, NAKSHATRAS };
