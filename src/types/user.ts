import type { WesternProfile, VedicProfile, ChineseProfile, KPProfile } from './astrology';

export type AstrologySystem = 'western' | 'vedic' | 'chinese' | 'kp';

export type SubscriptionTier = 'free' | 'premium' | 'family';
export type SubscriptionStatus = 'active' | 'expired' | 'trial';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt?: Date;
  trialEndsAt?: Date;
  purchasedItems: string[];
}

export interface BirthDetails {
  date: Date;
  time?: string;        // HH:mm format
  place?: {
    name: string;
    lat: number;
    lng: number;
    timezone: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  language: string;
  birthDetails: BirthDetails;
  activeSystems: AstrologySystem[];
  western?: WesternProfile;
  vedic?: VedicProfile;
  chinese?: ChineseProfile;
  kp?: KPProfile;
  subscription: Subscription;
  cosmicPoints: number;
  streak: number;
  lastCheckIn?: string;
  onboardingComplete: boolean;
  createdAt: Date;
}
