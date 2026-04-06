import type { WesternSign } from '../types/astrology';

export interface ZodiacInfo {
  sign: WesternSign;
  symbol: string;
  emoji: string;
  dates: string;
  element: string;
  ruling: string;
  traits: string[];
  description: string;
}

export const WESTERN_ZODIAC: ZodiacInfo[] = [
  { sign: 'Aries', symbol: '\u2648', emoji: '\u2648', dates: 'Mar 21 - Apr 19', element: 'Fire', ruling: 'Mars', traits: ['Bold', 'Ambitious', 'Courageous'], description: 'The fearless pioneer of the zodiac. Your energy ignites every room you enter.' },
  { sign: 'Taurus', symbol: '\u2649', emoji: '\u2649', dates: 'Apr 20 - May 20', element: 'Earth', ruling: 'Venus', traits: ['Reliable', 'Sensual', 'Determined'], description: 'The cosmic builder. Your patience and determination create lasting beauty.' },
  { sign: 'Gemini', symbol: '\u264A', emoji: '\u264A', dates: 'May 21 - Jun 20', element: 'Air', ruling: 'Mercury', traits: ['Versatile', 'Curious', 'Communicative'], description: 'The cosmic connector. Your brilliant mind bridges worlds and ideas.' },
  { sign: 'Cancer', symbol: '\u264B', emoji: '\u264B', dates: 'Jun 21 - Jul 22', element: 'Water', ruling: 'Moon', traits: ['Nurturing', 'Intuitive', 'Protective'], description: 'The cosmic nurturer. Your emotional depth creates safe harbors for others.' },
  { sign: 'Leo', symbol: '\u264C', emoji: '\u264C', dates: 'Jul 23 - Aug 22', element: 'Fire', ruling: 'Sun', traits: ['Confident', 'Creative', 'Generous'], description: 'The cosmic royalty. Your radiant warmth illuminates everything around you.' },
  { sign: 'Virgo', symbol: '\u264D', emoji: '\u264D', dates: 'Aug 23 - Sep 22', element: 'Earth', ruling: 'Mercury', traits: ['Analytical', 'Helpful', 'Precise'], description: 'The cosmic healer. Your attention to detail makes the world more beautiful.' },
  { sign: 'Libra', symbol: '\u264E', emoji: '\u264E', dates: 'Sep 23 - Oct 22', element: 'Air', ruling: 'Venus', traits: ['Harmonious', 'Fair', 'Elegant'], description: 'The cosmic diplomat. Your grace creates harmony wherever you go.' },
  { sign: 'Scorpio', symbol: '\u264F', emoji: '\u264F', dates: 'Oct 23 - Nov 21', element: 'Water', ruling: 'Pluto', traits: ['Intense', 'Strategic', 'Transformative'], description: 'The cosmic transformer. Your depth and intensity create profound change.' },
  { sign: 'Sagittarius', symbol: '\u2650', emoji: '\u2650', dates: 'Nov 22 - Dec 21', element: 'Fire', ruling: 'Jupiter', traits: ['Optimistic', 'Adventurous', 'Philosophical'], description: 'The cosmic explorer. Your quest for truth expands horizons for everyone.' },
  { sign: 'Capricorn', symbol: '\u2651', emoji: '\u2651', dates: 'Dec 22 - Jan 19', element: 'Earth', ruling: 'Saturn', traits: ['Ambitious', 'Disciplined', 'Wise'], description: 'The cosmic architect. Your determination builds empires that stand the test of time.' },
  { sign: 'Aquarius', symbol: '\u2652', emoji: '\u2652', dates: 'Jan 20 - Feb 18', element: 'Air', ruling: 'Uranus', traits: ['Innovative', 'Humanitarian', 'Independent'], description: 'The cosmic visionary. Your unique perspective shapes the future for all.' },
  { sign: 'Pisces', symbol: '\u2653', emoji: '\u2653', dates: 'Feb 19 - Mar 20', element: 'Water', ruling: 'Neptune', traits: ['Empathic', 'Creative', 'Intuitive'], description: 'The cosmic dreamer. Your compassion and imagination heal the world.' },
];
