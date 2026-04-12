export type AdminSubscriptionTier = 'free' | 'premium';
export type AdminSubscriptionStatus = 'active' | 'expired' | 'trial' | 'unknown';
export type AdminBillingPeriod = 'monthly' | 'yearly';

export interface AdminUserListItem {
  uid: string;
  name: string;
  email: string | null;
  subscriptionTier: AdminSubscriptionTier;
  subscriptionStatus: AdminSubscriptionStatus;
  onboardingComplete: boolean;
  chartCalculated: boolean;
  disabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  language?: string | null;
  activeSystems: string[];
  cosmicPoints?: number;
  streak?: number;
  lastCheckIn?: string | null;
  birthPlaceName?: string | null;
  hasFcmToken: boolean;
  chartSummary: {
    hasWestern: boolean;
    hasVedic: boolean;
    hasChinese: boolean;
    hasKP: boolean;
  };
  counts: {
    dailyReadings: number;
    predictionRuns: number;
    connections: number;
  };
  rawProfile: Record<string, unknown>;
}

export interface AdminSubscriptionPatch {
  tier: Extract<AdminSubscriptionTier, 'free' | 'premium'>;
  status: Extract<AdminSubscriptionStatus, 'active' | 'expired' | 'trial'>;
  billingPeriod?: AdminBillingPeriod;
  productId?: string;
}

export interface AdminUserSearchResponse {
  users: AdminUserListItem[];
}

export interface AdminUserActionResult {
  success: boolean;
  uid: string;
  message: string;
}
