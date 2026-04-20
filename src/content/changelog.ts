export type ChangelogCategory = 'feature' | 'improvement' | 'fix';

export type ChangelogEntry = {
  version: string;
  date: string; // ISO: YYYY-MM-DD
  headline: string;
  items: ReadonlyArray<{ category: ChangelogCategory; text: string }>;
};

export const CHANGELOG: ReadonlyArray<ChangelogEntry> = [
  {
    version: '1.0.0',
    date: '2026-04-20',
    headline: 'Initial public release',
    items: [
      { category: 'feature', text: 'Today Brief — daily reading across Western, Vedic, Chinese, and KP systems' },
      { category: 'feature', text: 'Self Chart — birth chart rendered across all four systems with plain-English interpretation' },
      { category: 'feature', text: 'Ask Akasha — chart-grounded AI oracle with 1 free question per day, 3 on premium' },
      { category: 'feature', text: 'Compatibility — cross-system synastry with strength zones and timing windows' },
      { category: 'feature', text: 'Cosmic QR — shareable cosmic identity card with revocable access' },
      { category: 'feature', text: 'Journal — daily cosmic journaling with lunar phase awareness' },
      { category: 'feature', text: 'Premium subscription with 7-day free trial via App Store and Play Store' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-03-28',
    headline: 'Release candidate',
    items: [
      { category: 'improvement', text: 'Rewrote Today Brief prose pipeline with editorial voice pass' },
      { category: 'improvement', text: 'Tightened Vedic dasha timing calculations against classical references' },
      { category: 'improvement', text: 'Added smooth KP sub-lord transitions to Self Chart view' },
      { category: 'fix', text: 'Chinese pillar hour branch edge cases around midnight' },
      { category: 'fix', text: 'Western house boundaries near polar latitudes' },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-03-05',
    headline: 'Compatibility polish',
    items: [
      { category: 'feature', text: 'Compatibility timing band: when the connection runs hot or cold over the next 90 days' },
      { category: 'improvement', text: 'Synastry scoring rebalanced across classical weightings' },
      { category: 'improvement', text: 'Profile management: up to 5 switchable profiles for premium accounts' },
      { category: 'fix', text: 'Share card export preserved alpha on iOS Safari preview' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-02-12',
    headline: 'Quiet voice',
    items: [
      { category: 'improvement', text: 'Removed all push notifications from default — opt-in only' },
      { category: 'improvement', text: 'Banner ads removed; rewarded ads are now opt-in for one-time unlocks' },
      { category: 'improvement', text: 'Tuned daily reading length to a consistent 3-minute read' },
    ],
  },
];
