type SignalArea = 'love' | 'career' | 'wellness';

type TransitSignal = {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  house: number;
  support: number;
  tension: number;
};

const HOUSE_GROUPS: Record<SignalArea, number[]> = {
  love: [5, 7, 11],
  career: [2, 6, 10],
  wellness: [1, 6, 12],
};

const TRANSIT_WEIGHTS: Record<string, number> = {
  SUN: 1.6,
  MOON: 1.4,
  MERCURY: 1.8,
  VENUS: 2,
  MARS: 2.1,
  JUPITER: 2.8,
  SATURN: 3,
  MEAN_NODE: 2.4,
  KETU: 2.2,
};

const DAILY_TRANSIT_TIER: Record<string, number> = {
  MOON: 0,
  SUN: 1,
  MERCURY: 1,
  VENUS: 1,
  MARS: 2,
  JUPITER: 3,
  SATURN: 3,
  MEAN_NODE: 3,
  KETU: 3,
};

const ASPECTS = [
  { name: 'conjunction', angle: 0, maxOrb: 6, support: 1.1, tension: 0.2 },
  { name: 'trine', angle: 120, maxOrb: 6, support: 1, tension: 0 },
  { name: 'sextile', angle: 60, maxOrb: 4, support: 0.82, tension: 0 },
  { name: 'square', angle: 90, maxOrb: 5, support: 0.1, tension: 1 },
  { name: 'opposition', angle: 180, maxOrb: 6, support: 0.2, tension: 0.9 },
];

const DASHA_THEMES: Record<string, string> = {
  Sun: 'visibility, self-respect, and leadership',
  Moon: 'emotional truth, care, and regulation',
  Mars: 'courage, friction, and exact action',
  Mercury: 'planning, writing, and sharper decisions',
  Jupiter: 'growth, teaching, and wider opportunities',
  Venus: 'relationships, beauty, and value alignment',
  Saturn: 'discipline, pressure, and durable progress',
  Rahu: 'ambition, experimentation, and rapid change',
  Ketu: 'release, pruning, and spiritual distance from noise',
};

const AFFIRMATIONS: Record<SignalArea, string> = {
  love: 'I let closeness deepen through honesty and steadiness.',
  career: 'I move with timing, clarity, and earned confidence.',
  wellness: 'I protect my pace so my signal stays clear.',
};

const AREA_HEADLINES: Record<SignalArea, string> = {
  love: 'Connection and emotional honesty are the live edge of the day.',
  career: 'Career and decision-making have the cleanest opening today.',
  wellness: 'The day works best when your pace stays protected.',
};

const AREA_AIMS: Record<SignalArea, string> = {
  love: 'the conversation that deepens trust',
  career: 'the work that changes your trajectory',
  wellness: 'the rhythm that keeps you regulated',
};

const AREA_WARNINGS: Record<SignalArea, string> = {
  love: 'Avoid distance, scorekeeping, or reading silence too quickly.',
  career: 'Avoid reacting to pressure or stacking too many serious priorities at once.',
  wellness: 'Avoid letting the schedule outrun your body.',
};

const MOON_SIGN_CUES: Record<string, string> = {
  Aries: 'start cleanly, act early, and avoid letting impatience choose the pace',
  Taurus: 'stabilize money, food, rest, and the one commitment that needs consistency',
  Gemini: 'keep conversations light enough to stay useful and write down what changes',
  Cancer: 'protect emotional bandwidth and handle home or family matters gently',
  Leo: 'lead visibly, but keep the heart warmer than the performance',
  Virgo: 'sort details, reduce clutter, and make one practical adjustment',
  Libra: 'choose balance in conversations before small tensions become bigger than needed',
  Scorpio: 'keep depth without suspicion and move carefully around intense reactions',
  Sagittarius: 'make room for learning, movement, and the wider perspective',
  Capricorn: 'prioritize responsibility, timing, and the task that builds trust',
  Aquarius: 'look for the cleaner pattern and leave space for a different solution',
  Pisces: 'soften the pace, listen inwardly, and avoid absorbing every mood around you',
};

const MONTH_ELEMENTS = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'];
const DAILY_READING_VERSION = 5;

const DIRECTION_BY_ELEMENT: Record<string, string> = {
  Wood: 'East',
  Fire: 'South',
  Earth: 'Center',
  Metal: 'West',
  Water: 'North',
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity and body',
  2: 'money and self-worth',
  3: 'messages and movement',
  4: 'home and emotional base',
  5: 'romance and creativity',
  6: 'workload and health routines',
  7: 'partnership and mirrors',
  8: 'shared power and deeper trust',
  9: 'belief, learning, and travel',
  10: 'career and visibility',
  11: 'friends, networks, and future plans',
  12: 'rest, closure, and inner repair',
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

function toLongitude(sign: string, degree: number) {
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = SIGNS.indexOf(sign);
  return ((signIndex < 0 ? 0 : signIndex) * 30) + (degree ?? 0);
}

function formatPlanet(planet: string) {
  const labels: Record<string, string> = {
    MEAN_NODE: 'Rahu',
    KETU: 'Ketu',
    SUN: 'Sun',
    MOON: 'Moon',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
  };
  return labels[planet] ?? planet;
}

function formatSignal(signal: Pick<TransitSignal, 'transitPlanet' | 'natalPlanet' | 'aspect'>) {
  return `${formatPlanet(signal.transitPlanet)} ${signal.aspect} natal ${formatPlanet(signal.natalPlanet)}`;
}

function getSignalFocus(signal?: TransitSignal) {
  if (!signal) return 'the clearest signal in your chart';
  return `${formatSignal(signal)} in the zone of ${HOUSE_THEMES[signal.house] ?? 'timing and priorities'}`;
}

function getLiveMoonNote(transits: Record<string, any>) {
  const moon = transits.MOON;
  const sign = String(moon?.sign ?? 'Cancer');
  const degree = Math.round(Number(moon?.degree ?? 0) * 10) / 10;
  return `Live Moon in ${sign} (${degree.toFixed(1)} deg) asks you to ${MOON_SIGN_CUES[sign] ?? 'protect emotional pace and respond with care'}.`;
}

function getWesternSignature(chart: any) {
  const sun = chart.western?.sun ?? 'Aries';
  const moon = chart.western?.moon ?? 'Cancer';
  const rising = chart.western?.rising ? `${chart.western.rising} rising` : `${chart.western?.dominantElement ?? 'Fire'} emphasis`;
  return `${sun} Sun, ${moon} Moon, and ${rising}`;
}

function buildAffirmation(area: SignalArea, chart: any, dashaPlanet: string) {
  return `${AFFIRMATIONS[area]} ${dashaPlanet} timing supports ${area === 'love' ? 'deeper trust' : area === 'career' ? 'decisive progress' : 'cleaner regulation'} today.`;
}

function buildTone(supportScore: number, challengeScore: number): 'Opening' | 'Mixed' | 'Pressurized' {
  if (supportScore >= challengeScore * 1.35) return 'Opening';
  if (challengeScore >= supportScore * 1.1) return 'Pressurized';
  return 'Mixed';
}

function buildEvidenceLine(
  overallSignal: TransitSignal | undefined,
  cautionSignal: TransitSignal | undefined,
  dashaPlanet: string,
) {
  if (overallSignal && cautionSignal) {
    return `${formatSignal(overallSignal)} opens the day, while ${formatSignal(cautionSignal)} adds pressure. ${dashaPlanet} Mahadasha sets the longer rhythm.`;
  }

  if (overallSignal) {
    return `${formatSignal(overallSignal)} is the clearest live signal in your chart today. ${dashaPlanet} Mahadasha keeps the background tone steady.`;
  }

  if (cautionSignal) {
    return `${formatSignal(cautionSignal)} is the main strain line today. ${dashaPlanet} Mahadasha says timing still matters more than force.`;
  }

  return `${dashaPlanet} Mahadasha is carrying more weight than short-term transit noise today.`;
}

function mantraForDasha(planet: string) {
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
  }[planet] ?? 'Om Namah Shivaya';
}

function remedyForDasha(planet: string) {
  return {
    Sun: 'Offer water to the Sun at sunrise and tighten your focus before the day scatters it.',
    Moon: 'Slow the evening down, reduce stimulation, and let water or silence reset your nervous system.',
    Mars: 'Use movement first, then make the difficult decision once pressure has dropped.',
    Mercury: 'Write the three decisions that matter before the feed starts choosing for you.',
    Jupiter: 'Study, teach, or make one generous move that widens your perspective.',
    Venus: 'Choose one act of beauty, softness, or repair that restores value alignment.',
    Saturn: 'Give the hardest responsibility your first clean hour instead of postponing it.',
    Rahu: 'Pause before intensity. The right move survives a slower second look.',
    Ketu: 'Drop one stale obligation so your attention returns to what is real.',
  }[planet] ?? 'Take a quieter start than usual and let the signal settle.';
}

function subLordMeaning(planet: string) {
  return {
    Sun: 'results come through ownership and visibility',
    Moon: 'timing follows emotional clarity and regulation',
    Mars: 'progress responds to decisive but clean action',
    Mercury: 'the opening comes through communication and planning',
    Jupiter: 'growth follows study, generosity, and breadth',
    Venus: 'ease improves when value and relationship choices align',
    Saturn: 'steady effort matters more than speed',
    Rahu: 'unusual doors can open if impulse is filtered first',
    Ketu: 'clarity arrives through subtraction, not accumulation',
  }[planet] ?? 'steady timing matters more than noise';
}

function planetMatchesArea(planet: string, area: SignalArea) {
  const groups: Record<SignalArea, string[]> = {
    love: ['MOON', 'VENUS'],
    career: ['SUN', 'MARS', 'MERCURY', 'JUPITER', 'SATURN'],
    wellness: ['MOON', 'SATURN', 'SUN'],
  };
  return groups[area].includes(planet);
}

function collectSignals(chart: any, transits: Record<string, any>) {
  return Object.entries(transits)
    .filter(([planet]) => ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'MEAN_NODE', 'KETU'].includes(planet))
    .flatMap(([transitPlanet, transitValue]) =>
      Object.entries(chart.western?.planets ?? {}).flatMap(([natalPlanet, natalValue]: [string, any]) => {
        const transitLon = Number((transitValue as any)?.longitude);
        const natalLon = typeof natalValue?.longitude === 'number'
          ? Number(natalValue.longitude)
          : toLongitude(natalValue?.sign, Number(natalValue?.degree ?? 0));

        if (Number.isNaN(transitLon) || Number.isNaN(natalLon)) return [];

        let separation = Math.abs(transitLon - natalLon);
        if (separation > 180) separation = 360 - separation;

        for (const aspect of ASPECTS) {
          const orb = Math.abs(separation - aspect.angle);
          if (orb <= aspect.maxOrb) {
            const closeness = Math.max(0.2, 1 - (orb / aspect.maxOrb));
            const weight = TRANSIT_WEIGHTS[transitPlanet] ?? 1.5;
            return [{
              transitPlanet,
              natalPlanet,
              aspect: aspect.name,
              orb: Number(orb.toFixed(2)),
              house: Number(natalValue?.house ?? 0),
              support: Number((weight * closeness * aspect.support).toFixed(2)),
              tension: Number((weight * closeness * aspect.tension).toFixed(2)),
            } satisfies TransitSignal];
          }
        }

        return [];
      }),
    )
    .sort((a, b) => {
      const tierDiff = (DAILY_TRANSIT_TIER[a.transitPlanet] ?? 2) - (DAILY_TRANSIT_TIER[b.transitPlanet] ?? 2);
      if (tierDiff !== 0) return tierDiff;
      if (a.orb !== b.orb) return a.orb - b.orb;
      return (b.support + b.tension) - (a.support + a.tension);
    });
}

function getAreaSignal(signals: TransitSignal[], area: SignalArea) {
  return signals.find((signal) =>
    HOUSE_GROUPS[area].includes(signal.house) ||
    planetMatchesArea(signal.transitPlanet, area) ||
    planetMatchesArea(signal.natalPlanet, area),
  ) ?? signals[0];
}

function classifySignal(signal: TransitSignal): 'support' | 'tension' | 'neutral' {
  if (signal.aspect === 'square' || signal.aspect === 'opposition') return 'tension';
  if (signal.aspect === 'trine' || signal.aspect === 'sextile') return 'support';
  return 'neutral';
}

function briefSignal(signal: TransitSignal) {
  const nature = classifySignal(signal);
  if (nature === 'support') return `${formatSignal(signal)} is the clearest opening right now.`;
  if (nature === 'tension') return `${formatSignal(signal)} is the main pressure line right now.`;
  return `${formatSignal(signal)} intensifies the day and needs conscious handling.`;
}

export function buildTransitReading(chart: any, transits: Record<string, any>, date: Date) {
  const signals = collectSignals(chart, transits);
  const supportSignals = signals.filter((signal) => signal.aspect !== 'square' && signal.aspect !== 'opposition');
  const challengeSignals = signals.filter((signal) => signal.aspect === 'square' || signal.aspect === 'opposition');
  const overallSignal = supportSignals[0] ?? signals[0];
  const loveSignal = getAreaSignal(signals, 'love');
  const careerSignal = getAreaSignal(signals, 'career');
  const wellnessSignal = getAreaSignal(challengeSignals.length ? challengeSignals : signals, 'wellness');
  const supportScore = supportSignals.reduce((sum, signal) => sum + signal.support, 0);
  const challengeScore = challengeSignals.reduce((sum, signal) => sum + signal.tension, 0);

  const dominantArea: SignalArea =
    ([
      ['love', loveSignal ? (loveSignal.support + loveSignal.tension) : 0],
      ['career', careerSignal ? (careerSignal.support + careerSignal.tension) : 0],
      ['wellness', wellnessSignal ? (wellnessSignal.support + wellnessSignal.tension) : 0],
    ].sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? 'career') as SignalArea;

  const natalSunSign = chart.western?.sun ?? 'Aries';
  const natalMoon = chart.western?.moon ?? 'Cancer';
  const natalRashi = chart.vedic?.rashi ?? 'Mesha';
  const nakshatraName = chart.vedic?.nakshatra ?? 'Ashwini';
  const currentDasha = chart.vedic?.currentDasha?.planet ?? 'Sun';
  const subDasha = chart.vedic?.subDasha?.planet ?? currentDasha;
  const chineseAnimal = chart.chinese?.animal ?? 'Rat';
  const chineseElement = chart.chinese?.element ?? 'Wood';
  const seasonalElement = MONTH_ELEMENTS[date.getMonth()] ?? 'Earth';
  const kpLagna = chart.kp?.lagna ?? 'Aries';
  const kpSubLord = chart.kp?.lagnaSubLord ?? 'Sun';
  const signature = getWesternSignature(chart);
  const cautionSignal = challengeSignals[0];
  const positivityScore = Number(Math.max(0.64, Math.min(0.92, 0.74 + supportScore * 0.018 - challengeScore * 0.014)).toFixed(2));
  const tone = buildTone(supportScore, challengeScore);
  const headline = AREA_HEADLINES[dominantArea];
  const liveMoonNote = getLiveMoonNote(transits);
  const evidenceLine = [buildEvidenceLine(overallSignal, cautionSignal, currentDasha), liveMoonNote].filter(Boolean).join(' ');
  const bestUse = `Use the day for ${AREA_AIMS[dominantArea]}.`;
  const watchFor = cautionSignal
    ? `${AREA_WARNINGS[dominantArea]} The pressure point is ${formatSignal(cautionSignal)}.`
    : AREA_WARNINGS[dominantArea];
  const timingNote = `${kpLagna} lagna with ${kpSubLord} sub-lord sharpens timing around ${dominantArea} matters, while ${currentDasha} Mahadasha carries the broader tempo. ${liveMoonNote}`;
  const cosmicVibe = overallSignal
    ? `${headline} ${formatSignal(overallSignal)} is the clearest opening, and ${cautionSignal ? `${formatSignal(cautionSignal)} is where the pressure concentrates.` : 'The faster transits are lighter than the long-cycle timing today.'}`
    : `${headline} ${currentDasha} Mahadasha is doing more of the work than the fast-moving sky, so the day rewards cleaner choices than usual.`;
  const activeTransits = signals.slice(0, 4).map((signal) => ({
    transitPlanet: formatPlanet(signal.transitPlanet),
    natalPlanet: formatPlanet(signal.natalPlanet),
    aspect: signal.aspect,
    orb: signal.orb,
    nature: classifySignal(signal),
    brief: briefSignal(signal),
  }));
  const transitPositions = Object.entries(transits)
    .filter(([planet]) => ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'MEAN_NODE', 'KETU'].includes(planet))
    .map(([planet, value]) => ({
      planet: formatPlanet(planet),
      sign: (value as any)?.sign ?? 'Aries',
      degree: Math.round(Number((value as any)?.degree ?? 0) * 10) / 10,
      retrograde: Boolean((value as any)?.retrograde),
    }));

  return {
    version: DAILY_READING_VERSION,
    date: date.toISOString().split('T')[0],
    western: {
      overall: overallSignal
        ? `${getSignalFocus(overallSignal)} is setting the western tone. For your ${signature} makeup, the right move is to ${dominantArea === 'love' ? 'lead with warmth before intensity' : dominantArea === 'career' ? 'back the consequential decision' : 'protect your pace before pressure builds'}. ${liveMoonNote}`
        : `Your ${signature} makeup wants cleaner pacing and fewer scattered commitments today. ${liveMoonNote}`,
      love: loveSignal
        ? `${getSignalFocus(loveSignal)} softens relationship dynamics. Let your ${natalMoon} Moon stay honest instead of over-managed.`
        : `Connection improves when your ${natalMoon} Moon stays warm and simple instead of over-explaining itself.`,
      career: careerSignal
        ? `${getSignalFocus(careerSignal)} supports work, direction, and decisions that carry real weight.`
        : `Protect one serious block for the work that compounds. Your ${chart.western?.dominantElement ?? 'Fire'} chart does not need five competing priorities today.`,
      wellness: wellnessSignal
        ? `${getSignalFocus(wellnessSignal)} is asking for better pacing.${cautionSignal ? ` The main strain line is ${getSignalFocus(cautionSignal)}.` : ''}`
        : 'Your body responds best to rhythm today. Eat, move, and rest before the schedule starts leading you.',
      luckyNumber: ((date.getDate() + Math.round(supportScore * 3) + date.getMonth()) % 9) + 1,
      transitHighlight: overallSignal ? formatSignal(overallSignal) : 'Sun emphasis',
    },
    vedic: {
      dasha: `${currentDasha} Mahadasha and ${subDasha} Antardasha make ${DASHA_THEMES[currentDasha] ?? 'timing'} the main Vedic theme for a ${natalRashi} native with ${natalSunSign} solar emphasis.`,
      nakshatra: `${nakshatraName} Nakshatra is active through your ${natalRashi} lens, so smaller precise moves beat force today.`,
      mantra: mantraForDasha(currentDasha),
      remedy: {
        type: 'ritual',
        name: `${currentDasha} remedy`,
        description: remedyForDasha(currentDasha),
        source: 'Brihat Parashara Hora Shastra',
      },
      rashi: natalRashi,
    },
    chinese: {
      animal: `${chineseAnimal} energy does best today when you lean on ${ANIMAL_STYLE[chineseAnimal] ?? 'clean instinct and timing'} instead of pure reaction.`,
      element: `${seasonalElement} season is moving through your ${chineseElement} constitution, so cleaner pacing matters more than intensity. ${chart.chinese?.yinYang ?? 'Yang'} expression in you works best when you ${dominantArea === 'wellness' ? 'slow down early' : dominantArea === 'love' ? 'make connection feel safe' : 'act only on the move that matters'}.`,
      luckyDirection: DIRECTION_BY_ELEMENT[seasonalElement] ?? 'East',
      luckyColor: chart.chinese?.luckyColors?.[0] ?? 'Green',
    },
    kp: {
      eventTiming: `${kpLagna} lagna with ${kpSubLord} sub-lord sharpens timing around ${dominantArea === 'wellness' ? 'wellness' : dominantArea} matters today.`,
      significatorInsight: overallSignal
        ? `${formatSignal(overallSignal)} is activating house ${overallSignal.house || 1}, which is why timing feels more exact than usual.`
        : 'Current significators support exact choices over reactive ones.',
      sublordGuidance: `${kpSubLord} as sub-lord suggests ${subLordMeaning(kpSubLord)}.`,
    },
    unified: {
      cosmicVibe,
      affirmation: buildAffirmation(dominantArea, chart, currentDasha),
      shareText: `${cosmicVibe} | ${natalSunSign} + ${natalRashi} + ${chineseAnimal} | CosmicSelf`,
      focusArea: dominantArea,
      focusAdvice: dominantArea === 'love'
        ? 'say the honest thing before the mood slips past it'
        : dominantArea === 'career'
          ? 'commit to the move that already deserves your focus'
          : 'protect your pace before the day asks for too much',
      headline,
      evidenceLine,
      bestUse,
      watchFor,
      timingNote,
      tone,
    },
    activeTransits,
    transitPositions,
    references: [
      { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
      { source: 'Planets in Transit', type: 'book', tradition: 'western' },
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
      { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
    ],
    positivityScore,
  };
}
