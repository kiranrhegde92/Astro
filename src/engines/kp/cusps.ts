import { KPCusp, WesternSign, DashaPlanet } from '../../types/astrology';
import { getSubLord } from './sublord';

/**
 * KP Cusp/House Calculations
 *
 * In the KP system, house cusps are calculated using the Placidus house system,
 * and each cusp's position determines its Star Lord and Sub Lord.
 *
 * For client-side calculation without a full ephemeris, we use the Equal House
 * system as an approximation, starting from an estimated Ascendant.
 *
 * Reference: "Krishnamurti Paddhati Reader" by K.S. Krishnamurti, Vol 1
 */

const SIGNS: WesternSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/**
 * Approximate the Ascendant degree based on birth date and time.
 * Uses a simplified RAMC (Right Ascension of Midheaven) calculation.
 */
function approximateAscendant(birthDate: Date, birthTime?: string): number {
  const dayOfYear = Math.floor(
    (birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000
  );

  let hourDecimal = 6; // default to 6 AM
  if (birthTime) {
    const [h, m] = birthTime.split(':').map(Number);
    hourDecimal = h + m / 60;
  }

  // Approximate sidereal time contribution
  const siderealOffset = (dayOfYear / 365.25) * 360;
  const timeOffset = (hourDecimal / 24) * 360;

  return (siderealOffset + timeOffset + 90) % 360; // rough Ascendant
}

/**
 * Calculate KP cusps using Equal House system from the Ascendant.
 * Each house spans exactly 30 degrees starting from the Ascendant.
 */
export function calculateKPCusps(birthDate: Date, birthTime?: string): KPCusp[] {
  const ascDegree = approximateAscendant(birthDate, birthTime);
  const cusps: KPCusp[] = [];

  for (let house = 1; house <= 12; house++) {
    const degree = (ascDegree + (house - 1) * 30) % 360;
    const signIndex = Math.floor(degree / 30);
    const sign = SIGNS[signIndex];
    const { starLord, subLord } = getSubLord(degree);

    cusps.push({
      house,
      degree: Math.round(degree * 100) / 100,
      sign,
      starLord,
      subLord,
    });
  }

  return cusps;
}
