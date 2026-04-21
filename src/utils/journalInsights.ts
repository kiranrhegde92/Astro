import type { JournalEntry } from '../types/appData';

export type MoodKey = JournalEntry['mood'];
export type MoonPhaseKey = NonNullable<JournalEntry['moonPhaseKey']>;

export interface MoodBreakdown {
  mood: MoodKey;
  count: number;
  pct: number;
}

export interface MoonPhaseMoodRow {
  phaseKey: MoonPhaseKey;
  phaseLabel: string;
  phaseEmoji: string;
  total: number;
  dominantMood: MoodKey | null;
  dominantCount: number;
}

export interface WeeklyBucket {
  weekStartKey: string;
  label: string;
  count: number;
}

export interface JournalInsights {
  totalEntries: number;
  last30Count: number;
  last7Count: number;
  currentStreak: number;
  longestStreak: number;
  averageWords: number;
  topMood: MoodBreakdown | null;
  moodBreakdown: MoodBreakdown[];
  moonPhaseRows: MoonPhaseMoodRow[];
  weeklyActivity: WeeklyBucket[];
}

const MOOD_ORDER: MoodKey[] = ['clear', 'curious', 'tender', 'restless', 'hopeful'];

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map((v) => parseInt(v, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

function computeStreaks(entries: JournalEntry[], today: Date): { current: number; longest: number } {
  if (!entries.length) return { current: 0, longest: 0 };
  const keys = Array.from(new Set(entries.map((e) => e.date))).sort();
  const dates = keys.map(parseDate);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i += 1) {
    const gap = diffInDays(dates[i], dates[i - 1]);
    if (gap === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else if (gap > 1) {
      run = 1;
    }
  }

  let current = 0;
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(new Date(today.getTime() - DAY_MS));
  const hasToday = keys.includes(todayKey);
  const hasYesterday = keys.includes(yesterdayKey);
  if (hasToday || hasYesterday) {
    let cursor = hasToday ? today : new Date(today.getTime() - DAY_MS);
    while (keys.includes(toDateKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }
  return { current, longest };
}

function countWords(body: string): number {
  const trimmed = body.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function buildMoodBreakdown(entries: JournalEntry[]): MoodBreakdown[] {
  const counts = new Map<MoodKey, number>();
  entries.forEach((e) => counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1));
  const total = entries.length || 1;
  return MOOD_ORDER.map((mood) => {
    const count = counts.get(mood) ?? 0;
    return { mood, count, pct: Math.round((count / total) * 100) };
  }).sort((a, b) => b.count - a.count);
}

function buildMoonPhaseRows(entries: JournalEntry[]): MoonPhaseMoodRow[] {
  const byPhase = new Map<MoonPhaseKey, { label: string; emoji: string; moods: Map<MoodKey, number> }>();
  entries.forEach((e) => {
    if (!e.moonPhaseKey) return;
    const phaseKey = e.moonPhaseKey;
    const bucket = byPhase.get(phaseKey) ?? {
      label: e.moonPhaseLabel ?? phaseKey,
      emoji: e.moonPhaseEmoji ?? '\u{1F311}',
      moods: new Map<MoodKey, number>(),
    };
    bucket.moods.set(e.mood, (bucket.moods.get(e.mood) ?? 0) + 1);
    byPhase.set(phaseKey, bucket);
  });

  return Array.from(byPhase.entries())
    .map(([phaseKey, bucket]) => {
      let dominantMood: MoodKey | null = null;
      let dominantCount = 0;
      let total = 0;
      bucket.moods.forEach((count, mood) => {
        total += count;
        if (count > dominantCount) {
          dominantCount = count;
          dominantMood = mood;
        }
      });
      return {
        phaseKey,
        phaseLabel: bucket.label,
        phaseEmoji: bucket.emoji,
        total,
        dominantMood,
        dominantCount,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function buildWeeklyActivity(entries: JournalEntry[], today: Date, weeks: number): WeeklyBucket[] {
  const buckets: WeeklyBucket[] = [];
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekEnd = new Date(startOfToday.getTime() - i * 7 * DAY_MS);
    const weekStart = new Date(weekEnd.getTime() - 6 * DAY_MS);
    const weekStartKey = toDateKey(weekStart);
    const weekEndKey = toDateKey(weekEnd);
    const count = entries.filter((e) => e.date >= weekStartKey && e.date <= weekEndKey).length;
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    buckets.push({ weekStartKey, label, count });
  }
  return buckets;
}

export function computeJournalInsights(entries: JournalEntry[], today: Date = new Date()): JournalInsights {
  const todayKey = toDateKey(today);
  const thirtyAgo = toDateKey(new Date(today.getTime() - 29 * DAY_MS));
  const sevenAgo = toDateKey(new Date(today.getTime() - 6 * DAY_MS));

  const last30 = entries.filter((e) => e.date >= thirtyAgo && e.date <= todayKey);
  const last7 = entries.filter((e) => e.date >= sevenAgo && e.date <= todayKey);

  const { current, longest } = computeStreaks(entries, today);
  const moodBreakdown = buildMoodBreakdown(last30.length ? last30 : entries);
  const topMood = moodBreakdown.find((m) => m.count > 0) ?? null;
  const moonPhaseRows = buildMoonPhaseRows(entries);
  const weeklyActivity = buildWeeklyActivity(entries, today, 6);

  const wordTotal = entries.reduce((sum, e) => sum + countWords(e.body), 0);
  const averageWords = entries.length ? Math.round(wordTotal / entries.length) : 0;

  return {
    totalEntries: entries.length,
    last30Count: last30.length,
    last7Count: last7.length,
    currentStreak: current,
    longestStreak: longest,
    averageWords,
    topMood,
    moodBreakdown,
    moonPhaseRows,
    weeklyActivity,
  };
}

export const MOOD_META: Record<MoodKey, { label: string; emoji: string }> = {
  clear: { label: 'Clear', emoji: '\u2728' },
  curious: { label: 'Curious', emoji: '\u{1F52D}' },
  tender: { label: 'Tender', emoji: '\u{1F49C}' },
  restless: { label: 'Restless', emoji: '\u{1F300}' },
  hopeful: { label: 'Hopeful', emoji: '\u{1F31F}' },
};
