import { COLORS } from '../constants/theme';
import type { DailyReading } from '../types/astrology';
import type { UserProfile } from '../types/user';

export interface ReadingExplainItem {
  key: string;
  title: string;
  accent: string;
  summary: string;
  detail: string;
  source?: string;
}

function getSource(reading: DailyReading, tradition: 'western' | 'vedic' | 'chinese' | 'kp') {
  const reference = reading.references.find((item) => item.tradition === tradition);
  if (!reference) return undefined;
  return `${reference.source}${reference.chapter ? ` - ${reference.chapter}` : ''}`;
}

export function getReadingExplainers(user: UserProfile, reading: DailyReading): ReadingExplainItem[] {
  const items: ReadingExplainItem[] = [];
  const currentDashaPlanet = user.vedic?.currentDasha?.planet ?? user.vedic?.dashas?.[0]?.planet ?? 'Sun';

  if (user.western && reading.western) {
    items.push({
      key: 'western',
      title: 'Western',
      accent: COLORS.western,
      summary: reading.western.love,
      detail: `This line is anchored in your ${user.western.sun} Sun, ${user.western.moon} Moon, and ${user.western.element.toLowerCase()} element style. Trust the western lens when the question is about identity, emotional weather, or how you show up with other people.`,
      source: getSource(reading, 'western'),
    });
  }

  if (user.vedic && reading.vedic) {
    items.push({
      key: 'vedic',
      title: 'Vedic',
      accent: COLORS.vedic,
      summary: reading.vedic.dasha,
      detail: `This comes from your ${user.vedic.rashi} Rashi, ${user.vedic.nakshatra} Nakshatra, and current ${currentDashaPlanet} Mahadasha. Trust the Vedic lens when you are trying to understand timing, karmic weight, or why a life chapter feels especially loaded.`,
      source: getSource(reading, 'vedic'),
    });
  }

  if (user.chinese && reading.chinese) {
    items.push({
      key: 'chinese',
      title: 'Chinese',
      accent: COLORS.chinese,
      summary: reading.chinese.element,
      detail: `This line is grounded in your ${user.chinese.element} ${user.chinese.animal} pattern. Use it when the question is about long cycles, routine, compatibility, or the kind of environment your energy actually thrives in.`,
      source: getSource(reading, 'chinese'),
    });
  }

  if (user.kp && reading.kp) {
    items.push({
      key: 'kp',
      title: 'KP',
      accent: COLORS.kp,
      summary: reading.kp.eventTiming,
      detail: `KP is the exact-timing lens in the app. It uses significators, cusps, and sub-lords to answer when something is ready to move. Reach for this one when the question is practical and you need timing more than symbolism.`,
      source: getSource(reading, 'kp'),
    });
  }

  return items;
}
