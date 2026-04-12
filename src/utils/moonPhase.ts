export type MoonPhaseKey =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface MoonPhaseInfo {
  key: MoonPhaseKey;
  label: string;
  emoji: string;
  illumination: number;
  ageDays: number;
  ritual: string;
}

const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES: Array<{ key: MoonPhaseKey; label: string; emoji: string; ritual: string }> = [
  { key: 'new', label: 'New Moon', emoji: '🌑', ritual: 'Set intentions and choose one quiet beginning for this cycle.' },
  { key: 'waxing-crescent', label: 'Waxing Crescent', emoji: '🌒', ritual: 'Take one concrete step toward the intention you just named.' },
  { key: 'first-quarter', label: 'First Quarter', emoji: '🌓', ritual: 'Act decisively and remove friction from the path ahead.' },
  { key: 'waxing-gibbous', label: 'Waxing Gibbous', emoji: '🌔', ritual: 'Refine your work, adjust your plan, and stay consistent.' },
  { key: 'full', label: 'Full Moon', emoji: '🌕', ritual: 'Celebrate progress, release excess, and share what is clear.' },
  { key: 'waning-gibbous', label: 'Waning Gibbous', emoji: '🌖', ritual: 'Reflect, teach, or journal about what this cycle revealed.' },
  { key: 'last-quarter', label: 'Last Quarter', emoji: '🌗', ritual: 'Cut what is draining energy and simplify the next chapter.' },
  { key: 'waning-crescent', label: 'Waning Crescent', emoji: '🌘', ritual: 'Rest deeply, forgive loose ends, and prepare for renewal.' },
];

function normalizeCyclePosition(date: Date) {
  const ageDays = ((((date.getTime() - KNOWN_NEW_MOON) / 86400000) % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  return ageDays;
}

export function getMoonPhase(date = new Date()): MoonPhaseInfo {
  const ageDays = normalizeCyclePosition(date);
  const phaseIndex = Math.floor((ageDays / SYNODIC_MONTH) * 8) % 8;
  const illumination = Number(((1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH)) / 2).toFixed(2));
  const phase = PHASES[phaseIndex];

  return {
    ...phase,
    illumination,
    ageDays: Number(ageDays.toFixed(1)),
  };
}

export function getUpcomingMoonPhases(from = new Date(), count = 6) {
  const results: Array<MoonPhaseInfo & { date: string }> = [];
  let cursor = new Date(from);

  while (results.length < count) {
    const phase = getMoonPhase(cursor);
    if (!results.some((item) => item.key === phase.key && item.date === cursor.toISOString().slice(0, 10))) {
      results.push({ ...phase, date: cursor.toISOString().slice(0, 10) });
    }
    cursor = new Date(cursor.getTime() + 3 * 86400000);
  }

  return results;
}
