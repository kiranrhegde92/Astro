import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../src/components/ui/StarField';
import { GlowText } from '../src/components/ui/GlowText';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GradientCard } from '../src/components/ui/GradientCard';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { useCosmicAlert } from '../src/components/ui/CosmicAlert';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../src/constants/theme';
import { showRewardedAd } from '../src/services/rewardedAds';
import { useAdUnlockStore } from '../src/store/adUnlockStore';
import { useUserStore } from '../src/store/userStore';
import type { PremiumFeatureKey } from '../src/types/entitlements';
import {
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_YEARLY_PRICE,
  hasPremiumEntitlement,
} from '../src/utils/subscription';
import type { SubscriptionPlanPeriod } from '../src/types/user';

const PREMIUM_FEATURES = [
  { emoji: '\u{1F496}', text: 'Unlimited compatibility checks and deeper match readings' },
  { emoji: '\u{1F30C}', text: 'Weekly and monthly forecasts across your active systems' },
  { emoji: '\u{1F52D}', text: 'Full blended readings with source-backed system details' },
  { emoji: '\u{1F4DA}', text: 'Full reading archive instead of the free recent-days view' },
  { emoji: '\u{1F514}', text: 'Real-time high-impact transit alerts' },
  { emoji: '\u{1F4E4}', text: 'Premium share cards with no watermark' },
  { emoji: '\u{1F465}', text: '5 switchable profiles total: you plus 4 family profiles' },
  { emoji: '\u{1F6AB}', text: 'Ad-free experience' },
];

const FREE_FEATURES = [
  'Daily spoken-style reading',
  'Basic chart summary',
  '1 compatibility check per day',
  'Recent reading archive',
  'Journal access',
  'Rewarded ads for one-time premium unlocks',
];

const AD_UNLOCKS: Array<{ feature: PremiumFeatureKey; title: string; desc: string }> = [
  { feature: 'extra_compatibility_check', title: 'Extra match check', desc: 'Run one more compatibility check today.' },
  { feature: 'full_blended_reading', title: 'Full blended reading', desc: 'Open one premium Daily Blend reading.' },
  { feature: 'period_forecast', title: 'Forecast view', desc: 'Unlock one weekly or monthly forecast view.' },
  { feature: 'premium_share_card', title: 'No-watermark share card', desc: 'Export one cleaner premium card.' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const startTrial = useUserStore((state) => state.startTrial);
  const upgradeSubscription = useUserStore((state) => state.upgradeSubscription);
  const grantUnlock = useAdUnlockStore((state) => state.grantUnlock);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanPeriod>('yearly');
  const [loadingFeature, setLoadingFeature] = useState<PremiumFeatureKey | null>(null);
  const { showAlert, alertModal } = useCosmicAlert();

  if (!user) return null;
  const subscription = user.subscription;
  const isAlreadyPremium = hasPremiumEntitlement(subscription) && subscription.status === 'active';

  const handleSubscribe = () => {
    if (isAlreadyPremium) {
      router.back();
      return;
    }
    // TODO: Replace with RevenueCat purchaseProduct() using monthly/yearly product IDs.
    if (subscription.status === 'trial') {
      upgradeSubscription(selectedPlan);
    } else if (selectedPlan === 'yearly') {
      startTrial();
    } else {
      upgradeSubscription(selectedPlan);
    }
    router.back();
  };

  const handleRestore = () => {
    // TODO: In production, call RevenueCat.restorePurchases() here.
    showAlert('Restore purchases', 'No previous premium subscription was found on this device.');
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
                price={PREMIUM_YEARLY_PRICE}
                period="per year"
                detail="Best value"
                active={selectedPlan === 'yearly'}
                onPress={() => setSelectedPlan('yearly')}
              />
              <PlanCard
                title="Monthly"
                price={PREMIUM_MONTHLY_PRICE}
                period="per month"
                detail="Flexible"
                active={selectedPlan === 'monthly'}
                onPress={() => setSelectedPlan('monthly')}
              />
            </View>

            <CosmicButton
              title={selectedPlan === 'yearly' ? 'Start 7-Day Free Trial' : 'Upgrade Monthly'}
              onPress={handleSubscribe}
              colors={[COLORS.starGold, COLORS.sunOrange]}
            />
            <Text style={styles.trialNote}>
              Yearly starts with a 7-day trial. Monthly starts immediately until real store billing is wired.
            </Text>
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

        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment will be charged to your App Store or Play Store account after real billing is connected.
          Subscriptions renew automatically unless canceled in your device settings.
        </Text>

        <View style={styles.bottomPad} />
      </ResetScrollView>
      {alertModal}
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
    <TouchableOpacity style={[styles.planCard, active && styles.planCardActive]} onPress={onPress} activeOpacity={0.84}>
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
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardActive: { borderColor: COLORS.starGold, backgroundColor: 'rgba(255,255,255,0.84)' },
  saveBadge: {
    backgroundColor: COLORS.starGold,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  saveText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '800' },
  planTitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 0.8 },
  planPrice: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 },
  planPeriod: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  planMonthly: { color: COLORS.starGold, fontSize: 12, fontWeight: '700', marginTop: SPACING.xs },
  trialNote: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
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
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  passBuyBtnDisabled: { opacity: 0.45 },
  passBuyText: { color: COLORS.tide, fontSize: 12, fontWeight: '800' },
  restoreBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  restoreText: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  legalText: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16, textAlign: 'center' },
  bottomPad: { height: 20 },
});
