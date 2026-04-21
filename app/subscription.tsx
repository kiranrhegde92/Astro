import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../src/components/ui/StarField';
import { GlowText } from '../src/components/ui/GlowText';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GradientCard } from '../src/components/ui/GradientCard';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { NetworkBanner } from '../src/components/ui/NetworkBanner';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { useCosmicAlert } from '../src/components/ui/CosmicAlert';
import { PremiumCelebrationModal, type PremiumCelebrationVariant } from '../src/components/ui/PremiumCelebrationModal';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../src/constants/theme';
import { showRewardedAd } from '../src/services/rewardedAds';
import {
  configure as configureRevenueCat,
  fetchOfferings,
  getSetupIssue as getRevenueCatSetupIssue,
  isAvailable as isRevenueCatAvailable,
  isConfigured as isRevenueCatConfigured,
  purchasePackage,
  restorePurchases,
  type PremiumOfferings,
  type RCPackage,
} from '../src/services/revenueCat';
import { useAdUnlockStore } from '../src/store/adUnlockStore';
import { useUserStore } from '../src/store/userStore';
import type { PremiumFeatureKey } from '../src/types/entitlements';
import {
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_YEARLY_PRICE,
  getPremiumProductId,
  hasPremiumEntitlement,
} from '../src/utils/subscription';
import { FREE_FEATURES, PREMIUM_FEATURES } from '../src/utils/pricingCopy';
import type { SubscriptionPlanPeriod } from '../src/types/user';

const AD_UNLOCKS: Array<{ feature: PremiumFeatureKey; title: string; desc: string }> = [
  { feature: 'extra_compatibility_check', title: 'Extra match check', desc: 'Run one more compatibility check today.' },
  { feature: 'full_blended_reading', title: 'Full blended reading', desc: 'Open one premium Daily Blend reading.' },
  { feature: 'period_forecast', title: 'Forecast view', desc: 'Unlock one weekly or monthly forecast view.' },
  { feature: 'premium_share_card', title: 'No-watermark share card', desc: 'Export one cleaner premium card.' },
];

function getRevenueCatFallbackMessage(action: 'subscribe' | 'restore'): string {
  const actionText =
    action === 'restore' ? 'Restoring purchases' : 'Starting a subscription';
  const issue = getRevenueCatSetupIssue();
  if (issue === 'web') {
    return `${actionText} is only available in the iOS or Android app. Web builds cannot open App Store or Play Store billing.`;
  }
  if (issue === 'expo-go') {
    return `${actionText} requires a development or production build. Expo Go does not include the RevenueCat native module.`;
  }
  if (issue === 'missing-api-key') {
    return `${actionText} is disabled because the RevenueCat API key for this platform is not configured in app.json.`;
  }
  if (issue === 'test-api-key') {
    return `${actionText} is disabled in release builds because this app is using a RevenueCat Test Store key. Add the production RevenueCat public SDK key before shipping subscriptions.`;
  }
  return `${actionText} is not ready yet. Check the RevenueCat native build setup and try again.`;
}

function getRevenueCatErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Store billing could not complete. Please try again.';
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const grantUnlock = useAdUnlockStore((state) => state.grantUnlock);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanPeriod>('yearly');
  const [offerings, setOfferings] = useState<PremiumOfferings | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [loadingFeature, setLoadingFeature] = useState<PremiumFeatureKey | null>(null);
  const [celebration, setCelebration] = useState<PremiumCelebrationVariant | null>(null);
  const { showAlert, alertModal } = useCosmicAlert();

  useEffect(() => {
    let mounted = true;
    async function loadOfferings() {
      if (!user?.id || getRevenueCatSetupIssue() || !isRevenueCatAvailable()) return;
      await configureRevenueCat(user.id);
      if (!mounted || !isRevenueCatConfigured()) return;
      const nextOfferings = await fetchOfferings();
      if (mounted) setOfferings(nextOfferings);
    }

    loadOfferings().catch((error) => {
      console.warn('[Subscription] RevenueCat offerings failed:', error);
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (!user) return null;
  const subscription = user.subscription;
  const isAlreadyPremium = hasPremiumEntitlement(subscription);
  const monthlyPrice = offerings?.monthlyPrice ?? PREMIUM_MONTHLY_PRICE;
  const yearlyPrice = offerings?.yearlyPrice ?? PREMIUM_YEARLY_PRICE;
  const selectedProductId = getPremiumProductId(selectedPlan);

  const ensureRevenueCatReady = async () => {
    if (!isRevenueCatAvailable()) return false;
    await configureRevenueCat(user.id);
    return isRevenueCatConfigured();
  };

  const getSelectedPackage = async (): Promise<RCPackage | null> => {
    const ready = await ensureRevenueCatReady();
    if (!ready) return null;

    const nextOfferings = offerings ?? (await fetchOfferings());
    if (nextOfferings) setOfferings(nextOfferings);
    return selectedPlan === 'yearly'
      ? nextOfferings?.yearlyPkg ?? null
      : nextOfferings?.monthlyPkg ?? null;
  };

  const handleSubscribe = async () => {
    if (purchaseLoading || restoreLoading) return;
    if (isAlreadyPremium) {
      router.back();
      return;
    }

    setPurchaseLoading(true);
    try {
      const pkg = await getSelectedPackage();
      if (!pkg) {
        const setupIssue = getRevenueCatSetupIssue();
        showAlert(
          setupIssue ? 'Purchases unavailable' : 'Plan unavailable',
          setupIssue
            ? getRevenueCatFallbackMessage('subscribe')
            : `RevenueCat is configured, but ${selectedProductId} is not in the current offering. Check the RevenueCat product and offering setup.`,
        );
        return;
      }

      const nextSubscription = await purchasePackage(pkg);
      if (!nextSubscription) {
        showAlert('Purchase canceled', 'No subscription changes were made.');
        return;
      }

      setSubscription(nextSubscription);
      if (!hasPremiumEntitlement(nextSubscription)) {
        showAlert(
          'Purchase incomplete',
          'The store purchase finished, but RevenueCat did not return the premium entitlement. Check the premium entitlement setup.',
        );
        return;
      }

      setCelebration(nextSubscription.status === 'trial' ? 'trial' : 'purchase');
    } catch (error) {
      showAlert('Purchase failed', getRevenueCatErrorMessage(error));
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    if (purchaseLoading || restoreLoading) return;

    setRestoreLoading(true);
    try {
      const ready = await ensureRevenueCatReady();
      if (!ready) {
        showAlert('Restore unavailable', getRevenueCatFallbackMessage('restore'));
        return;
      }

      const restoredSubscription = await restorePurchases();
      setSubscription(restoredSubscription);
      if (hasPremiumEntitlement(restoredSubscription)) {
        setCelebration('restore');
      } else {
        showAlert('Restore purchases', 'No previous premium subscription was found for this App Store or Play Store account.');
      }
    } catch (error) {
      showAlert('Restore failed', getRevenueCatErrorMessage(error));
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleAdUnlock = async (feature: PremiumFeatureKey) => {
    if (loadingFeature) return;
    setLoadingFeature(feature);
    try {
      const earned = await showRewardedAd(feature);
      if (!earned) {
        showAlert('Ad not completed', 'No unlock was added. Try again when a rewarded ad is available.');
        return;
      }
      await grantUnlock(feature);
      showAlert('Unlocked once', 'Your one-time premium unlock is ready to use.');
    } finally {
      setLoadingFeature(null);
    }
  };

  return (
    <StarField>
      <ScreenHeader title="CosmicSelf+" accentColor={COLORS.starGold} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerEmoji}>{'\u2728'}</Text>
        <GlowText size="lg" align="center" color={COLORS.starGold}>
          Go Deeper Without Losing the Daily Ritual
        </GlowText>
        <Text style={styles.subtitle}>
          Free stays useful. Premium removes limits and opens the richer forecasts, profiles, archive, alerts, and clean share cards.
        </Text>

        {isAlreadyPremium ? (
          <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
            <Text style={styles.activeTitle}>{'\u2713'} Premium is active</Text>
            <Text style={styles.activeDesc}>You have unlimited checks, forecasts, profiles, alerts, and no ads.</Text>
          </GradientCard>
        ) : (
          <>
            <View style={styles.planRow}>
              <PlanCard
                title="Yearly"
                price={yearlyPrice}
                period="per year"
                detail="Best value"
                active={selectedPlan === 'yearly'}
                onPress={() => setSelectedPlan('yearly')}
              />
              <PlanCard
                title="Monthly"
                price={monthlyPrice}
                period="per month"
                detail="Flexible"
                active={selectedPlan === 'monthly'}
                onPress={() => setSelectedPlan('monthly')}
              />
            </View>

            <CosmicButton
              title={
                isAlreadyPremium
                  ? 'Manage subscription'
                  : selectedPlan === 'yearly'
                  ? 'Start 7-day free trial · Yearly'
                  : 'Start 7-day free trial · Monthly'
              }
              onPress={() => void handleSubscribe()}
              colors={[COLORS.starGold, COLORS.sunOrange]}
              loading={purchaseLoading}
              disabled={restoreLoading}
            />
            <Text style={styles.trialNote}>
              Free for the first 7 days. After that, billing continues at the selected plan through App Store or Play Store. Cancel anytime from your store account.
            </Text>
            {getRevenueCatSetupIssue() ? (
              <NetworkBanner
                variant="failure"
                title="Store billing unavailable"
                body={getRevenueCatFallbackMessage('subscribe')}
              />
            ) : null}
          </>
        )}

        <GradientCard>
          <Text style={styles.featuresTitle}>Premium unlocks</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.text} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </GradientCard>

        <GradientCard accentColor={COLORS.tide}>
          <Text style={styles.featuresTitle}>Free includes</Text>
          {FREE_FEATURES.map((feature) => (
            <View key={feature} style={styles.freeRow}>
              <Text style={styles.freeBullet}>{'\u2022'}</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </GradientCard>

        {!hasPremiumEntitlement(subscription) ? (
          <GradientCard accentColor={COLORS.coral}>
            <Text style={styles.featuresTitle}>Watch an ad, unlock once</Text>
            <Text style={styles.passDesc}>
              One completed rewarded ad gives one token for the selected action.
            </Text>
            {AD_UNLOCKS.map((item) => (
              <AdUnlockRow
                key={item.feature}
                title={item.title}
                desc={item.desc}
                loading={loadingFeature === item.feature}
                disabled={Boolean(loadingFeature)}
                onPress={() => void handleAdUnlock(item.feature)}
              />
            ))}
          </GradientCard>
        ) : null}

        <TouchableOpacity
          onPress={() => void handleRestore()}
          style={[styles.restoreBtn, (purchaseLoading || restoreLoading) && styles.restoreBtnDisabled]}
          disabled={purchaseLoading || restoreLoading}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          accessibilityState={{ disabled: purchaseLoading || restoreLoading, busy: restoreLoading }}
        >
          {restoreLoading ? (
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment will be charged to your App Store or Play Store account.
          Subscriptions renew automatically unless canceled in your device settings.
        </Text>
        <View style={styles.legalLinksRow}>
          <TouchableOpacity
            onPress={() => router.push('/legal/privacy')}
            activeOpacity={0.84}
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
            hitSlop={8}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity
            onPress={() => router.push('/legal/terms')}
            activeOpacity={0.84}
            accessibilityRole="link"
            accessibilityLabel="Terms of Service"
            hitSlop={8}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
      </ResetScrollView>
      {alertModal}
      <PremiumCelebrationModal
        visible={celebration !== null}
        variant={celebration ?? 'purchase'}
        onDismiss={() => {
          setCelebration(null);
          router.back();
        }}
      />
    </StarField>
  );
}

function PlanCard({
  title,
  price,
  period,
  detail,
  active,
  onPress,
}: {
  title: string;
  price: string;
  period: string;
  detail: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.planCard, active && styles.planCardActive]}
      onPress={onPress}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={`${title} plan, ${price} ${period}, ${detail}`}
      accessibilityState={{ selected: active }}
    >
      {title === 'Yearly' ? (
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>Save $10</Text>
        </View>
      ) : null}
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      <Text style={styles.planPeriod}>{period}</Text>
      <Text style={styles.planMonthly}>{detail}</Text>
    </TouchableOpacity>
  );
}

function AdUnlockRow({
  title,
  desc,
  loading,
  disabled,
  onPress,
}: {
  title: string;
  desc: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.passItem}>
      <View style={styles.passInfo}>
        <Text style={styles.passName}>{title}</Text>
        <Text style={styles.passDesc2}>{desc}</Text>
      </View>
      <TouchableOpacity
        style={[styles.passBuyBtn, disabled && !loading && styles.passBuyBtnDisabled]}
        onPress={onPress}
        activeOpacity={0.84}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Watch rewarded ad to unlock ${title}`}
        accessibilityState={{ disabled, busy: loading }}
      >
        {loading ? <ActivityIndicator size="small" color={COLORS.tide} /> : <Text style={styles.passBuyText}>Watch ad</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: SPACING.sm },
  activeTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  activeDesc: { color: COLORS.textSecondary, fontSize: 14, marginTop: SPACING.xs },
  planRow: { flexDirection: 'row', gap: SPACING.sm },
  planCard: {
    flex: 1,
    minHeight: 148,
    backgroundColor: COLORS.glassBg,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardActive: { borderColor: COLORS.starGold, backgroundColor: COLORS.bgElevated },
  saveBadge: {
    backgroundColor: COLORS.starGold,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  saveText: { color: COLORS.bgDeep, fontSize: 11, fontWeight: '800' },
  planTitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 0.8 },
  planPrice: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 },
  planPeriod: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  planMonthly: { color: COLORS.starGold, fontSize: 12, fontWeight: '700', marginTop: SPACING.xs },
  trialNote: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  billingNote: { color: COLORS.coral, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  featuresTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading, marginBottom: SPACING.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  featureEmoji: { fontSize: 20 },
  featureText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, flex: 1 },
  freeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  freeBullet: { color: COLORS.tide, fontSize: 18, lineHeight: 20 },
  passDesc: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginBottom: SPACING.md },
  passItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  passInfo: { flex: 1, paddingRight: SPACING.sm },
  passName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  passDesc2: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, marginTop: 1 },
  passBuyBtn: {
    minWidth: 86,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassHighlight,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  passBuyBtnDisabled: { opacity: 0.45 },
  passBuyText: { color: COLORS.tide, fontSize: 12, fontWeight: '800' },
  restoreBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  restoreBtnDisabled: { opacity: 0.45 },
  restoreText: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  legalText: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16, textAlign: 'center' },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  legalLink: {
    color: COLORS.iris,
    fontSize: 12,
    fontFamily: FONTS.heading,
  },
  legalDivider: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  bottomPad: { height: 20 },
});
