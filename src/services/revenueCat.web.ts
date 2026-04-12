import type { Subscription } from '../types/user';

export type RCPackage = unknown;
export type RevenueCatSetupIssue = 'web' | 'expo-go' | 'missing-api-key';

export interface PremiumOfferings {
  monthlyPkg: RCPackage | null;
  yearlyPkg: RCPackage | null;
  monthlyPrice: string;
  yearlyPrice: string;
}

const FREE: Subscription = { tier: 'free', status: 'expired' };

export function isAvailable(): boolean {
  return false;
}

export function getSetupIssue(): RevenueCatSetupIssue {
  return 'web';
}

export function isConfigured(): boolean {
  return false;
}

export async function configure(_appUserId?: string): Promise<void> {}

export async function fetchOfferings(): Promise<PremiumOfferings | null> {
  return null;
}

export async function purchasePackage(_pkg: RCPackage): Promise<Subscription | null> {
  return null;
}

export async function restorePurchases(): Promise<Subscription> {
  return FREE;
}

export async function fetchSubscriptionStatus(): Promise<Subscription> {
  return FREE;
}
