import { ChineseProfile, ChineseAnimal } from '../../types/astrology';
import { getChineseAnimal, getChineseElement, getYinYang, ANIMAL_DATA } from './zodiac';
import { calculateFourPillars } from './pillars';

export { getChineseAnimal, getChineseElement, getYinYang, ANIMAL_DATA, ELEMENT_DATA } from './zodiac';
export { getElementCompatibility } from './elements';
export { calculateFourPillars } from './pillars';
export { getChineseCompatibility } from './compatibility';

/**
 * Traditionally challenging pairings — used here to identify "growth teacher" animals.
 */
const GROWTH_OPPOSITES: Record<ChineseAnimal, ChineseAnimal> = {
  Rat: 'Horse',
  Ox: 'Goat',
  Tiger: 'Monkey',
  Rabbit: 'Rooster',
  Dragon: 'Dog',
  Snake: 'Pig',
  Horse: 'Rat',
  Goat: 'Ox',
  Monkey: 'Tiger',
  Rooster: 'Rabbit',
  Dog: 'Dragon',
  Pig: 'Snake',
};

/**
 * Calculate a complete Chinese astrology profile from a birth date and optional birth time.
 *
 * This profile includes:
 * - Zodiac animal (12-year cycle)
 * - Element (10-year cycle)
 * - Yin/Yang polarity
 * - Four Pillars (Ba Zi) if birth time is provided
 * - Lucky numbers, colors, compatible animals, and growth-teacher animals
 *
 * All descriptions and interpretations are positively framed — this is about
 * understanding your cosmic gifts, not limitations.
 */
export function calculateChineseProfile(birthDate: Date, birthTime?: string): ChineseProfile {
  const year  = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 1-12
  const day   = birthDate.getDate();
  const animal = getChineseAnimal(year, month, day);
  const element = getChineseElement(year);
  const yinYang = getYinYang(year);

  // Get animal-specific data
  const animalInfo = ANIMAL_DATA.find((a) => a.name === animal)!;

  // Calculate Four Pillars when birth time is available
  const pillars = birthTime ? calculateFourPillars(birthDate, birthTime) : undefined;

  // "Incompatible" animals are reframed as growth teachers
  const growthTeacher = GROWTH_OPPOSITES[animal];
  const incompatibleAnimals: ChineseAnimal[] = [growthTeacher];

  return {
    animal,
    element,
    yinYang,
    pillars,
    luckyNumbers: animalInfo.luckyNumbers,
    luckyColors: animalInfo.luckyColors,
    compatibleAnimals: animalInfo.compatibleAnimals,
    incompatibleAnimals,
  };
}
