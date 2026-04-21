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
 * Chinese New Year dates (month, day) for years 1960–2040.
 * Key: year, Value: [month (1 or 2), day].
 * The Chinese year begins on this date; those born before it belong to the prior animal year.
 */
const CHINESE_NEW_YEAR: Record<number, [number, number]> = {
  1960:[1,28], 1961:[2,15], 1962:[2,5],  1963:[1,25], 1964:[2,13], 1965:[2,2],
  1966:[1,21], 1967:[2,9],  1968:[1,30], 1969:[2,17], 1970:[2,6],  1971:[1,27],
  1972:[2,15], 1973:[2,3],  1974:[1,23], 1975:[2,11], 1976:[1,31], 1977:[2,18],
  1978:[2,7],  1979:[1,28], 1980:[2,16], 1981:[2,5],  1982:[1,25], 1983:[2,13],
  1984:[2,2],  1985:[2,20], 1986:[2,9],  1987:[1,29], 1988:[2,17], 1989:[2,6],
  1990:[1,27], 1991:[2,15], 1992:[2,4],  1993:[1,23], 1994:[2,10], 1995:[1,31],
  1996:[2,19], 1997:[2,7],  1998:[1,28], 1999:[2,16], 2000:[2,5],  2001:[1,24],
  2002:[2,12], 2003:[2,1],  2004:[1,22], 2005:[2,9],  2006:[1,29], 2007:[2,18],
  2008:[2,7],  2009:[1,26], 2010:[2,14], 2011:[2,3],  2012:[1,23], 2013:[2,10],
  2014:[1,31], 2015:[2,19], 2016:[2,8],  2017:[1,28], 2018:[2,16], 2019:[2,5],
  2020:[1,25], 2021:[2,12], 2022:[2,1],  2023:[1,22], 2024:[2,10], 2025:[1,29],
  2026:[2,17], 2027:[2,6],  2028:[1,26], 2029:[2,13], 2030:[2,3],  2031:[1,23],
  2032:[2,11], 2033:[1,31], 2034:[2,19], 2035:[2,8],  2036:[1,28], 2037:[2,15],
  2038:[2,4],  2039:[1,24], 2040:[2,12],
};

/**
 * Determine the Chinese zodiac animal from a birth date.
 * Correctly accounts for the Chinese New Year (late Jan / early Feb):
 * people born before CNY in a given Gregorian year belong to the prior animal cycle.
 */
export function getChineseAnimal(year: number, month?: number, day?: number): ChineseAnimal {
  let animalYear = year;
  if (month !== undefined && day !== undefined) {
    const cny = CHINESE_NEW_YEAR[year];
    if (cny) {
      const [cnyMonth, cnyDay] = cny;
      // Before Chinese New Year → previous animal year
      if (month < cnyMonth || (month === cnyMonth && day < cnyDay)) {
        animalYear = year - 1;
      }
    } else if (month === 1) {
      // Outside lookup range: fall back to Feb 4 (Lichun solar term) as an approximation
      animalYear = year - 1;
    }
  }
  const index = ((animalYear - 1900) % 12 + 12) % 12;
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
