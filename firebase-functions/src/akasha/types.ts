export type AkashaTier = 'free' | 'premium' | 'trial';

export interface AkashaDigestVedic {
  ascendant: string;
  moonSign: string;
  moonNakshatra: string;
  seventhLord: string | null;
  seventhHousePlanets: string[];
  tenthLord: string | null;
  tenthHousePlanets: string[];
  currentMahaDasha: string;
  currentAntarDasha: string;
  dashaEndsOn: string;
}

export interface AkashaDigestWestern {
  sunSign: string;
  moonSign: string;
  risingSign: string | null;
  venusSign: string;
  marsSign: string;
  majorTransits: Array<{ planet: string; aspect: string; natal: string; exact: string }>;
}

export interface AkashaDigestKP {
  significators: Record<string, string[]>;
  rulingPlanets: string[];
}

export interface AkashaDigestChinese {
  animal: string;
  element: string;
  yearPillar: string;
  currentYear: { animal: string; element: string; relation: string };
}

export interface AkashaDigest {
  vedic: AkashaDigestVedic;
  western: AkashaDigestWestern;
  kp: AkashaDigestKP;
  chinese: AkashaDigestChinese;
}

export interface AkashaAskRequest {
  question: string;
  digest: AkashaDigest;
  locale: string;
}

export interface AkashaAskSuccess {
  ok: true;
  answer: string;
  readingId: string;
  remaining: number;
  nextAvailableAt: string | null;
}

export interface AkashaAskFailure {
  ok: false;
  error: 'rate_limited' | 'oracle_silent' | 'meditating' | 'invalid_request' | 'unauthenticated';
  message: string;
  nextAvailableAt?: string;
}

export type AkashaAskResponse = AkashaAskSuccess | AkashaAskFailure;
