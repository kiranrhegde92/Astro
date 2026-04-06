import { ChineseAnimal, ChineseElement, YinYang } from '../../types/astrology';

export interface AnimalData {
  name: ChineseAnimal;
  yearsExample: number[];
  traits: string[];
  compatibleAnimals: ChineseAnimal[];
  luckyNumbers: number[];
  luckyColors: string[];
}

export interface ElementData {
  name: ChineseElement;
  characteristics: string[];
  color: string;
  season: string;
  direction: string;
}

// The 12-year animal cycle starting from Rat (base year 1900 = Rat)
const ANIMAL_ORDER: ChineseAnimal[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

export const ANIMAL_DATA: AnimalData[] = [
  {
    name: 'Rat',
    yearsExample: [1960, 1972, 1984, 1996, 2008, 2020],
    traits: ['Resourceful', 'Quick-witted', 'Charming', 'Adaptable', 'Generous'],
    compatibleAnimals: ['Dragon', 'Monkey', 'Ox'],
    luckyNumbers: [2, 3],
    luckyColors: ['Blue', 'Gold', 'Green'],
  },
  {
    name: 'Ox',
    yearsExample: [1961, 1973, 1985, 1997, 2009, 2021],
    traits: ['Dependable', 'Strong', 'Determined', 'Patient', 'Honest'],
    compatibleAnimals: ['Rat', 'Snake', 'Rooster'],
    luckyNumbers: [1, 4],
    luckyColors: ['White', 'Yellow', 'Green'],
  },
  {
    name: 'Tiger',
    yearsExample: [1962, 1974, 1986, 1998, 2010, 2022],
    traits: ['Brave', 'Confident', 'Charismatic', 'Passionate', 'Natural leader'],
    compatibleAnimals: ['Dragon', 'Horse', 'Pig'],
    luckyNumbers: [1, 3, 4],
    luckyColors: ['Blue', 'Gray', 'Orange'],
  },
  {
    name: 'Rabbit',
    yearsExample: [1963, 1975, 1987, 1999, 2011, 2023],
    traits: ['Gentle', 'Elegant', 'Compassionate', 'Creative', 'Diplomatic'],
    compatibleAnimals: ['Goat', 'Monkey', 'Dog', 'Pig'],
    luckyNumbers: [3, 4, 6],
    luckyColors: ['Red', 'Pink', 'Purple', 'Blue'],
  },
  {
    name: 'Dragon',
    yearsExample: [1964, 1976, 1988, 2000, 2012, 2024],
    traits: ['Ambitious', 'Energetic', 'Inspiring', 'Fearless', 'Visionary'],
    compatibleAnimals: ['Rooster', 'Rat', 'Monkey'],
    luckyNumbers: [1, 6, 7],
    luckyColors: ['Gold', 'Silver', 'Gray'],
  },
  {
    name: 'Snake',
    yearsExample: [1965, 1977, 1989, 2001, 2013, 2025],
    traits: ['Wise', 'Intuitive', 'Graceful', 'Perceptive', 'Sophisticated'],
    compatibleAnimals: ['Dragon', 'Rooster', 'Ox'],
    luckyNumbers: [2, 8, 9],
    luckyColors: ['Black', 'Red', 'Yellow'],
  },
  {
    name: 'Horse',
    yearsExample: [1966, 1978, 1990, 2002, 2014, 2026],
    traits: ['Energetic', 'Warm-hearted', 'Enthusiastic', 'Free-spirited', 'Sociable'],
    compatibleAnimals: ['Tiger', 'Goat', 'Rabbit'],
    luckyNumbers: [2, 3, 7],
    luckyColors: ['Yellow', 'Red', 'Green'],
  },
  {
    name: 'Goat',
    yearsExample: [1967, 1979, 1991, 2003, 2015, 2027],
    traits: ['Gentle', 'Creative', 'Empathetic', 'Artistic', 'Kind'],
    compatibleAnimals: ['Rabbit', 'Horse', 'Pig'],
    luckyNumbers: [2, 7],
    luckyColors: ['Brown', 'Red', 'Purple'],
  },
  {
    name: 'Monkey',
    yearsExample: [1968, 1980, 1992, 2004, 2016, 2028],
    traits: ['Clever', 'Inventive', 'Playful', 'Versatile', 'Magnetic'],
    compatibleAnimals: ['Rat', 'Dragon', 'Snake'],
    luckyNumbers: [4, 9],
    luckyColors: ['White', 'Blue', 'Gold'],
  },
  {
    name: 'Rooster',
    yearsExample: [1969, 1981, 1993, 2005, 2017, 2029],
    traits: ['Observant', 'Hardworking', 'Courageous', 'Talented', 'Confident'],
    compatibleAnimals: ['Ox', 'Snake', 'Dragon'],
    luckyNumbers: [5, 7, 8],
    luckyColors: ['Gold', 'Brown', 'Yellow'],
  },
  {
    name: 'Dog',
    yearsExample: [1970, 1982, 1994, 2006, 2018, 2030],
    traits: ['Loyal', 'Honest', 'Caring', 'Reliable', 'Courageous'],
    compatibleAnimals: ['Rabbit', 'Tiger', 'Horse'],
    luckyNumbers: [3, 4, 9],
    luckyColors: ['Red', 'Green', 'Purple'],
  },
  {
    name: 'Pig',
    yearsExample: [1971, 1983, 1995, 2007, 2019, 2031],
    traits: ['Generous', 'Compassionate', 'Diligent', 'Warm', 'Optimistic'],
    compatibleAnimals: ['Tiger', 'Rabbit', 'Goat'],
    luckyNumbers: [2, 5, 8],
    luckyColors: ['Yellow', 'Gray', 'Brown'],
  },
];

export const ELEMENT_DATA: ElementData[] = [
  {
    name: 'Wood',
    characteristics: ['Growth-oriented', 'Flexible', 'Compassionate', 'Visionary', 'Nurturing'],
    color: 'Green',
    season: 'Spring',
    direction: 'East',
  },
  {
    name: 'Fire',
    characteristics: ['Passionate', 'Dynamic', 'Inspiring', 'Joyful', 'Transformative'],
    color: 'Red',
    season: 'Summer',
    direction: 'South',
  },
  {
    name: 'Earth',
    characteristics: ['Grounded', 'Nurturing', 'Stable', 'Trustworthy', 'Harmonious'],
    color: 'Yellow',
    season: 'Late Summer',
    direction: 'Center',
  },
  {
    name: 'Metal',
    characteristics: ['Determined', 'Organized', 'Refined', 'Principled', 'Resilient'],
    color: 'White',
    season: 'Autumn',
    direction: 'West',
  },
  {
    name: 'Water',
    characteristics: ['Intuitive', 'Wise', 'Adaptable', 'Reflective', 'Flowing'],
    color: 'Black',
    season: 'Winter',
    direction: 'North',
  },
];

/**
 * Determine the Chinese zodiac animal from a birth year.
 * Based on the 12-year cycle (Rat starts at years divisible by 12 offset from 1900).
 */
export function getChineseAnimal(year: number): ChineseAnimal {
  // 1900 is a Rat year, so (year - 1900) % 12 gives the index
  const index = ((year - 1900) % 12 + 12) % 12;
  return ANIMAL_ORDER[index];
}

/**
 * Determine the Chinese element from a birth year.
 * The 10-year element cycle: each element spans 2 consecutive years.
 * Wood: years ending 4-5, Fire: 6-7, Earth: 8-9, Metal: 0-1, Water: 2-3
 */
export function getChineseElement(year: number): ChineseElement {
  const lastDigit = ((year % 10) + 10) % 10;
  if (lastDigit === 0 || lastDigit === 1) return 'Metal';
  if (lastDigit === 2 || lastDigit === 3) return 'Water';
  if (lastDigit === 4 || lastDigit === 5) return 'Wood';
  if (lastDigit === 6 || lastDigit === 7) return 'Fire';
  return 'Earth'; // 8, 9
}

/**
 * Determine Yin or Yang from a birth year.
 * Even years = Yang, Odd years = Yin.
 */
export function getYinYang(year: number): YinYang {
  return year % 2 === 0 ? 'Yang' : 'Yin';
}
