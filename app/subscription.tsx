import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../src/components/ui/StarField';
import { GlowText } from '../src/components/ui/GlowText';
import { GradientCard } from '../src/components/ui/GradientCard';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useSubscriptionStore } from '../src/store/subscriptionStore';

type PlanType = 'monthly' | 'yearly';

const PREMIUM_FEATURES = [
  { emoji: '\u{1F496}', text: 'Unlimited compatibility checks' },
  { emoji: '\u{1F52D}', text: 'Full natal chart with all planets & houses' },
  { emoji: '\u{23F0}', text: 'Complete Dasha timeline with sub-periods' },
  { emoji: '\u{1F48E}', text: 'Personalized gemstone & mantra remedies' },
  { emoji: '\u{1F409}', text: 'Full Four Pillars (Ba Zi) deep analysis' },
  { emoji: '\u{1F30C}', text: 'Monthly unified cosmic report' },
  { emoji: '\u{1F4E4}', text: 'Premium shareable cards (no watermark)' },
  { emoji: '\u{1F514}', text: 'Real-time transit alerts' },
  { emoji: '\u{1F6AB}', text: 'Ad-free experience' },
  { emoji: '\u{1F465}', text: 'Save up to 5 profiles' },
];

const FAMILY_EXTRAS = [
  { emoji: '\u{1F46A}', text: 'Up to 5 family members get Premium' },
  { emoji: '\u{1F4C5}', text: 'Shared family cosmic calendar' },
  { emoji: '\u{1F496}', text: 'Family compatibility dashboard' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { startTrial, upgradeTo, subscription } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [selectedTier, setSelectedTier] = useState<'premium' | 'family'>('premium');

  const handleSubscribe = () => {
    // In production, this would trigger in-app purchase via RevenueCat
    if (subscription.status === 'active' && subscription.tier !== 'free') {
      router.back();
      return;
    }
    startTrial();
    router.back();
  };

  const handleRestore = () => {
    // In production, this would call RevenueCat restore purchases
  };

  const isAlreadyPremium = subscription.tier !== 'free' && subscription.status === 'active';

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerEmoji}>{'\u2728'}</Text>
        <GlowText size="xl" align="center" color={COLORS.starGold}>
          Unlock Your Full Cosmos
        </GlowText>
        <Text style={styles.subtitle}>
          Go deeper with all 4 astrology systems
        </Text>

        {isAlreadyPremium ? (
          <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
            <Text style={styles.activeTitle}>{'\u2713'} You're a CosmicSelf+ Member!</Text>
            <Text style={styles.activeDesc}>
              {subscription.status === 'trial' ? 'Free trial active' : 'Premium active'}.
              Enjoy unlimited cosmic insights.
            </Text>
          </GradientCard>
        ) : (
          <>
            {/* Tier Selector */}
            <View style={styles.tierSelector}>
              <TouchableOpacity
                style={[styles.tierTab, selectedTier === 'premium' && styles.tierTabActive]}
                onPress={() => setSelectedTier('premium')}
              >
                <Text style={[styles.tierTabText, selectedTier === 'premium' && styles.tierTabTextActive]}>
                  Premium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tierTab, selectedTier === 'family' && styles.tierTabActive]}
                onPress={() => setSelectedTier('family')}
              >
                <Text style={[styles.tierTabText, selectedTier === 'family' && styles.tierTabTextActive]}>
                  Family
                </Text>
              </TouchableOpacity>
            </View>

            {/* Plan Cards */}
            <View style={styles.planRow}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>Save 48%</Text>
                </View>
                <Text style={styles.planPrice}>
                  {selectedTier === 'premium' ? '$49.99' : '$99.99'}
                </Text>
                <Text style={styles.planPeriod}>per year</Text>
                <Text style={styles.planMonthly}>
                  {selectedTier === 'premium' ? '$4.17/mo' : '$8.33/mo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planPrice}>
                  {selectedTier === 'premium' ? '$7.99' : '$12.99'}
                </Text>
                <Text style={styles.planPeriod}>per month</Text>
                <Text style={styles.planMonthly}>Flexible</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <CosmicButton
              title="Start 7-Day Free Trial"
              onPress={handleSubscribe}
              colors={[COLORS.starGold, COLORS.sunOrange]}
            />
            <Text style={styles.trialNote}>
              No charge for 7 days. Cancel anytime.
            </Text>
          </>
        )}

        {/* Features */}
        <GradientCard>
          <Text style={styles.featuresTitle}>
            {selectedTier === 'premium' ? 'CosmicSelf+ Premium' : 'Cosmic Circle Family'}
          </Text>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
          {selectedTier === 'family' && (
            <>
              <View style={styles.familyDivider} />
              <Text style={styles.familyTitle}>Family Extras</Text>
              {FAMILY_EXTRAS.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </>
          )}
        </GradientCard>

        {/* One-Time Purchases */}
        <GradientCard>
          <Text style={styles.featuresTitle}>{'\u{1F4B3}'} Cosmic Pass (One-Time)</Text>
          <Text style={styles.passDesc}>
            Don't want a subscription? Buy individual features:
          </Text>
          <PassItem name="Single Deep Reading" price="$2.99" desc="Full natal chart for one system" />
          <PassItem name="Compatibility Deep Dive" price="$3.99" desc="Detailed cross-system report" />
          <PassItem name="Year-Ahead Forecast" price="$4.99" desc="Annual prediction all systems" />
          <PassItem name="Remedy Pack" price="$1.99" desc="Personalized Vedic remedies" />
          <PassItem name="Premium Card Pack" price="$0.99" desc="5 exclusive card designs" />
        </GradientCard>

        {/* Restore + Legal */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment will be charged to your App Store/Play Store account. Subscription automatically
          renews unless auto-renew is turned off at least 24 hours before the end of the current
          period. Manage subscriptions in your device settings.
        </Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function PassItem({ name, price, desc }: { name: string; price: string; desc: string }) {
  return (
    <View style={styles.passItem}>
      <View style={styles.passInfo}>
        <Text style={styles.passName}>{name}</Text>
        <Text style={styles.passDesc2}>{desc}</Text>
      </View>
      <TouchableOpacity style={styles.passBuyBtn}>
        <Text style={styles.passBuyText}>{price}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  spacer: { height: 50 },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: SPACING.sm },
  activeTitle: { color: COLORS.starGold, fontSize: 18, fontWeight: '700' },
  activeDesc: { color: COLORS.textSecondary, fontSize: 14, marginTop: SPACING.xs },
  tierSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
  },
  tierTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  tierTabActive: { backgroundColor: COLORS.starGold },
  tierTabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  tierTabTextActive: { color: COLORS.deepSpace, fontWeight: '700' },
  planRow: { flexDirection: 'row', gap: SPACING.sm },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  planCardActive: { borderColor: COLORS.starGold, backgroundColor: 'rgba(255,215,0,0.06)' },
  saveBadge: {
    backgroundColor: COLORS.starGold,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  saveText: { color: COLORS.deepSpace, fontSize: 11, fontWeight: '800' },
  planPrice: { color: COLORS.white, fontSize: 24, fontWeight: '800' },
  planPeriod: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  planMonthly: { color: COLORS.starGold, fontSize: 12, fontWeight: '600', marginTop: SPACING.xs },
  trialNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  featuresTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  featureEmoji: { fontSize: 20 },
  featureText: { color: COLORS.textSecondary, fontSize: 14, flex: 1 },
  familyDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: SPACING.md,
  },
  familyTitle: { color: COLORS.starGold, fontSize: 14, fontWeight: '700', marginBottom: SPACING.xs },
  passDesc: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md },
  passItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  passInfo: { flex: 1 },
  passName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  passDesc2: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  passBuyBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  passBuyText: { color: COLORS.starGold, fontSize: 13, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  restoreText: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  legalText: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16, textAlign: 'center' },
  bottomPad: { height: 20 },
});
