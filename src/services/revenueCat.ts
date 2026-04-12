import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Subscription, SubscriptionPlanPeriod } from '../types/user';
import {
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_MONTHLY_PRODUCT_ID,
  PREMIUM_YEARLY_PRICE,
  PREMIUM_YEARLY_PRODUCT_ID,
} from '../utils/subscription';
import { RevenueCatConfig } from '../config';

const ENTITLEMENT_ID = 'premium';
const IS_EXPO_GO = Constants.appOwnership === 'expo';

export type RevenueCatSetupIssue = 'web' | 'expo-go' | 'missing-api-key';

function getApiKey(): string | undefined {
  const key = Platform.OS === 'ios' ? RevenueCatConfig.iosApiKey : RevenueCatConfig.androidApiKey;
  return key || undefined;
}

/** Opaque handle — pass back to purchasePackage(). */
export type RCPackage = unknown;

export interface PremiumOfferings {
  monthlyPkg: RCPackage | null;
  yearlyPkg: RCPackage | null;
  monthlyPrice: string;
  yearlyPrice: string;
}

let configured = false;
let configuredAppUserId: string | undefined;

/** True when RevenueCat can run (native build, not web, not Expo Go). */
export function isAvailable(): boolean {
  return Platform.OS !== 'web' && !IS_EXPO_GO;
}

/** Why RevenueCat cannot be configured in this runtime, if known. */
export function getSetupIssue(): RevenueCatSetupIssue | null {
  if (Platform.OS === 'web') return 'web';
  if (IS_EXPO_GO) return 'expo-go';
  if (!getApiKey()) return 'missing-api-key';
  return null;
}

/** True after configure() has completed successfully. */
export function isConfigured(): boolean {
  return configured;
}

/**
 * Initialise the RevenueCat SDK. Safe to call multiple times — the second
 * call with a different appUserId will call logIn() instead of reconfiguring.
 */
export async function configure(appUserId?: string): Promise<void> {
  if (!isAvailable()) return;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    if (!configured) {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.warn('[RevenueCat] No API key configured — skipping init');
        return;
      }
      Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
      configured = true;
      configuredAppUserId = appUserId;
    } else if (appUserId && appUserId !== configuredAppUserId) {
      await Purchases.logIn(appUserId);
      configuredAppUserId = appUserId;
    }
  } catch (e) {
    console.warn('[RevenueCat] configure failed:', e);
  }
}

/** Fetch available packages with store-localised prices. */
export async function fetchOfferings(): Promise<PremiumOfferings | null> {
  if (!isAvailable() || !configured) return null;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;

    const packages = (current as any).availablePackages ?? [];
    const findPackage = (productId: string) =>
      packages.find((pkg: any) => {
        const product = pkg?.product;
        return (
          product?.identifier === productId ||
          product?.productIdentifier === productId
        );
      }) ?? null;

    const monthly =
      findPackage(PREMIUM_MONTHLY_PRODUCT_ID) ?? current.monthly ?? null;
    const yearly =
      findPackage(PREMIUM_YEARLY_PRODUCT_ID) ?? current.annual ?? null;

    return {
      monthlyPkg: monthly,
      yearlyPkg: yearly,
      monthlyPrice: (monthly as any)?.product?.priceString ?? PREMIUM_MONTHLY_PRICE,
      yearlyPrice: (yearly as any)?.product?.priceString ?? PREMIUM_YEARLY_PRICE,
    };
  } catch (e) {
    console.warn('[RevenueCat] fetchOfferings failed:', e);
    return null;
  }
}

/**
 * Purchase a package obtained from fetchOfferings().
 * Returns the mapped Subscription on success, null if the user cancelled.
 * Throws on unexpected errors.
 */
export async function purchasePackage(pkg: RCPackage): Promise<Subscription | null> {
  if (!isAvailable() || !configured || !pkg) return null;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const { customerInfo } = await Purchases.purchasePackage(pkg as any);
    return mapCustomerInfo(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return null;
    throw e;
  }
}

/** Restore previous purchases. Returns the resulting subscription state. */
export async function restorePurchases(): Promise<Subscription> {
  if (!isAvailable() || !configured) {
    return { tier: 'free', status: 'expired' };
  }
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.restorePurchases();
    return mapCustomerInfo(customerInfo);
  } catch (e) {
    console.warn('[RevenueCat] restorePurchases failed:', e);
    throw e;
  }
}

/** Query RevenueCat for the current entitlement status. */
export async function fetchSubscriptionStatus(): Promise<Subscription> {
  if (!isAvailable() || !configured) {
    return { tier: 'free', status: 'expired' };
  }
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.getCustomerInfo();
    return mapCustomerInfo(customerInfo);
  } catch (e) {
    console.warn('[RevenueCat] fetchSubscriptionStatus failed:', e);
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapCustomerInfo(info: any): Subscription {
  const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID];
  if (!entitlement) {
    return { tier: 'free', status: 'expired' };
  }

  const productId: string =
    entitlement.productIdentifier ?? entitlement.productId ?? '';
  const isYearly = productId === PREMIUM_YEARLY_PRODUCT_ID;
  const billingPeriod: SubscriptionPlanPeriod = isYearly ? 'yearly' : 'monthly';
  const isTrial = String(entitlement.periodType).toUpperCase() === 'TRIAL';

  const expiresAt = entitlement.expirationDate
    ? new Date(entitlement.expirationDate)
    : undefined;

  return {
    tier: 'premium',
    status: isTrial ? 'trial' : 'active',
    billingPeriod,
    productId,
    expiresAt,
    ...(isTrial && expiresAt ? { trialEndsAt: expiresAt } : {}),
  };
}
