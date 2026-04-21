import { PREMIUM_MONTHLY_PRICE, PREMIUM_YEARLY_PRICE } from './subscription';

export const PRICING = {
  monthlyPrice: PREMIUM_MONTHLY_PRICE,
  yearlyPrice: PREMIUM_YEARLY_PRICE,
  yearlySavings: '$10',
  trialDays: 7,
} as const;

export const FREE_FEATURES: readonly string[] = [
  'Daily spoken-style reading',
  'Basic chart summary',
  '1 compatibility check per day',
  'Recent reading archive',
  'Journal access',
  'Rewarded ads for one-time premium unlocks',
];

export const PREMIUM_FEATURES: ReadonlyArray<{ emoji: string; text: string }> = [
  { emoji: '\u{1F496}', text: 'Unlimited compatibility checks and deeper match readings' },
  { emoji: '\u{1F30C}', text: '30-day forecast broken into three real phases with per-phase focus' },
  { emoji: '\u{1F52E}', text: 'Life roadmap with Antardasha sub-chapters and life-age ranges' },
  { emoji: '\u{1F4D4}', text: 'Journal Insights: streak analytics, mood by moon phase, weekly cadence' },
  { emoji: '\u{1F52D}', text: 'Full blended readings with source-backed system details' },
  { emoji: '\u{1F4DA}', text: 'Full reading archive instead of the free recent-days view' },
  { emoji: '\u{1F514}', text: 'Real-time high-impact transit alerts' },
  { emoji: '\u{1F4E4}', text: 'Premium share cards with no watermark' },
  { emoji: '\u{1F465}', text: '5 switchable profiles total: you plus 4 family profiles' },
  { emoji: '\u{1F6AB}', text: 'Ad-free experience' },
];
