import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'zh', label: 'Chinese', native: '中文' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const selectLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.spacer} />

        <Text style={styles.logo}>&#x2728;</Text>
        <GlowText size="hero" align="center" color={COLORS.starGold}>
          CosmicSelf
        </GlowText>

        <Text style={styles.subtitle}>
          {t('onboarding.welcome.subtitle')}
        </Text>

        <View style={styles.systemPreview}>
          <View style={styles.systemRow}>
            <SystemBadge label="Western" emoji="&#x2648;" color={COLORS.western} />
            <SystemBadge label="Vedic" emoji="&#x1F549;&#xFE0F;" color={COLORS.vedic} />
          </View>
          <View style={styles.systemRow}>
            <SystemBadge label="Chinese" emoji="&#x1F409;" color={COLORS.chinese} />
            <SystemBadge label="KP" emoji="&#x1F52D;" color={COLORS.kp} />
          </View>
        </View>

        <Text style={styles.langTitle}>
          {t('onboarding.welcome.selectLanguage')}
        </Text>

        <View style={styles.langContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langButton,
                selectedLang === lang.code && styles.langButtonActive,
              ]}
              onPress={() => selectLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.langText,
                  selectedLang === lang.code && styles.langTextActive,
                ]}
              >
                {lang.native}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <CosmicButton
            title={t('onboarding.welcome.getStarted')}
            onPress={() => router.push('/(onboarding)/birth-details')}
          />
        </View>
      </ScrollView>
    </StarField>
  );
}

function SystemBadge({
  label,
  emoji,
  color,
}: {
  label: string;
  emoji: string;
  color: string;
}) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  spacer: {
    height: 80,
  },
  logo: {
    fontSize: 72,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  systemPreview: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  systemRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.xs,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  langTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  langContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  langButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  langButtonActive: {
    borderColor: COLORS.starGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  langText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  langTextActive: {
    color: COLORS.starGold,
  },
  buttonContainer: {
    marginTop: SPACING.xl,
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
});
