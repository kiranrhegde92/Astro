import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StarField } from '../../src/components/ui/StarField';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { WebLegalPage } from '../../src/components/web/WebLegalPage';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

const UPDATED = 'Last updated April 19, 2026.';

const SECTIONS = [
  {
    title: 'Using CosmicSelf',
    body:
      'CosmicSelf provides astrology-based reflection tools, readings, compatibility summaries, journaling, and sharing features for personal insight and entertainment. It is not medical, legal, financial, or mental health advice.',
  },
  {
    title: 'Accounts',
    body:
      'You are responsible for keeping your sign-in credentials secure and for the activity that happens under your account. If you suspect unauthorized access, sign out of shared devices and rotate your credentials through your auth provider.',
  },
  {
    title: 'Subscriptions and premium access',
    body:
      'Premium features may include forecasts, deeper readings, transit alerts, cleaner share cards, more profiles, and reduced ads. Billing language in the app applies once real store purchases are connected. Restore and cancellation behavior will follow the relevant app store rules.',
  },
  {
    title: 'Shared content',
    body:
      'When you generate a share card, QR code, or share link, you are choosing to expose that content to whoever receives it. Only share readings or chart details you are comfortable making visible to others.',
  },
  {
    title: 'Acceptable use',
    body:
      'Do not misuse the service, attempt to interfere with infrastructure, scrape private user data, impersonate others, or use generated content in a harmful or deceptive way.',
  },
  {
    title: 'Changes and availability',
    body:
      'Features may evolve during the v2 rollout. We may add, remove, or revise screens, wording, entitlement rules, and data flows as the product matures.',
  },
  {
    title: 'Ending your use',
    body:
      'You can stop using the app at any time, sign out, or delete your account from Settings. We may also suspend access for abuse, fraud, or clear violations of these terms.',
  },
];

export default function TermsOfServiceScreen() {
  if (Platform.OS === 'web') {
    return (
      <WebLegalPage
        eyebrow="COSMICSELF LEGAL"
        title="Terms of Service"
        headline="The simple rules for using the app and its premium features."
        updated={UPDATED}
        sections={SECTIONS}
        metaDescription="Terms for using CosmicSelf — personal astrology reflection tools across Western, Vedic, Chinese, and KP systems."
      />
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Terms of Service" accentColor={COLORS.plum} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>COSMICSELF LEGAL</Text>
        <Text style={styles.headline}>The simple rules for using the app and its premium features.</Text>
        <Text style={styles.updated}>{UPDATED}</Text>

        {SECTIONS.map((section) => (
          <GradientCard key={section.title} style={styles.card} accentColor={COLORS.plum}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </GradientCard>
        ))}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  updated: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  cardBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPad: {
    height: 20,
  },
});
