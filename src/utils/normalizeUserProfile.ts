import type {
  ChineseProfile,
  DashaPeriod,
  KPProfile,
  WesternProfile,
  VedicProfile,
} from '../types/astrology';
import type { AstrologySystem, Subscription, UserProfile } from '../types/user';

const VALID_SYSTEMS: AstrologySystem[] = ['western', 'vedic', 'chinese', 'kp'];

function toDate(value: unknown, fallback: Date) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    const converted = (value as { toDate?: () => Date }).toDate?.();
    if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
      return converted;
    }
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeDashaPeriod(period?: Partial<DashaPeriod> | null): DashaPeriod {
  const startDate = toDate(period?.startDate, new Date());
  const endFallback = new Date(startDate);
  endFallback.setFullYear(endFallback.getFullYear() + 6);

  return {
    planet: period?.planet ?? 'Sun',
    startDate,
    endDate: toDate(period?.endDate, endFallback),
    subPeriods: Array.isArray(period?.subPeriods)
      ? period?.subPeriods.map((item) => normalizeDashaPeriod(item))
      : undefined,
  };
}

function normalizeWesternProfile(profile?: Partial<WesternProfile> | null): WesternProfile | undefined {
  if (!profile) return undefined;

  return {
    sun: profile.sun ?? profile.moon ?? 'Leo',
    moon: profile.moon ?? profile.sun ?? 'Cancer',
    rising: profile.rising,
    element: profile.element ?? 'Fire',
    modality: profile.modality ?? 'Cardinal',
    planets: Array.isArray(profile.planets) ? profile.planets : [],
    houses: Array.isArray(profile.houses) ? profile.houses : undefined,
  };
}

function normalizeVedicProfile(profile?: Partial<VedicProfile> | null): VedicProfile | undefined {
  if (!profile) return undefined;

  const dashas = Array.isArray(profile.dashas) && profile.dashas.length
    ? profile.dashas.map((item) => normalizeDashaPeriod(item))
    : [normalizeDashaPeriod(profile.currentDasha)];
  const currentDasha = normalizeDashaPeriod(profile.currentDasha ?? dashas[0]);

  return {
    rashi: profile.rashi ?? 'Simha',
    nakshatra: profile.nakshatra ?? 'Magha',
    nakshatraPada: profile.nakshatraPada ?? 1,
    moonSign: profile.moonSign ?? profile.rashi ?? 'Simha',
    dashas,
    currentDasha,
    remedies: Array.isArray(profile.remedies) ? profile.remedies : [],
  };
}

function normalizeChineseProfile(profile?: Partial<ChineseProfile> | null): ChineseProfile | undefined {
  if (!profile) return undefined;

  return {
    animal: profile.animal ?? 'Dragon',
    element: profile.element ?? 'Wood',
    yinYang: profile.yinYang ?? 'Yang',
    pillars: profile.pillars,
    luckyNumbers: Array.isArray(profile.luckyNumbers) ? profile.luckyNumbers : [],
    luckyColors: Array.isArray(profile.luckyColors) ? profile.luckyColors : [],
    compatibleAnimals: Array.isArray(profile.compatibleAnimals) ? profile.compatibleAnimals : [],
    incompatibleAnimals: Array.isArray(profile.incompatibleAnimals) ? profile.incompatibleAnimals : [],
  };
}

function normalizeKPProfile(profile?: Partial<KPProfile> | null): KPProfile | undefined {
  if (!profile) return undefined;

  return {
    sublords: Array.isArray(profile.sublords) ? profile.sublords : [],
    cusps: Array.isArray(profile.cusps) ? profile.cusps : [],
    significators: Array.isArray(profile.significators) ? profile.significators : [],
    predictions: Array.isArray(profile.predictions) ? profile.predictions : [],
  };
}

function normalizeSubscription(subscription?: Partial<Subscription> | null): Subscription {
  const now = new Date();

  return {
    tier: subscription?.tier ?? 'free',
    status: subscription?.status ?? 'active',
    purchasedItems: Array.isArray(subscription?.purchasedItems) ? subscription.purchasedItems : [],
    expiresAt: subscription?.expiresAt ? toDate(subscription.expiresAt, now) : undefined,
    trialEndsAt: subscription?.trialEndsAt ? toDate(subscription.trialEndsAt, now) : undefined,
  };
}

export function normalizeUserProfile(user: Partial<UserProfile>): UserProfile {
  const now = new Date();
  const birthDate = toDate(user.birthDetails?.date, now);
  const activeSystems = Array.isArray(user.activeSystems)
    ? user.activeSystems.filter((item): item is AstrologySystem => VALID_SYSTEMS.includes(item))
    : [];

  return {
    id: user.id ?? '',
    name: user.name ?? 'Cosmic User',
    language: user.language ?? 'en',
    birthDetails: {
      // Spread original to preserve extended fields (birthDateStr, birthTimeStr, birthPlace)
      // that cosmic-reveal.tsx reads at runtime via `as any`.
      ...(user.birthDetails as object | undefined),
      date: birthDate,
      time: user.birthDetails?.time,
      place: user.birthDetails?.place,
    } as UserProfile['birthDetails'],
    activeSystems,
    western: normalizeWesternProfile(user.western),
    vedic: normalizeVedicProfile(user.vedic),
    chinese: normalizeChineseProfile(user.chinese),
    kp: normalizeKPProfile(user.kp),
    subscription: normalizeSubscription(user.subscription),
    cosmicPoints: typeof user.cosmicPoints === 'number' ? user.cosmicPoints : 0,
    streak: typeof user.streak === 'number' ? user.streak : 0,
    lastCheckIn: user.lastCheckIn,
    onboardingComplete: Boolean(user.onboardingComplete),
    createdAt: toDate(user.createdAt, now),
  };
}
