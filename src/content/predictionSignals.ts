import { calculateCosmicProfile } from '../engines/unified';
import { findActiveTransits, type TransitHit } from '../engines/common/transits';
import type {
  ChineseElement,
  CosmicProfile,
  DashaPlanet,
  DailyReading,
  Planet,
  PredictionReference,
  Remedy,
  WesternProfile,
  VedicProfile,
  ChineseProfile,
  KPProfile,
} from '../types/astrology';
import type { UserProfile } from '../types/user';
import { getDateKey } from '../utils/dateUtils';

export type ForecastArea = 'career' | 'love' | 'wellness' | 'wealth' | 'education' | 'travel';

export interface DailySignalSnapshot {
  date: Date;
  hits: TransitHit[];
  supportHits: TransitHit[];
  challengeHits: TransitHit[];
  supportArea: ForecastArea;
  challengeArea: ForecastArea;
  supportScore: number;
  challengeScore: number;
}

const DAILY_REFERENCES: PredictionReference[] = [
  { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
  { source: 'Planets in Transit', type: 'book', tradition: 'western' },
  { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
  { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
  { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
];

const TRANSIT_PLANET_WEIGHTS: Record<Planet, number> = {
  Sun: 1.6,
  Moon: 1.4,
  Mercury: 1.8,
  Venus: 2,
  Mars: 2.1,
  Jupiter: 2.8,
  Saturn: 3,
  Uranus: 1.4,
  Neptune: 1.2,
  Pluto: 1.2,
  NorthNode: 2.4,
  SouthNode: 2.2,
};

const ASPECT_CONFIG: Record<string, { maxOrb: number; support: number; tension: number }> = {
  conjunction: { maxOrb: 6, support: 1.1, tension: 0.2 },
  trine: { maxOrb: 6, support: 1, tension: 0 },
  sextile: { maxOrb: 4, support: 0.82, tension: 0 },
  square: { maxOrb: 5, support: 0.1, tension: 1 },
  opposition: { maxOrb: 6, support: 0.2, tension: 0.9 },
};

const AREA_LABELS: Record<ForecastArea, string> = {
  career: 'work and direction',
  love: 'closeness and connection',
  wellness: 'rest, nervous system, and pace',
  wealth: 'resources and earning decisions',
  education: 'learning and communication',
  travel: 'movement and perspective shifts',
};

const AREA_PROMPTS: Record<ForecastArea, string> = {
  career: 'commit to the move that already deserves your focus',
  love: 'say the honest thing before the mood slips past it',
  wellness: 'protect your pace before the day asks for too much',
  wealth: 'choose the option that adds stability, not drama',
  education: 'write things down while insight is still clear',
  travel: 'leave margin around movement and keep your plan flexible',
};

const AFFIRMATIONS: Record<ForecastArea, string> = {
  career: 'I move with timing, clarity, and earned confidence.',
  love: 'I let closeness deepen through honesty and steady warmth.',
  wellness: 'I protect my energy so my best signal stays clear.',
  wealth: 'I choose the path that compounds stability over time.',
  education: 'I trust the ideas that keep returning for a reason.',
  travel: 'I stay open to movement without losing my center.',
};

const DASHA_THEMES: Record<DashaPlanet, string> = {
  Ketu: 'release, spiritual pruning, and cleaner priorities',
  Venus: 'relationships, beauty, pleasure, and value alignment',
  Sun: 'visibility, self-respect, and leadership',
  Moon: 'emotional processing, care, and inner regulation',
  Mars: 'courage, friction, and decisive action',
  Rahu: 'ambition, experimentation, and fast-moving change',
  Jupiter: 'growth, teaching, belief, and wider horizons',
  Saturn: 'discipline, structure, and earned progress',
  Mercury: 'planning, writing, trade, and sharper decisions',
};

const DIRECTION_BY_ELEMENT: Record<ChineseElement, string> = {
  Wood: 'East',
  Fire: 'South',
  Earth: 'Center',
  Metal: 'West',
  Water: 'North',
};

const MONTH_ELEMENT: ChineseElement[] = [
  'Water',
  'Wood',
  'Wood',
  'Fire',
  'Fire',
  'Earth',
  'Earth',
  'Metal',
  'Metal',
  'Water',
  'Water',
  'Earth',
];

const DAILY_READING_VERSION = 3;

const ELEMENT_STYLE: Record<string, string> = {
  Fire: 'move boldly while the signal is clear',
  Earth: 'make the practical next step tangible',
  Air: 'name the pattern and act from clarity',
  Water: 'trust emotional timing over outside noise',
};

const MODALITY_STYLE: Record<string, string> = {
  Cardinal: 'initiate instead of circling',
  Fixed: 'stay with the choice once it proves itself',
  Mutable: 'adapt without scattering your attention',
};

const ANIMAL_STYLE: Record<string, string> = {
  Rat: 'pattern recognition and quick pivots',
  Ox: 'consistency and durable follow-through',
  Tiger: 'courage and instinctive movement',
  Rabbit: 'soft power and social timing',
  Dragon: 'presence and larger-than-average momentum',
  Snake: 'precision and selective disclosure',
  Horse: 'freedom and decisive motion',
  Goat: 'sensitivity and atmosphere awareness',
  Monkey: 'ingenuity and tactical adjustments',
  Rooster: 'discernment and sharper standards',
  Dog: 'loyalty and protective judgment',
  Pig: 'warmth and grounded receptivity',
};

const AREA_AIM: Record<ForecastArea, string> = {
  career: 'the work that changes your trajectory',
  love: 'the conversation that deepens trust',
  wellness: 'the rhythm that keeps you regulated',
  wealth: 'the decision that protects stability',
  education: 'the idea worth capturing before it fades',
  travel: 'the movement that widens perspective without draining you',
};

const DEFAULT_REMEDIES: Record<DashaPlanet, Remedy> = {
  Sun: {
    type: 'ritual',
    name: 'Sunrise offering',
    description: 'Take a quiet sunrise pause and start the day with one clear intention.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Moon: {
    type: 'ritual',
    name: 'Water reset',
    description: 'Slow the evening down with water, silence, and a lighter emotional load.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Mars: {
    type: 'ritual',
    name: 'Directed movement',
    description: 'Use physical movement to release pressure before making sharp decisions.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Mercury: {
    type: 'ritual',
    name: 'Morning note',
    description: 'Write the three decisions that matter most before distractions multiply.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Jupiter: {
    type: 'ritual',
    name: 'Teacher offering',
    description: 'Make time for study, guidance, or one generous act that widens your perspective.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Venus: {
    type: 'ritual',
    name: 'Beauty and ease',
    description: 'Choose one act of beauty or care that makes your space feel softer and more deliberate.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Saturn: {
    type: 'ritual',
    name: 'Structure block',
    description: 'Give one demanding responsibility your first clean hour instead of postponing it.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Rahu: {
    type: 'ritual',
    name: 'Impulse filter',
    description: 'Pause before saying yes to intensity. Let the signal settle before you chase it.',
    source: 'Brihat Parashara Hora Shastra',
  },
  Ketu: {
    type: 'ritual',
    name: 'Release list',
    description: 'Name one thing you can stop feeding so your attention returns to what matters.',
    source: 'Brihat Parashara Hora Shastra',
  },
};

function mergeWesternProfile(primary?: WesternProfile, fallback?: WesternProfile): WesternProfile | undefined {
  if (!primary && !fallback) return undefined;
  return {
    sun: primary?.sun ?? fallback?.sun ?? 'Leo',
    moon: primary?.moon ?? fallback?.moon ?? 'Cancer',
    rising: primary?.rising ?? fallback?.rising,
    element: primary?.element ?? fallback?.element ?? 'Fire',
    modality: primary?.modality ?? fallback?.modality ?? 'Cardinal',
    planets: primary?.planets?.length ? primary.planets : fallback?.planets ?? [],
    houses: primary?.houses?.length ? primary.houses : fallback?.houses,
  };
}

function mergeVedicProfile(primary?: VedicProfile, fallback?: VedicProfile): VedicProfile | undefined {
  if (!primary && !fallback) return undefined;
  const dashas = primary?.dashas && primary.dashas.length > 1 ? primary.dashas : fallback?.dashas ?? primary?.dashas ?? [];
  const currentDasha =
    primary?.currentDasha ??
    fallback?.currentDasha ??
    dashas[0] ?? {
      planet: 'Sun',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 6),
    };
  return {
    rashi: primary?.rashi ?? fallback?.rashi ?? 'Simha',
    nakshatra: primary?.nakshatra ?? fallback?.nakshatra ?? 'Magha',
    nakshatraPada: primary?.nakshatraPada ?? fallback?.nakshatraPada ?? 1,
    moonSign: primary?.moonSign ?? fallback?.moonSign ?? primary?.rashi ?? fallback?.rashi ?? 'Simha',
    dashas,
    currentDasha,
    remedies: primary?.remedies?.length ? primary.remedies : fallback?.remedies ?? [],
  };
}

function mergeChineseProfile(primary?: ChineseProfile, fallback?: ChineseProfile): ChineseProfile | undefined {
  if (!primary && !fallback) return undefined;
  return {
    animal: primary?.animal ?? fallback?.animal ?? 'Dragon',
    element: primary?.element ?? fallback?.element ?? 'Wood',
    yinYang: primary?.yinYang ?? fallback?.yinYang ?? 'Yang',
    pillars: primary?.pillars ?? fallback?.pillars,
    luckyNumbers: primary?.luckyNumbers?.length ? primary.luckyNumbers : fallback?.luckyNumbers ?? [],
    luckyColors: primary?.luckyColors?.length ? primary.luckyColors : fallback?.luckyColors ?? [],
    compatibleAnimals: primary?.compatibleAnimals?.length ? primary.compatibleAnimals : fallback?.compatibleAnimals ?? [],
    incompatibleAnimals: primary?.incompatibleAnimals?.length ? primary.incompatibleAnimals : fallback?.incompatibleAnimals ?? [],
  };
}

function mergeKPProfile(primary?: KPProfile, fallback?: KPProfile): KPProfile | undefined {
  if (!primary && !fallback) return undefined;
  return {
    sublords: primary?.sublords?.length ? primary.sublords : fallback?.sublords ?? [],
    cusps: primary?.cusps?.length ? primary.cusps : fallback?.cusps ?? [],
    significators: primary?.significators?.length ? primary.significators : fallback?.significators ?? [],
    predictions: primary?.predictions?.length ? primary.predictions : fallback?.predictions ?? [],
  };
}

export function buildForecastProfile(user: Pick<UserProfile, 'birthDetails' | 'western' | 'vedic' | 'chinese' | 'kp'>): Partial<CosmicProfile> | null {
  const rawBirthDate = user.birthDetails?.date;
  const birthDate = rawBirthDate ? new Date(rawBirthDate) : null;
  const localProfile =
    birthDate && !Number.isNaN(birthDate.getTime())
      ? calculateCosmicProfile(
          birthDate,
          user.birthDetails?.time,
          user.birthDetails?.place?.lat,
          user.birthDetails?.place?.lng,
        )
      : null;

  const western = mergeWesternProfile(user.western, localProfile?.western);
  const vedic = mergeVedicProfile(user.vedic, localProfile?.vedic);
  const chinese = mergeChineseProfile(user.chinese, localProfile?.chinese);
  const kp = mergeKPProfile(user.kp, localProfile?.kp);

  if (!western || !vedic || !chinese) return null;
  return { western, vedic, chinese, kp };
}

function scoreHit(hit: TransitHit): { support: number; tension: number } {
  const config = ASPECT_CONFIG[hit.aspect];
  const baseWeight = TRANSIT_PLANET_WEIGHTS[hit.transitPlanet] ?? 1.5;
  const closeness = Math.max(0.2, 1 - hit.orb / config.maxOrb);
  return {
    support: Number((baseWeight * closeness * config.support).toFixed(2)),
    tension: Number((baseWeight * closeness * config.tension).toFixed(2)),
  };
}

function addPlanetAreaWeights(scores: Record<ForecastArea, number>, planet: Planet, multiplier: number) {
  const apply = (area: ForecastArea, value: number) => {
    scores[area] += value * multiplier;
  };

  switch (planet) {
    case 'Sun':
      apply('career', 1.8);
      apply('wellness', 0.7);
      break;
    case 'Moon':
      apply('love', 1.2);
      apply('wellness', 1.8);
      break;
    case 'Mercury':
      apply('career', 1.2);
      apply('education', 2);
      apply('wealth', 0.8);
      break;
    case 'Venus':
      apply('love', 2.1);
      apply('wealth', 0.9);
      apply('wellness', 0.8);
      break;
    case 'Mars':
      apply('career', 2);
      apply('wellness', 1.1);
      break;
    case 'Jupiter':
      apply('career', 1.2);
      apply('wealth', 1.5);
      apply('education', 1.6);
      apply('travel', 1.4);
      break;
    case 'Saturn':
      apply('career', 1.8);
      apply('wealth', 1.2);
      apply('wellness', 0.9);
      break;
    case 'NorthNode':
      apply('travel', 1.5);
      apply('career', 1.3);
      break;
    case 'SouthNode':
      apply('wellness', 1.2);
      apply('travel', 0.9);
      break;
    default:
      apply('career', 1);
      break;
  }
}

function getPrimaryArea(hits: TransitHit[]): ForecastArea {
  const scores: Record<ForecastArea, number> = {
    career: 0,
    love: 0,
    wellness: 0,
    wealth: 0,
    education: 0,
    travel: 0,
  };

  for (const hit of hits) {
    const impact = scoreHit(hit);
    const multiplier = Math.max(impact.support, impact.tension);
    addPlanetAreaWeights(scores, hit.transitPlanet, multiplier);
    addPlanetAreaWeights(scores, hit.natalPlanet, multiplier * 0.8);
  }

  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'career') as ForecastArea;
}

function findAreaHit(hits: TransitHit[], area: ForecastArea) {
  return hits.find((hit) => getPrimaryArea([hit]) === area) ?? hits[0];
}

function getCurrentDashaPlanet(profile: Partial<CosmicProfile>): DashaPlanet {
  const currentDashaPlanet = profile.vedic?.currentDasha?.planet;
  if (currentDashaPlanet) return currentDashaPlanet;
  return profile.vedic?.dashas?.find((period) => period?.planet)?.planet ?? 'Sun';
}

export function getCurrentSubPeriod(profile: Partial<CosmicProfile>, date: Date) {
  const current = profile.vedic?.currentDasha;
  if (!current?.subPeriods?.length) return undefined;
  const now = date.getTime();
  return current.subPeriods.find(
    (period) => now >= new Date(period.startDate).getTime() && now < new Date(period.endDate).getTime(),
  );
}

function getRemedy(profile: Partial<CosmicProfile>): Remedy {
  const dashaPlanet = getCurrentDashaPlanet(profile);
  return profile.vedic?.remedies?.[0] ?? DEFAULT_REMEDIES[dashaPlanet];
}

function getMantra(profile: Partial<CosmicProfile>, remedy: Remedy) {
  if (remedy.type === 'mantra') return remedy.name;
  const dashaPlanet = getCurrentDashaPlanet(profile);
  return {
    Sun: 'Om Suryaya Namah',
    Moon: 'Om Chandraya Namah',
    Mars: 'Om Mangalaya Namah',
    Mercury: 'Om Budhaya Namah',
    Jupiter: 'Om Gurave Namah',
    Venus: 'Om Shukraya Namah',
    Saturn: 'Om Shanaye Namah',
    Rahu: 'Om Rahave Namah',
    Ketu: 'Om Ketave Namah',
  }[dashaPlanet];
}

function formatDriver(hit: TransitHit) {
  return `${hit.transitPlanet} ${hit.aspect} natal ${hit.natalPlanet}`;
}

function getHitFocus(hit?: TransitHit) {
  if (!hit) return 'the clearest signal in your chart';
  const interpretation = hit.interpretation?.trim();
  return interpretation ? `${formatDriver(hit)}. ${interpretation}` : formatDriver(hit);
}

function getWesternSignature(profile: Partial<CosmicProfile>) {
  const sun = profile.western?.sun ?? 'Leo';
  const moon = profile.western?.moon ?? 'Cancer';
  const rising = profile.western?.rising ? `${profile.western.rising} rising` : `${profile.western?.element ?? 'Fire'} emphasis`;
  return `${sun} Sun, ${moon} Moon, and ${rising}`;
}

function getStyleCue(profile: Partial<CosmicProfile>) {
  const element = profile.western?.element ?? 'Fire';
  const modality = profile.western?.modality ?? 'Cardinal';
  return `${ELEMENT_STYLE[element] ?? 'move with cleaner timing'} and ${MODALITY_STYLE[modality] ?? 'keep your attention coordinated'}`;
}

function buildAffirmation(area: ForecastArea, profile: Partial<CosmicProfile>) {
  const dashaPlanet = getCurrentDashaPlanet(profile);
  return `${AFFIRMATIONS[area]} ${dashaPlanet} timing supports ${AREA_AIM[area]}.`;
}

function formatRange(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getMonthElement(date: Date): ChineseElement {
  return MONTH_ELEMENT[date.getMonth()] ?? 'Earth';
}

function getKPLead(profile: Partial<CosmicProfile>, preferredArea?: ForecastArea) {
  const predictions = [...(profile.kp?.predictions ?? [])];
  if (!predictions.length) return undefined;

  if (preferredArea) {
    return (
      predictions
        .filter((prediction) => prediction.area === preferredArea || (preferredArea === 'wellness' && prediction.area === 'health'))
        .sort((a, b) => b.confidence - a.confidence)[0] ??
      predictions.sort((a, b) => b.confidence - a.confidence)[0]
    );
  }

  return predictions.sort((a, b) => b.confidence - a.confidence)[0];
}

export function buildDailySnapshot(profile: Partial<CosmicProfile>, date: Date): DailySignalSnapshot {
  const hits = profile.western?.planets?.length ? findActiveTransits(profile.western.planets, date) : [];
  const supportHits = hits.filter((hit) => hit.aspect !== 'square' && hit.aspect !== 'opposition');
  const challengeHits = hits.filter((hit) => hit.aspect === 'square' || hit.aspect === 'opposition');
  const supportScore = supportHits.reduce((sum, hit) => sum + scoreHit(hit).support, 0);
  const challengeScore = challengeHits.reduce((sum, hit) => sum + scoreHit(hit).tension, 0);

  return {
    date,
    hits,
    supportHits,
    challengeHits,
    supportArea: getPrimaryArea(supportHits.length ? supportHits : hits),
    challengeArea: getPrimaryArea(challengeHits.length ? challengeHits : hits),
    supportScore: Number(supportScore.toFixed(2)),
    challengeScore: Number(challengeScore.toFixed(2)),
  };
}

function getChinesePulse(profile: Partial<CosmicProfile>, date: Date) {
  const monthElement = getMonthElement(date);
  const nativeElement = profile.chinese?.element ?? 'Wood';
  const animal = profile.chinese?.animal ?? 'Dragon';
  const elementMatch = monthElement === nativeElement;
  return {
    monthElement,
    text: elementMatch
      ? `${monthElement} season doubles down on your ${nativeElement} nature, so momentum comes from doing less but more cleanly.`
      : `${monthElement} season asks your ${nativeElement} ${animal} pattern to adapt instead of forcing the pace.`,
    animalText: `Your ${animal} instinct works best when you lean on ${ANIMAL_STYLE[animal] ?? 'clean timing and steady focus'}.`,
    direction: DIRECTION_BY_ELEMENT[monthElement],
  };
}

export function generateSignalDailyReading(date: Date, profile: Partial<CosmicProfile>): DailyReading {
  const snapshot = buildDailySnapshot(profile, date);
  const western = profile.western;
  const vedic = profile.vedic;
  const chinese = profile.chinese;
  const topSupport = snapshot.supportHits[0] ?? snapshot.hits[0];
  const loveHit = findAreaHit(snapshot.supportHits, 'love');
  const careerHit = findAreaHit(snapshot.supportHits, 'career');
  const wellnessHit = findAreaHit(snapshot.challengeHits, 'wellness') ?? findAreaHit(snapshot.supportHits, 'wellness');
  const dashaPlanet = getCurrentDashaPlanet(profile);
  const remedy = getRemedy(profile);
  const subPeriod = getCurrentSubPeriod(profile, date);
  const kpLead = getKPLead(profile, snapshot.supportArea);
  const chinesePulse = getChinesePulse(profile, date);
  const signature = getWesternSignature(profile);
  const styleCue = getStyleCue(profile);
  const cautionHit = snapshot.challengeHits[0];
  const cosmicVibe = topSupport
    ? `${getHitFocus(topSupport)} is live for your ${signature} chart, so today is not generic for you. Lean into ${AREA_AIM[snapshot.supportArea]} and ${styleCue}.`
    : `${signature} meets ${dashaPlanet} timing through ${styleCue}, so the day rewards steadier attention than usual.`;

  const shareText = `${cosmicVibe} | ${(western?.sun ?? 'Leo')} + ${(vedic?.rashi ?? 'Simha')} + ${(chinese?.animal ?? 'Dragon')} | CosmicSelf`;
  const positivityScore = Number(
    Math.max(0.62, Math.min(0.92, 0.74 + snapshot.supportScore * 0.018 - snapshot.challengeScore * 0.014)).toFixed(2),
  );

  return {
    version: DAILY_READING_VERSION,
    date: getDateKey(date),
    western: {
      overall: topSupport
        ? `${getHitFocus(topSupport)} is setting the western tone. For your ${signature} makeup, the right move is to ${AREA_PROMPTS[snapshot.supportArea]}.`
        : `Your ${signature} makeup does best today when you ${styleCue}.`,
      love: loveHit
        ? `${getHitFocus(loveHit)} softens relationship dynamics. Let your ${western?.moon ?? 'Cancer'} Moon do less performing and more real relating.`
        : `Love responds better to your ${western?.moon ?? 'Cancer'} Moon when you stay warm, direct, and unforced.`,
      career: careerHit
        ? `${getHitFocus(careerHit)} supports work and visibility. Back ${AREA_AIM.career} instead of spreading effort everywhere.`
        : `Career improves when your ${western?.element ?? 'Fire'} nature stops multitasking and commits to one consequential move.`,
      wellness: wellnessHit
        ? `${getHitFocus(wellnessHit)} is asking for pace management. ${cautionHit ? `The main pressure point is ${getHitFocus(cautionHit)}.` : 'Slow the nervous system before you answer every demand.'}`
        : `Your body responds best when you ${AREA_PROMPTS.wellness} and let rhythm beat urgency.`,
      luckyNumber: ((date.getDate() + Math.round(snapshot.supportScore * 3) + date.getMonth()) % 9) + 1,
    },
    vedic: {
      dasha: `${dashaPlanet} Mahadasha is the timing engine today, emphasizing ${DASHA_THEMES[dashaPlanet]} for a ${vedic?.rashi ?? 'Simha'} native with ${western?.sun ?? 'Leo'} solar emphasis.`,
      nakshatra: subPeriod
        ? `${vedic?.nakshatra ?? 'Magha'} Nakshatra in pada ${vedic?.nakshatraPada ?? 1} is filtered through a ${subPeriod.planet} sub-period, so small precise moves outperform dramatic ones.`
        : `${vedic?.nakshatra ?? 'Magha'} Nakshatra asks for steadier attention than louder action today.`,
      remedy,
      mantra: getMantra(profile, remedy),
    },
    kp: {
      eventTiming: kpLead
        ? `KP timing is sharpest around ${kpLead.area === 'health' ? 'wellness' : kpLead.area} matters today, which is why the clean opening may look small but land hard.`
        : `KP timing favors deliberate action once the mood of the day settles.`,
      significatorInsight: kpLead?.prediction ?? `Your significators support exact choices over scattered effort, especially around ${AREA_LABELS[snapshot.supportArea]}.`,
      sublordGuidance: kpLead
        ? `Let ${kpLead.area === 'health' ? 'wellness' : kpLead.area} decisions happen when the room feels quieter, not when it feels urgent.`
        : 'Trust the first clean opening, not the loudest one.',
    },
    chinese: {
      element: `${chinesePulse.text} ${chinese?.yinYang ?? 'Yang'} energy in you is strongest when you ${AREA_PROMPTS[snapshot.supportArea]}.`,
      animal: `Your ${chinese?.animal ?? 'Dragon'} pattern leans on ${ANIMAL_STYLE[chinese?.animal ?? 'Dragon'] ?? 'clean instinct and timing'} today.`,
      luckyDirection: chinesePulse.direction,
    },
    unified: {
      cosmicVibe,
      affirmation: buildAffirmation(snapshot.supportArea, profile),
      shareText,
    },
    references: DAILY_REFERENCES,
    positivityScore,
  };
}

export function getForecastWindowDates(date: Date, window: 'week' | 'month') {
  const length = window === 'week' ? 7 : 30;
  return Array.from({ length }, (_, index) => addDays(date, index));
}

export function getWindowSamples(profile: Partial<CosmicProfile>, date: Date, window: 'week' | 'month') {
  return getForecastWindowDates(date, window).map((sampleDate) => buildDailySnapshot(profile, sampleDate));
}

export function getWindowRange(samples: DailySignalSnapshot[], mode: 'support' | 'challenge', span: number) {
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestStart = 0;

  for (let index = 0; index <= samples.length - span; index += 1) {
    const subset = samples.slice(index, index + span);
    const score = subset.reduce((sum, sample) => {
      const base = mode === 'support'
        ? sample.supportScore - sample.challengeScore * 0.35
        : sample.challengeScore - sample.supportScore * 0.2;
      return sum + base;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestStart = index;
    }
  }

  const start = samples[bestStart]?.date ?? new Date();
  const end = samples[Math.min(samples.length - 1, bestStart + span - 1)]?.date ?? start;
  return {
    start,
    end,
    label: formatRange(start, end),
  };
}

export function getForecastDrivers(samples: DailySignalSnapshot[]) {
  const counts = new Map<string, number>();
  for (const sample of samples) {
    const driver = sample.supportHits[0] ?? sample.challengeHits[0];
    if (!driver) continue;
    const label = formatDriver(driver);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}

export function getDominantArea(samples: DailySignalSnapshot[], field: 'supportArea' | 'challengeArea') {
  const counts = new Map<ForecastArea, number>();
  for (const sample of samples) {
    const area = sample[field];
    counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'career';
}

export function getNextDashaShift(profile: Partial<CosmicProfile>, date: Date, daysAhead: number) {
  const end = addDays(date, daysAhead).getTime();
  return profile.vedic?.dashas?.find((period) => {
    const start = new Date(period.startDate).getTime();
    return start > date.getTime() && start <= end;
  });
}
