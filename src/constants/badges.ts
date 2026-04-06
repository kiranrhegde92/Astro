/**
 * Cosmic Badges & Achievement System
 *
 * Gamification layer that rewards engagement without creating anxiety.
 * All badges are positive, celebrating exploration and consistency.
 */

export interface CosmicBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  category: 'streak' | 'exploration' | 'social' | 'mastery';
}

export const BADGES: CosmicBadge[] = [
  // Streak badges
  { id: 'streak_3', name: 'Star Gazer', emoji: '\u{1F31F}', description: 'Checked in 3 days in a row', requirement: '3-day streak', category: 'streak' },
  { id: 'streak_7', name: 'Moon Child', emoji: '\u{1F319}', description: 'A full week of cosmic alignment', requirement: '7-day streak', category: 'streak' },
  { id: 'streak_14', name: 'Cosmic Regular', emoji: '\u{2B50}', description: 'Two weeks of daily cosmic check-ins', requirement: '14-day streak', category: 'streak' },
  { id: 'streak_30', name: 'Stellar Devotee', emoji: '\u{1F320}', description: 'A full month aligned with the cosmos', requirement: '30-day streak', category: 'streak' },
  { id: 'streak_90', name: 'Cosmic Master', emoji: '\u{1F30C}', description: 'Three months of unwavering cosmic connection', requirement: '90-day streak', category: 'streak' },
  { id: 'streak_365', name: 'Celestial Legend', emoji: '\u{1F451}', description: 'An entire year of daily cosmic wisdom', requirement: '365-day streak', category: 'streak' },

  // Exploration badges
  { id: 'all_systems', name: 'Cosmic Explorer', emoji: '\u{1F52D}', description: 'Activated all 4 astrology systems', requirement: 'Enable Western, Vedic, Chinese, and KP', category: 'exploration' },
  { id: 'first_reading', name: 'Awakened', emoji: '\u{1F33F}', description: 'Read your first daily cosmic reading', requirement: 'View first daily reading', category: 'exploration' },
  { id: 'deep_dive', name: 'Deep Diver', emoji: '\u{1F30A}', description: 'Explored a detailed system reading', requirement: 'View any system detail screen', category: 'exploration' },
  { id: 'remedy_seeker', name: 'Remedy Seeker', emoji: '\u{1F48E}', description: 'Explored your Vedic remedies', requirement: 'View Vedic reading with remedies', category: 'exploration' },
  { id: 'four_pillars', name: 'Pillar Explorer', emoji: '\u{1F3DB}\uFE0F', description: 'Discovered your Four Pillars of Destiny', requirement: 'View Chinese Four Pillars', category: 'exploration' },

  // Social badges
  { id: 'first_share', name: 'Cosmic Sharer', emoji: '\u{1F4E4}', description: 'Shared your Cosmic DNA with the world', requirement: 'Share a card for the first time', category: 'social' },
  { id: 'first_compat', name: 'Match Maker', emoji: '\u{1F496}', description: 'Checked your first compatibility', requirement: 'Complete a compatibility check', category: 'social' },
  { id: 'qr_creator', name: 'QR Pioneer', emoji: '\u{1F4F1}', description: 'Generated your cosmic QR code', requirement: 'View My QR Code screen', category: 'social' },
  { id: 'compat_5', name: 'Social Butterfly', emoji: '\u{1F98B}', description: 'Checked compatibility with 5 people', requirement: '5 compatibility checks', category: 'social' },

  // Mastery badges
  { id: 'points_100', name: 'Rising Star', emoji: '\u{2728}', description: 'Earned your first 100 cosmic points', requirement: '100 cosmic points', category: 'mastery' },
  { id: 'points_500', name: 'Constellation', emoji: '\u{1F320}', description: 'Accumulated 500 cosmic points', requirement: '500 cosmic points', category: 'mastery' },
  { id: 'points_1000', name: 'Galaxy', emoji: '\u{1F30C}', description: 'Reached 1000 cosmic points', requirement: '1000 cosmic points', category: 'mastery' },
  { id: 'points_5000', name: 'Universe', emoji: '\u{1F4AB}', description: 'Achieved 5000 cosmic points', requirement: '5000 cosmic points', category: 'mastery' },
];

/**
 * Check which badges a user has earned based on their stats.
 */
export function getEarnedBadges(
  streak: number,
  cosmicPoints: number,
  activeSystems: string[],
  compatChecks: number,
  hasShared: boolean,
): CosmicBadge[] {
  const earned: CosmicBadge[] = [];

  // Streak
  if (streak >= 3) earned.push(BADGES.find((b) => b.id === 'streak_3')!);
  if (streak >= 7) earned.push(BADGES.find((b) => b.id === 'streak_7')!);
  if (streak >= 14) earned.push(BADGES.find((b) => b.id === 'streak_14')!);
  if (streak >= 30) earned.push(BADGES.find((b) => b.id === 'streak_30')!);
  if (streak >= 90) earned.push(BADGES.find((b) => b.id === 'streak_90')!);
  if (streak >= 365) earned.push(BADGES.find((b) => b.id === 'streak_365')!);

  // Exploration
  if (activeSystems.length >= 4) earned.push(BADGES.find((b) => b.id === 'all_systems')!);
  earned.push(BADGES.find((b) => b.id === 'first_reading')!); // Always earned after onboarding

  // Social
  if (hasShared) earned.push(BADGES.find((b) => b.id === 'first_share')!);
  if (compatChecks >= 1) earned.push(BADGES.find((b) => b.id === 'first_compat')!);
  if (compatChecks >= 5) earned.push(BADGES.find((b) => b.id === 'compat_5')!);

  // Mastery
  if (cosmicPoints >= 100) earned.push(BADGES.find((b) => b.id === 'points_100')!);
  if (cosmicPoints >= 500) earned.push(BADGES.find((b) => b.id === 'points_500')!);
  if (cosmicPoints >= 1000) earned.push(BADGES.find((b) => b.id === 'points_1000')!);
  if (cosmicPoints >= 5000) earned.push(BADGES.find((b) => b.id === 'points_5000')!);

  return earned.filter(Boolean);
}

/**
 * Get the next badge the user can earn.
 */
export function getNextBadge(
  streak: number,
  cosmicPoints: number,
): CosmicBadge | null {
  if (streak < 3) return BADGES.find((b) => b.id === 'streak_3')!;
  if (streak < 7) return BADGES.find((b) => b.id === 'streak_7')!;
  if (cosmicPoints < 100) return BADGES.find((b) => b.id === 'points_100')!;
  if (streak < 30) return BADGES.find((b) => b.id === 'streak_30')!;
  if (cosmicPoints < 500) return BADGES.find((b) => b.id === 'points_500')!;
  if (streak < 90) return BADGES.find((b) => b.id === 'streak_90')!;
  if (cosmicPoints < 1000) return BADGES.find((b) => b.id === 'points_1000')!;
  return null;
}
