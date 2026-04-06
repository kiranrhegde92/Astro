// ============ WESTERN ASTROLOGY ============

export type WesternSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Planet =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'NorthNode' | 'SouthNode';

export type WesternElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type WesternModality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface PlanetPosition {
  planet: Planet;
  sign: WesternSign;
  degree: number;
  house?: number;
  retrograde?: boolean;
}

export interface WesternProfile {
  sun: WesternSign;
  moon: WesternSign;
  rising?: WesternSign;
  element: WesternElement;
  modality: WesternModality;
  planets: PlanetPosition[];
  houses?: number[];
}

// ============ VEDIC ASTROLOGY ============

export type Rashi =
  | 'Mesha' | 'Vrishabha' | 'Mithuna' | 'Karka'
  | 'Simha' | 'Kanya' | 'Tula' | 'Vrischika'
  | 'Dhanu' | 'Makara' | 'Kumbha' | 'Meena';

export type Nakshatra =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini'
  | 'Mrigashira' | 'Ardra' | 'Punarvasu' | 'Pushya'
  | 'Ashlesha' | 'Magha' | 'Purva Phalguni' | 'Uttara Phalguni'
  | 'Hasta' | 'Chitra' | 'Swati' | 'Vishakha'
  | 'Anuradha' | 'Jyeshtha' | 'Mula' | 'Purva Ashadha'
  | 'Uttara Ashadha' | 'Shravana' | 'Dhanishta' | 'Shatabhisha'
  | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export type DashaPlanet = 'Ketu' | 'Venus' | 'Sun' | 'Moon' | 'Mars' | 'Rahu' | 'Jupiter' | 'Saturn' | 'Mercury';

export interface DashaPeriod {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  subPeriods?: DashaPeriod[];
}

export interface Remedy {
  type: 'gemstone' | 'mantra' | 'color' | 'day' | 'ritual' | 'charity';
  name: string;
  description: string;
  source: string;
}

export interface VedicProfile {
  rashi: Rashi;
  nakshatra: Nakshatra;
  nakshatraPada: number; // 1-4
  moonSign: Rashi;
  dashas: DashaPeriod[];
  currentDasha: DashaPeriod;
  remedies: Remedy[];
}

// ============ CHINESE ASTROLOGY ============

export type ChineseAnimal =
  | 'Rat' | 'Ox' | 'Tiger' | 'Rabbit'
  | 'Dragon' | 'Snake' | 'Horse' | 'Goat'
  | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';

export type ChineseElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
export type YinYang = 'Yin' | 'Yang';

export interface FourPillars {
  year: { stem: string; branch: ChineseAnimal; element: ChineseElement; };
  month: { stem: string; branch: ChineseAnimal; element: ChineseElement; };
  day: { stem: string; branch: ChineseAnimal; element: ChineseElement; };
  hour: { stem: string; branch: ChineseAnimal; element: ChineseElement; };
}

export interface ChineseProfile {
  animal: ChineseAnimal;
  element: ChineseElement;
  yinYang: YinYang;
  pillars?: FourPillars;
  luckyNumbers: number[];
  luckyColors: string[];
  compatibleAnimals: ChineseAnimal[];
  incompatibleAnimals: ChineseAnimal[];
}

// ============ KP SYSTEM ============

export interface SubLord {
  house: number;
  starLord: DashaPlanet;
  subLord: DashaPlanet;
  signLord: DashaPlanet;
}

export interface KPCusp {
  house: number;
  degree: number;
  sign: WesternSign;
  starLord: DashaPlanet;
  subLord: DashaPlanet;
}

export interface Significator {
  planet: DashaPlanet;
  houses: number[];
  strength: 'strong' | 'moderate' | 'weak';
}

export interface EventPrediction {
  area: 'career' | 'love' | 'health' | 'wealth' | 'education' | 'travel';
  prediction: string;
  timing: string;
  confidence: number;
  source: string;
}

export interface KPProfile {
  sublords: SubLord[];
  cusps: KPCusp[];
  significators: Significator[];
  predictions: EventPrediction[];
}

// ============ UNIFIED ============

export interface CosmicProfile {
  western: WesternProfile;
  vedic: VedicProfile;
  chinese: ChineseProfile;
  kp?: KPProfile;
}

export interface PredictionReference {
  source: string;
  type: 'book' | 'scripture' | 'research' | 'tradition' | 'url';
  chapter?: string;
  url?: string;
  tradition: 'western' | 'vedic' | 'chinese' | 'kp';
}

export interface DailyReading {
  date: string;
  western?: {
    overall: string;
    love: string;
    career: string;
    wellness: string;
    luckyNumber: number;
  };
  vedic?: {
    dasha: string;
    nakshatra: string;
    remedy: Remedy;
    mantra: string;
  };
  kp?: {
    eventTiming: string;
    significatorInsight: string;
    sublordGuidance: string;
  };
  chinese?: {
    element: string;
    animal: string;
    luckyDirection: string;
  };
  unified: {
    cosmicVibe: string;
    affirmation: string;
    shareText: string;
  };
  references: PredictionReference[];
  positivityScore: number;
}

export interface CompatibilityResult {
  overall: number; // 0-100
  western: { score: number; details: string; };
  vedic: { score: number; details: string; };
  chinese: { score: number; details: string; };
  kp?: { score: number; details: string; };
  shareText: string;
  references: PredictionReference[];
}
