import type { CosmicProfile, DashaPlanet, PredictionReference } from '../types/astrology';
import { getCurrentSubPeriod, getUpcomingSubPeriods } from './predictionSignals';

export interface LifeRoadmapChapter {
  planet: DashaPlanet;
  title: string;
  range: string;
  theme: string;
  guidance: string;
  ageRange?: string;
}

export interface LifeRoadmapSubChapter {
  planet: DashaPlanet;
  title: string;
  range: string;
  theme: string;
}

export interface LifeRoadmap {
  title: string;
  summary: string;
  currentChapter: LifeRoadmapChapter;
  nextChapter?: LifeRoadmapChapter;
  chapters: LifeRoadmapChapter[];
  subChapters?: LifeRoadmapSubChapter[];
  turningPoints: string[];
  references: PredictionReference[];
}

const DASHA_THEMES: Record<DashaPlanet, string> = {
  Ketu: 'release, spiritual pruning, and cleaner separation from what no longer fits',
  Venus: 'love, value alignment, beauty, and what feels worth building around',
  Sun: 'visibility, authorship, confidence, and standing behind your name',
  Moon: 'emotion, care, belonging, and the way your inner life sets the outer tone',
  Mars: 'courage, competition, urgency, and the discipline of right action',
  Rahu: 'ambition, experimentation, reinvention, and rapid appetite for growth',
  Jupiter: 'learning, teaching, belief, travel, and broader opportunities',
  Saturn: 'patience, structure, pressure, responsibility, and durable progress',
  Mercury: 'language, trade, planning, study, and better choices made earlier',
};

const PLANET_GUIDANCE: Record<DashaPlanet, string> = {
  Ketu: 'Let subtraction do some of the work. The chapter improves when you stop feeding stale loops.',
  Venus: 'Relationships, beauty, and value choices become the real strategy, not side decoration.',
  Sun: 'Visibility matters. The chapter responds when you take ownership instead of waiting for permission.',
  Moon: 'Regulation and emotional honesty matter more than speed. Home-base choices set the pace.',
  Mars: 'Direct action is useful, but only when it is clean. Choose fewer battles and finish them well.',
  Rahu: 'Growth comes through unusual doors. Vet opportunity before you let intensity choose for you.',
  Jupiter: 'Expansion works best when paired with study, guidance, or a bigger long-term horizon.',
  Saturn: 'This chapter compounds slowly. Progress is real, but it wants consistency more than excitement.',
  Mercury: 'Document, negotiate, and refine. Your advantage comes from clarity before momentum.',
};

function formatRange(startDate: Date, endDate: Date) {
  return `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
}

function formatSubRange(startDate: Date, endDate: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', opts)} - ${endDate.toLocaleDateString('en-US', opts)}`;
}

function computeAgeAt(birthDate: Date, reference: Date) {
  const diffMs = reference.getTime() - birthDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.2425)));
}

function buildChapter(
  profile: Partial<CosmicProfile>,
  planet: DashaPlanet,
  startDate: Date,
  endDate: Date,
  birthDate?: Date | null,
): LifeRoadmapChapter {
  const westernTone = profile.western?.element?.toLowerCase() ?? 'fire';
  const chineseTone = `${profile.chinese?.element ?? 'Wood'} ${profile.chinese?.animal ?? 'Dragon'}`;
  const ageRange = birthDate
    ? `ages ${computeAgeAt(birthDate, startDate)}-${computeAgeAt(birthDate, endDate)}`
    : undefined;

  return {
    planet,
    title: `${planet} chapter`,
    range: formatRange(startDate, endDate),
    theme: DASHA_THEMES[planet],
    guidance: `${PLANET_GUIDANCE[planet]} With your ${westernTone} western tone and ${chineseTone} pattern, this chapter rewards steadier alignment over noise.`,
    ageRange,
  };
}

export function generateLifeRoadmap(
  date: Date,
  profile: Partial<CosmicProfile>,
  birthDate?: Date | null,
): LifeRoadmap | null {
  const dashas = profile.vedic?.dashas ?? [];
  if (!dashas.length) return null;

  const currentIndex = dashas.findIndex((period) => {
    const start = new Date(period.startDate).getTime();
    const end = new Date(period.endDate).getTime();
    const now = date.getTime();
    return now >= start && now < end;
  });

  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const active = dashas[activeIndex];
  const visible = dashas.slice(activeIndex, activeIndex + 4);
  const chapters = visible.map((period) =>
    buildChapter(profile, period.planet, new Date(period.startDate), new Date(period.endDate), birthDate),
  );
  const currentChapter = chapters[0];
  const nextChapter = chapters[1];
  const subPeriod = getCurrentSubPeriod(profile, date);
  const upcomingSubs = getUpcomingSubPeriods(profile, date, 3);
  const subChapters: LifeRoadmapSubChapter[] = upcomingSubs.map((period) => ({
    planet: period.planet,
    title: `${period.planet} sub-period`,
    range: formatSubRange(new Date(period.startDate), new Date(period.endDate)),
    theme: DASHA_THEMES[period.planet],
  }));
  const kpLead = profile.kp?.predictions?.sort((a, b) => b.confidence - a.confidence)[0];
  const atTail = chapters.length < 4 && activeIndex + chapters.length >= dashas.length;

  const turningPoints = [
    subPeriod ? `${subPeriod.planet} sub-period is the current micro-timing layer inside your ${active.planet} Mahadasha.` : null,
    nextChapter ? `The next major pivot begins when ${nextChapter.title} starts in ${nextChapter.range.split(' - ')[0]}.` : null,
    upcomingSubs[0]
      ? `Inside this chapter, the ${upcomingSubs[0].planet} sub-period opens ${formatSubRange(new Date(upcomingSubs[0].startDate), new Date(upcomingSubs[0].endDate)).split(' - ')[0]} — a softer turning layer before the next Mahadasha.`
      : null,
    kpLead ? `KP is repeatedly pointing toward ${kpLead.area === 'health' ? 'wellness' : kpLead.area} as the life area most ready to move.` : null,
    atTail ? 'This is the tail of the stored dasha sequence — beyond the final chapter, the cycle restarts on a deeper level, so treat the closing years as the integration phase.' : null,
  ].filter(Boolean) as string[];

  const ageNote = birthDate
    ? ` You are roughly ${computeAgeAt(birthDate, date)} years in — the arc is timed in decades, not weeks.`
    : '';

  return {
    title: 'Long-range roadmap',
    summary: `${active.planet} is your current life chapter, so the longer arc is being timed through ${DASHA_THEMES[active.planet]}.${ageNote} This is the closest thing in the app to a whole-life future model: Vedic Mahadasha timing, sharpened by KP emphasis and colored by your Western and Chinese temperament.`,
    currentChapter,
    nextChapter,
    chapters,
    subChapters: subChapters.length ? subChapters : undefined,
    turningPoints,
    references: [
      { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
      { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
    ],
  };
}

