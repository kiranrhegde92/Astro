import { DashaPlanet, DashaPeriod, Nakshatra } from '../../types/astrology';
import { NAKSHATRA_DATA } from './nakshatra';

/**
 * Vimshottari Dasha system - the most widely used planetary period system in Vedic astrology.
 *
 * The full cycle spans 120 years, divided among 9 planets in a fixed sequence.
 * The starting Dasha (Mahadasha) is determined by the Nakshatra of the Moon at birth.
 *
 * Reference: Brihat Parashara Hora Shastra, Chapter 46
 */

/**
 * The Vimshottari Dasha sequence with each planet's period duration in years.
 * Total: 7 + 20 + 6 + 10 + 7 + 18 + 16 + 19 + 17 = 120 years.
 */
const DASHA_SEQUENCE: { planet: DashaPlanet; years: number }[] = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
];

const TOTAL_DASHA_YEARS = 120;

/**
 * Nakshatra span in degrees (13°20').
 */
const NAKSHATRA_SPAN = 360 / 27;

/**
 * Get the index of a planet in the Dasha sequence.
 */
function getDashaIndex(planet: DashaPlanet): number {
  return DASHA_SEQUENCE.findIndex((d) => d.planet === planet);
}

/**
 * Calculate the Vimshottari Dasha periods from birth.
 *
 * The birth Nakshatra's ruling planet determines which Mahadasha is active at birth.
 * The elapsed portion of the first Dasha depends on how far the Moon has traveled
 * within that Nakshatra (determined by the pada).
 *
 * @param birthDate - Date of birth
 * @param nakshatra - Birth Nakshatra
 * @param pada - Pada (quarter 1-4) within the Nakshatra
 * @returns Array of Mahadasha periods, each with sub-periods (Antardashas)
 */
export function calculateDashas(
  birthDate: Date,
  nakshatra: Nakshatra,
  pada: number,
): DashaPeriod[] {
  const nakshatraInfo = NAKSHATRA_DATA.find((n) => n.name === nakshatra);
  if (!nakshatraInfo) {
    throw new Error(`Unknown Nakshatra: ${nakshatra}`);
  }

  const rulingPlanet = nakshatraInfo.rulingPlanet;
  const startIndex = getDashaIndex(rulingPlanet);

  // Calculate the fraction of the first Dasha already elapsed at birth.
  // The pada (1-4) indicates position within the Nakshatra.
  // Each pada is 1/4 of the Nakshatra span.
  const fractionElapsed = (pada - 1) / 4 + 1 / 8; // midpoint of the pada
  const firstDashaEntry = DASHA_SEQUENCE[startIndex];
  const remainingYearsInFirst = firstDashaEntry.years * (1 - fractionElapsed);

  const dashas: DashaPeriod[] = [];
  let currentDate = new Date(birthDate.getTime());

  // First (partial) Mahadasha
  const firstEnd = addYears(currentDate, remainingYearsInFirst);
  const firstDasha: DashaPeriod = {
    planet: firstDashaEntry.planet,
    startDate: new Date(currentDate.getTime()),
    endDate: firstEnd,
    subPeriods: calculateSubPeriods(
      firstDashaEntry.planet,
      currentDate,
      firstEnd,
      startIndex,
    ),
  };
  dashas.push(firstDasha);
  currentDate = firstEnd;

  // Subsequent full Mahadashas (cycle through the sequence)
  for (let i = 1; i < 9; i++) {
    const seqIndex = (startIndex + i) % 9;
    const entry = DASHA_SEQUENCE[seqIndex];
    const endDate = addYears(currentDate, entry.years);

    const dasha: DashaPeriod = {
      planet: entry.planet,
      startDate: new Date(currentDate.getTime()),
      endDate,
      subPeriods: calculateSubPeriods(entry.planet, currentDate, endDate, seqIndex),
    };
    dashas.push(dasha);
    currentDate = endDate;
  }

  return dashas;
}

/**
 * Calculate Antardasha (sub-periods) within a Mahadasha.
 *
 * Sub-periods follow the same Dasha sequence, starting from the Mahadasha lord.
 * Each sub-period's duration is proportional to its planet's Dasha years
 * relative to the total 120 years.
 */
function calculateSubPeriods(
  mahadashaLord: DashaPlanet,
  startDate: Date,
  endDate: Date,
  mahadashaIndex: number,
): DashaPeriod[] {
  const totalMs = endDate.getTime() - startDate.getTime();
  const subPeriods: DashaPeriod[] = [];
  let currentMs = startDate.getTime();

  for (let i = 0; i < 9; i++) {
    const seqIndex = (mahadashaIndex + i) % 9;
    const entry = DASHA_SEQUENCE[seqIndex];
    const fraction = entry.years / TOTAL_DASHA_YEARS;
    const durationMs = totalMs * fraction;

    const subStart = new Date(currentMs);
    const subEnd = new Date(currentMs + durationMs);

    subPeriods.push({
      planet: entry.planet,
      startDate: subStart,
      endDate: subEnd,
    });

    currentMs += durationMs;
  }

  return subPeriods;
}

/**
 * Find the currently active Mahadasha for a given date.
 *
 * @param dashas - Array of Dasha periods (from calculateDashas)
 * @param currentDate - The date to check
 * @returns The active DashaPeriod
 */
export function getCurrentDasha(
  dashas: DashaPeriod[],
  currentDate: Date,
): DashaPeriod {
  const now = currentDate.getTime();

  for (const dasha of dashas) {
    if (now >= dasha.startDate.getTime() && now < dasha.endDate.getTime()) {
      return dasha;
    }
  }

  // If the current date is beyond all calculated dashas, return the last one.
  // If before all dashas (shouldn't happen with birth date), return the first.
  if (now >= dashas[dashas.length - 1].endDate.getTime()) {
    return dashas[dashas.length - 1];
  }
  return dashas[0];
}

/**
 * Add fractional years to a date.
 */
function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}
