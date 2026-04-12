import type { DashaPlanet, KPProfile, VedicProfile, WesternProfile } from '../../types/astrology';

const WEEKDAY_LORDS: DashaPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANET_SEQUENCE: DashaPlanet[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

export interface KPRulingPlanets {
  dayLord: DashaPlanet;
  moonStarLord: DashaPlanet;
  moonSubLord: DashaPlanet;
  lagnaLord: DashaPlanet;
}

const SIGN_LORDS: Record<string, DashaPlanet> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const NAKSHATRA_RULERS: DashaPlanet[] = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
];

function getMoonLongitude(western: WesternProfile) {
  const moon = western.planets.find((planet: WesternProfile['planets'][number]) => planet.planet === 'Moon');
  if (!moon) return 0;
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return signs.indexOf(moon.sign) * 30 + moon.degree;
}

function getNakshatraInfo(longitude: number) {
  const nakshatraSpan = 360 / 27;
  const index = Math.floor(longitude / nakshatraSpan) % 27;
  const offsetInNakshatra = longitude % nakshatraSpan;
  const subSpan = nakshatraSpan / 9;
  const subIndex = Math.min(8, Math.floor(offsetInNakshatra / subSpan));
  return {
    starLord: NAKSHATRA_RULERS[index],
    subLord: PLANET_SEQUENCE[subIndex],
  };
}

export function calculateKPRulingPlanets({
  western,
  vedic,
  kp,
  date = new Date(),
}: {
  western: WesternProfile;
  vedic?: VedicProfile;
  kp?: KPProfile;
  date?: Date;
}): KPRulingPlanets {
  const dayLord = WEEKDAY_LORDS[date.getDay()];
  const moonLongitude = getMoonLongitude(western);
  const moonNakshatra = getNakshatraInfo(moonLongitude);
  const lagnaSign = kp?.cusps?.[0]?.sign ?? western.rising ?? western.sun;
  const lagnaLord = SIGN_LORDS[lagnaSign] ?? vedic?.currentDasha?.planet ?? 'Sun';

  return {
    dayLord,
    moonStarLord: moonNakshatra.starLord,
    moonSubLord: moonNakshatra.subLord,
    lagnaLord,
  };
}
