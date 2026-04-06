import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function CosmosScreen() {
  const { t } = useTranslation();

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <GlowText size="xl" align="center">
          {t('tabs.cosmos')}
        </GlowText>
        <Text style={styles.subtitle}>
          Connect with fellow cosmic explorers
        </Text>

        {/* Coming Soon Card */}
        <GradientCard>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonEmoji}>{'\u{1F30D}'}</Text>
            <Text style={styles.comingSoonTitle}>Community Coming Soon!</Text>
            <Text style={styles.comingSoonDesc}>
              The Cosmos community is being aligned by the stars. Soon you'll be able to:
            </Text>
            <View style={styles.featuresList}>
              <FeatureItem emoji={'\u{1F4AC}'} text="Share your daily readings & cosmic insights" />
              <FeatureItem emoji={'\u{1F91D}'} text="Join sign-based discussion groups" />
              <FeatureItem emoji={'\u{1F31F}'} text="Participate in weekly cosmic events" />
              <FeatureItem emoji={'\u{1F496}'} text="Find your cosmic tribe" />
              <FeatureItem emoji={'\u{1F4F8}'} text="Post & discover shareable cosmic cards" />
            </View>
          </View>
        </GradientCard>

        {/* Weekly Cosmic Event Preview */}
        <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
          <Text style={styles.eventLabel}>THIS WEEK'S COSMIC EVENT</Text>
          <Text style={styles.eventTitle}>New Moon Intention Setting</Text>
          <Text style={styles.eventDesc}>
            Set your intentions under the new moon's energy. Write down your dreams
            and let the cosmos amplify them. Every system agrees: new beginnings
            carry extra power during this phase.
          </Text>
        </GradientCard>

        {/* Daily Cosmic Fact */}
        <GradientCard>
          <Text style={styles.factLabel}>{'\u{1F4A1}'} DID YOU KNOW?</Text>
          <Text style={styles.factText}>
            CosmicSelf is the only app that combines Western, Vedic, Chinese, and KP
            astrology systems in one place. Your Cosmic DNA is unique across all 4
            traditions - no one else in the world has your exact combination!
          </Text>
        </GradientCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  spacer: { height: 60 },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  comingSoon: { alignItems: 'center' },
  comingSoonEmoji: { fontSize: 56 },
  comingSoonTitle: {
    color: COLORS.starGold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  comingSoonDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  featuresList: { width: '100%', gap: SPACING.sm },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureEmoji: { fontSize: 20 },
  featureText: { color: COLORS.white, fontSize: 14, flex: 1 },
  eventLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  eventTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  eventDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.sm,
  },
  factLabel: {
    color: COLORS.starGold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  factText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.sm,
  },
  bottomPad: { height: 20 },
});
