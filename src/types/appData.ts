import type { CompatibilityResult, CosmicProfile, DailyReading } from './astrology';
import type { AstrologySystem, BirthDetails } from './user';
import type { CompatibilityForecast } from '../engines/unified/crossCompatibility';

export type RelationshipMode = 'romantic' | 'friend' | 'work' | 'family';
export type SavedProfileRelation = 'partner' | 'friend' | 'family' | 'coworker' | 'other';

export interface SavedProfile {
  id: string;
  name: string;
  relation: SavedProfileRelation;
  birthDetails: BirthDetails;
  activeSystems: AstrologySystem[];
  profile: CosmicProfile;
  source: 'manual' | 'qr';
  cosmicDNA: string;
  createdAt: string;
  lastComparedAt?: string;
}

export interface ManagedProfile {
  id: string;
  name: string;
  relation: SavedProfileRelation;
  birthDetails: BirthDetails;
  activeSystems: AstrologySystem[];
  profile: CosmicProfile;
  cosmicDNA: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompatibilityHistoryEntry {
  id: string;
  partnerId?: string;
  partnerName: string;
  mode: RelationshipMode;
  result: CompatibilityResult;
  partnerProfile: CosmicProfile;
  createdAt: string;
  forecast?: CompatibilityForecast;
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  title?: string;
  body: string;
  mood: 'clear' | 'curious' | 'tender' | 'restless' | 'hopeful';
  linkedReadingDate?: string;
  moonPhaseKey?: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  moonPhaseLabel?: string;
  moonPhaseEmoji?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedProfilePayload {
  version: 1;
  id: string;
  name: string;
  birthDetails: BirthDetails;
  activeSystems: AstrologySystem[];
  profile: CosmicProfile;
  cosmicDNA: string;
  sharedAt: string;
}

export interface ReadingTimelineItem {
  date: string;
  reading: DailyReading;
  journalEntry?: JournalEntry;
}
