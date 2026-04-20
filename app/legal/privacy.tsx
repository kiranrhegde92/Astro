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
    title: 'What we collect',
    body:
      'CosmicSelf stores the profile details you enter to generate readings: your name, birth details, active astrology systems, subscription state, journal entries, saved readings, compatibility connections, and notification preferences.',
  },
  {
    title: 'How we use it',
    body:
      'We use your data to calculate charts, personalize daily readings, save your streak and journal history, support compatibility features, and deliver reminders or future transit alerts that you choose to enable.',
  },
  {
    title: 'Sharing',
    body:
      'We do not sell your personal data. Shared profile links and QR codes only expose the information you explicitly choose to share through the app. Compatibility and friend-style features remain under your control.',
  },
  {
    title: 'Storage',
    body:
      'Some data is stored locally on your device for speed and offline access. Signed-in account data can also be stored in our backend so it can sync across sessions and devices.',
  },
  {
    title: 'Notifications',
    body:
      'If you grant notification permissions, CosmicSelf may send daily reminders and future transit-based alerts. You can turn these off any time in Settings or in your device notification controls.',
  },
  {
    title: 'Your controls',
    body:
      'You can sign out at any time. You can also delete your account from Settings, which removes your stored account data, readings, journal history, connections, and related saved content tied to your account.',
  },
  {
    title: 'Contact',
    body:
      'Questions, privacy requests, or account help? Email admin@cosmicself.app and we will reply within 2 business days.',
  },
];

export default function PrivacyPolicyScreen() {
  if (Platform.OS === 'web') {
    return (
      <WebLegalPage
        eyebrow="COSMICSELF LEGAL"
        title="Privacy Policy"
        headline="A short, readable overview of how your data is handled."
        updated={UPDATED}
        sections={SECTIONS}
        metaDescription="How CosmicSelf collects, uses, and protects the data you enter across Western, Vedic, Chinese, and KP astrology features."
        canonical="https://cosmicself.app/legal/privacy"
      />
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Privacy Policy" accentColor={COLORS.tide} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>COSMICSELF LEGAL</Text>
        <Text style={styles.headline}>A short, readable overview of how your data is handled.</Text>
        <Text style={styles.updated}>{UPDATED}</Text>

        {SECTIONS.map((section) => (
          <GradientCard key={section.title} style={styles.card} accentColor={COLORS.tide}>
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
