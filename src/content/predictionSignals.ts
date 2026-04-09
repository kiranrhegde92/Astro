import { calculateCosmicProfile } from '../engines/unified';
import { findActiveTransits, getCurrentTransits, type TransitHit } from '../engines/common/transits';
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

const AREA_HEADLINES: Record<ForecastArea, string> = {
  career: 'Career and decision-making have the cleanest opening today.',
  love: 'Connection and emotional honesty are the live edge of the day.',
  wellness: 'The day works best when your pace stays protected.',
  wealth: 'Money and value decisions need a calmer hand today.',
  education: 'Thinking, writing, and conversation carry the strongest signal.',
  travel: 'Movement and perspective shifts want flexibility today.',
};

const AREA_WARNINGS: Record<ForecastArea, string> = {
  career: 'Avoid reacting to pressure or taking on too many serious priorities at once.',
  love: 'Avoid distance, scorekeeping, or reading silence too quickly.',
  wellness: 'Avoid letting the schedule outrun your body.',
  wealth: 'Avoid spending, promising, or negotiating from an emotional spike.',
  education: 'Avoid too many inputs without enough synthesis.',
  travel: 'Avoid rigid timing or rushing movement that needs margin.',
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

const DAILY_READING_VERSION = 4;

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

function buildTone(snapshot: DailySignalSnapshot): 'Opening' | 'Mixed' | 'Pressurized' {
  if (snapshot.supportScore >= snapshot.challengeScore * 1.35) return 'Opening';
  if (snapshot.challengeScore >= snapshot.supportScore * 1.1) return 'Pressurized';
  return 'Mixed';
}

function buildEvidenceLine(
  topSupport: TransitHit | undefined,
  cautionHit: TransitHit | undefined,
  dashaPlanet: DashaPlanet,
) {
  if (topSupport && cautionHit) {
    return `${topSupport.transitPlanet} ${formatAspectSymbol(topSupport.aspect)} ${topSupport.natalPlanet} opens the day, while ${cautionHit.transitPlanet} ${formatAspectSymbol(cautionHit.aspect)} ${cautionHit.natalPlanet} adds pressure. ${dashaPlanet} Mahadasha sets the longer rhythm.`;
  }

  if (topSupport) {
    return `${topSupport.transitPlanet} ${formatAspectSymbol(topSupport.aspect)} ${topSupport.natalPlanet} is the clearest live signal in your chart today. ${dashaPlanet} Mahadasha keeps the background tone steady.`;
  }

  if (cautionHit) {
    return `${cautionHit.transitPlanet} ${formatAspectSymbol(cautionHit.aspect)} ${cautionHit.natalPlanet} is the main strain line today. ${dashaPlanet} Mahadasha says timing still matters more than force.`;
  }

  return `${dashaPlanet} Mahadasha is carrying more weight than short-term transit noise today.`;
}

function buildCosmicVibe(
  supportArea: ForecastArea,
  challengeArea: ForecastArea,
  topSupport: TransitHit | undefined,
  cautionHit: TransitHit | undefined,
  dashaPlanet: DashaPlanet,
) {
  const opening = AREA_HEADLINES[supportArea];
  const supportLine = topSupport
    ? `${topSupport.transitPlanet} ${formatAspectSymbol(topSupport.aspect)} ${topSupport.natalPlanet} is the clearest opening.`
    : `${dashaPlanet} Mahadasha is doing more of the work than the fast-moving sky.`;
  const cautionLine = cautionHit
    ? `Move slower around ${AREA_LABELS[challengeArea]}.`
    : 'Protect your pace and let the day stay deliberate.';

  return `${opening} ${supportLine} ${cautionLine}`;
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

function formatAspectSymbol(aspect: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌', trine: '△', sextile: '⚹', square: '□', opposition: '☍',
  };
  return symbols[aspect] ?? aspect;
}

function classifyHit(hit: TransitHit): 'support' | 'tension' | 'neutral' {
  if (hit.aspect === 'square' || hit.aspect === 'opposition') return 'tension';
  if (hit.aspect === 'trine' || hit.aspect === 'sextile') return 'support';
  return 'neutral';
}

function briefTransit(hit: TransitHit): string {
  const nature = classifyHit(hit);
  const symbol = formatAspectSymbol(hit.aspect);
  if (nature === 'support') return `${hit.transitPlanet} ${symbol} ${hit.natalPlanet} — flowing energy, ${hit.orb.toFixed(1)}° orb`;
  if (nature === 'tension') return `${hit.transitPlanet} ${symbol} ${hit.natalPlanet} — productive friction, ${hit.orb.toFixed(1)}° orb`;
  return `${hit.transitPlanet} ${symbol} ${hit.natalPlanet} — intensified focus, ${hit.orb.toFixed(1)}° orb`;
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
  const tone = buildTone(snapshot);
  const activeCount = snapshot.hits.length;
  const supportCount = snapshot.supportHits.length;
  const challengeCount = snapshot.challengeHits.length;
  const topTransitLabel = topSupport ? `${topSupport.transitPlanet} ${formatAspectSymbol(topSupport.aspect)} natal ${topSupport.natalPlanet} (${topSupport.orb.toFixed(1)} deg)` : '';
  const headline = AREA_HEADLINES[snapshot.supportArea];
  const evidenceLine = buildEvidenceLine(topSupport, cautionHit, dashaPlanet);
  const cosmicVibe = buildCosmicVibe(snapshot.supportArea, snapshot.challengeArea, topSupport, cautionHit, dashaPlanet);

  const focusArea = AREA_LABELS[snapshot.supportArea];
  const focusAdvice = AREA_PROMPTS[snapshot.supportArea];
  const bestUse = `Use the day for ${AREA_AIM[snapshot.supportArea]}.`;
  const watchFor = cautionHit
    ? `${AREA_WARNINGS[snapshot.challengeArea]} The pressure point is ${cautionHit.transitPlanet} ${formatAspectSymbol(cautionHit.aspect)} ${cautionHit.natalPlanet}.`
    : AREA_WARNINGS[snapshot.challengeArea];
  const timingNote = kpLead
    ? `KP timing is sharpest around ${kpLead.area === 'health' ? 'wellness' : kpLead.area} matters, while ${dashaPlanet} Mahadasha keeps the broader tempo on ${DASHA_THEMES[dashaPlanet]}.`
    : `${dashaPlanet} Mahadasha keeps the day centered on ${DASHA_THEMES[dashaPlanet]}.`;

  const shareText = `${topTransitLabel || signature} | ${activeCount} active transits | ${(western?.sun ?? 'Leo')} + ${(vedic?.rashi ?? 'Simha')} + ${(chinese?.animal ?? 'Dragon')} | CosmicSelf`;
  const positivityScore = Number(
    Math.max(0.62, Math.min(0.92, 0.74 + snapshot.supportScore * 0.018 - snapshot.challengeScore * 0.014)).toFixed(2),
  );

  const activeTransits = snapshot.hits.slice(0, 4).map((hit) => ({
    transitPlanet: hit.transitPlanet,
    natalPlanet: hit.natalPlanet,
    aspect: hit.aspect,
    orb: hit.orb,
    nature: classifyHit(hit),
    brief: briefTransit(hit),
  }));

  const transitPositions = getCurrentTransits(date).map((p: any) => ({
    planet: p.planet,
    sign: p.sign,
    degree: Math.round(p.degree * 10) / 10,
    retrograde: p.retrograde || false,
  }));

  return {
    version: DAILY_READING_VERSION,
    date: getDateKey(date),
    western: {
      overall: topSupport
        ? `${topSupport.transitPlanet} ${formatAspectSymbol(topSupport.aspect)} natal ${topSupport.natalPlanet} (${topSupport.orb.toFixed(1)}° orb) sets today's western tone. For ${signature}: ${AREA_PROMPTS[snapshot.supportArea]}.`
        : `${signature} placements favour a steady approach today — ${styleCue}.`,
      love: loveHit
        ? `${loveHit.transitPlanet} ${formatAspectSymbol(loveHit.aspect)} ${loveHit.natalPlanet} (${loveHit.orb.toFixed(1)}°) activates relationship themes. Your ${western?.moon ?? 'Cancer'} Moon benefits from direct, unhurried connection.`
        : `No strong love transits today. Your ${western?.moon ?? 'Cancer'} Moon does best with warm, low-pressure relating.`,
      career: careerHit
        ? `${careerHit.transitPlanet} ${formatAspectSymbol(careerHit.aspect)} ${careerHit.natalPlanet} (${careerHit.orb.toFixed(1)}°) supports professional visibility. Commit to ${AREA_AIM.career}.`
        : `Career sector is quiet today. Your ${western?.element ?? 'Fire'} nature benefits from focused, single-task mode.`,
      wellness: wellnessHit
        ? `${wellnessHit.transitPlanet} ${formatAspectSymbol(wellnessHit.aspect)} ${wellnessHit.natalPlanet} (${wellnessHit.orb.toFixed(1)}°) flags pace management.${cautionHit ? ` Watch for tension from ${cautionHit.transitPlanet} ${formatAspectSymbol(cautionHit.aspect)} ${cautionHit.natalPlanet}.` : ''}`
        : `No stress transits active. Good day to ${AREA_PROMPTS.wellness}.`,
      luckyNumber: ((date.getDate() + Math.round(snapshot.supportScore * 3) + date.getMonth()) % 9) + 1,
    },
    vedic: {
      dasha: `${dashaPlanet} Mahadasha active — themes of ${DASHA_THEMES[dashaPlanet]}. ${vedic?.rashi ?? 'Simha'} rashi with ${western?.sun ?? 'Leo'} Sun.`,
      nakshatra: subPeriod
        ? `${vedic?.nakshatra ?? 'Magha'} Nakshatra (pada ${vedic?.nakshatraPada ?? 1}) filtered through ${subPeriod.planet} sub-period. Precise moves over bold ones.`
        : `${vedic?.nakshatra ?? 'Magha'} Nakshatra (pada ${vedic?.nakshatraPada ?? 1}). Steady attention beats scattered action.`,
      remedy,
      mantra: getMantra(profile, remedy),
    },
    kp: {
      eventTiming: kpLead
        ? `KP significators highlight ${kpLead.area === 'health' ? 'wellness' : kpLead.area} timing today. Small, well-timed actions land harder than big gestures.`
        : `KP timing favours deliberate action after the day's rhythm settles.`,
      significatorInsight: kpLead?.prediction ?? `Active significators point toward ${AREA_LABELS[snapshot.supportArea]}. Precision over volume.`,
      sublordGuidance: kpLead
        ? `${kpLead.area === 'health' ? 'Wellness' : kpLead.area.charAt(0).toUpperCase() + kpLead.area.slice(1)} decisions work best in calm moments, not urgent ones.`
        : 'Act on the first clear opening, not the loudest signal.',
    },
    chinese: {
      element: `${chinesePulse.text} ${chinese?.yinYang ?? 'Yang'} energy responds to ${AREA_PROMPTS[snapshot.supportArea]}.`,
      animal: `${chinese?.animal ?? 'Dragon'} instinct today: ${ANIMAL_STYLE[chinese?.animal ?? 'Dragon'] ?? 'clean timing and steady focus'}.`,
      luckyDirection: chinesePulse.direction,
    },
    unified: {
      cosmicVibe,
      affirmation: buildAffirmation(snapshot.supportArea, profile),
      shareText,
      focusArea,
      focusAdvice,
      headline,
      evidenceLine,
      bestUse,
      watchFor,
      timingNote,
      tone,
    },
    activeTransits,
    transitPositions,
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
