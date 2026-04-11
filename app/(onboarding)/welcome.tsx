import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { LANGUAGE_OPTIONS, normalizeLanguage, type SupportedLanguage } from '../../src/i18n/language';

const WELCOME_COPY: Record<
  SupportedLanguage,
  {
    headline: string;
    copy: string;
    cta: string;
    languageLabel: string;
    promiseTitle: string;
    promiseCopy: string;
  }
> = {
  en: {
    headline: 'A gentler way to begin with the sky.',
    copy: 'Your chart opens here as a ritual. Less wallpaper. More presence, timing, and feeling.',
    cta: 'Begin the reading',
    languageLabel: 'Choose your language',
    promiseTitle: 'Your first reading takes under a minute.',
    promiseCopy: 'Add your birth details, choose your blend, and the almanac opens.',
  },
  hi: {
    headline: 'आसमान से जुड़ने की एक शांत शुरुआत।',
    copy: 'आपकी कुंडली यहां एक छोटे से अनुष्ठान की तरह खुलती है। कम शोर। अधिक उपस्थिति, समय और एहसास।',
    cta: 'पठन शुरू करें',
    languageLabel: 'अपनी भाषा चुनें',
    promiseTitle: 'आपकी पहली रीडिंग एक मिनट से कम में खुलती है।',
    promiseCopy: 'जन्म विवरण जोड़ें, अपना ब्लेंड चुनें, और आपका अल्मनैक तैयार है।',
  },
  zh: {
    headline: '以更柔和的方式开启你的星空。 ',
    copy: '你的命盘从这里展开，像一个小小仪式。更少装饰，更多感受、时机与在场。 ',
    cta: '开始解读',
    languageLabel: '选择语言',
    promiseTitle: '你的第一次解读不到一分钟。',
    promiseCopy: '填写出生信息，选择你的组合，星象手册就会打开。',
  },
  kn: {
    headline: 'ಆಕಾಶದೊಂದಿಗೆ ಆರಂಭಿಸಲು ಇನ್ನಷ್ಟು ಮೃದುವಾದ ದಾರಿ.',
    copy: 'ನಿಮ್ಮ ಚಾರ್ಟ್ ಇಲ್ಲಿ ಒಂದು ಚಿಕ್ಕ ವಿಧಿಯಂತೆ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ. ಕಡಿಮೆ ಗದ್ದಲ. ಹೆಚ್ಚು ಉಪಸ್ಥಿತಿ, ಸಮಯ ಮತ್ತು ಭಾವನೆ.',
    cta: 'ಪಠನ ಆರಂಭಿಸಿ',
    languageLabel: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    promiseTitle: 'ನಿಮ್ಮ ಮೊದಲ ಓದು ಒಂದು ನಿಮಿಷಕ್ಕೂ ಕಡಿಮೆ ಸಮಯದಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ.',
    promiseCopy: 'ಜನ್ಮ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ, ನಿಮ್ಮ ಮಿಶ್ರಣ ಆಯ್ಕೆಮಾಡಿ, ಮತ್ತು ಅಲ್ಮನಾಕ್ ತೆರೆಯುತ್ತದೆ.',
  },
};

const SYSTEMS = [
  {
    label: { en: 'Western psychology', hi: 'पश्चिमी मनोविज्ञान', zh: '西方心理', kn: 'ಪಾಶ್ಚಾತ್ಯ ಮನೋವಿಜ್ಞಾನ' },
    icon: 'sunny' as const,
    accent: COLORS.western,
    secondary: '#ece6ff',
  },
  {
    label: { en: 'Vedic timing', hi: 'वैदिक समय', zh: '吠陀时机', kn: 'ವೇದಿಕ ಸಮಯ' },
    icon: 'moon' as const,
    accent: COLORS.vedic,
    secondary: '#ffe6d8',
  },
  {
    label: { en: 'Chinese cycles', hi: 'चीनी चक्र', zh: '中华周期', kn: 'ಚೀನಿ ಚಕ್ರಗಳು' },
    icon: 'leaf' as const,
    accent: COLORS.chinese,
    secondary: '#ffe7db',
  },
  {
    label: { en: 'KP precision', hi: 'केपी सटीकता', zh: 'KP 精准度', kn: 'ಕೆಪಿ ನಿಖರತೆ' },
    icon: 'sparkles' as const,
    accent: COLORS.kp,
    secondary: '#e1f5ef',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.clearUser);
  const setLanguage = useUserStore((s) => s.setLanguage);
  const user = useUserStore((s) => s.user);
  const { showAlert, alertModal } = useCosmicAlert();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(() => {
    return normalizeLanguage(i18n.language);
  });
  const copy = useMemo(() => WELCOME_COPY[selectedLang] ?? WELCOME_COPY.en, [selectedLang]);

  const handleLogout = () => {
    showAlert(
      'Log out',
      'Sign out and return to the login screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out', style: 'destructive',
          onPress: async () => {
            await Promise.all([logout(), clearUser()]);
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <StarField>
      {/* Logout button — top-right corner */}
      <TouchableOpacity style={styles.logoutCorner} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.textMuted} />
      </TouchableOpacity>

      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
              <Text style={styles.brand}>COSMICSELF</Text>
              <Text style={styles.headline}>{copy.headline}</Text>
              <Text style={styles.copy}>{copy.copy}</Text>

              <View style={styles.ctaWrap}>
                <CosmicButton title={copy.cta} onPress={() => router.push('/(onboarding)/birth-details')} />
              </View>
            </LinearGradient>

            <View style={styles.posterOrb}>
              <CosmicOrb size={182} />
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <View style={styles.systemGrid}>
            {SYSTEMS.map((system) => (
              <View key={system.label.en} style={[styles.systemTile, { backgroundColor: system.secondary, borderColor: `${system.accent}33` }]}>
                <OrbIcon icon={system.icon} size={34} accentColor={system.accent} secondaryColor={system.secondary} />
                <Text style={styles.systemText}>{system.label[selectedLang]}</Text>
              </View>
            ))}
          </View>
        </AnimatedCard>

        <AnimatedCard index={2}>
          <View style={styles.languageBlock}>
            <Text style={styles.sectionLabel}>{copy.languageLabel}</Text>
            <View style={styles.languageGrid}>
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = selectedLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      setSelectedLang(lang.code);
                      i18n.changeLanguage(lang.code);
                      if (user) setLanguage(lang.code);
                    }}
                    style={[styles.languageChip, active && styles.languageChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.languageText, active && styles.languageTextActive]}>{lang.nativeName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={3}>
          <GradientCard style={styles.promiseCard} colors={COLORS.gradientSunset}>
            <Text style={styles.promiseTitle}>{copy.promiseTitle}</Text>
            <Text style={styles.promiseCopy}>{copy.promiseCopy}</Text>
          </GradientCard>
        </AnimatedCard>
      </ResetScrollView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  logoutCorner: {
    position: 'absolute',
    top: 52,
    right: SPACING.lg,
    zIndex: 10,
    padding: 8,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 28,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  posterWrap: {
    position: 'relative',
    minHeight: 400,
  },
  poster: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    minHeight: 360,
    overflow: 'hidden',
  },
  posterOrb: {
    position: 'absolute',
    right: -10,
    bottom: 20,
  },
  brand: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 2.4,
  },
  headline: {
    color: '#fffaf1',
    fontSize: 44,
    lineHeight: 49,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    maxWidth: 250,
    marginTop: SPACING.md,
  },
  copy: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 220,
    marginTop: SPACING.md,
  },
  ctaWrap: {
    marginTop: SPACING.lg,
    maxWidth: 190,
  },
  systemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  systemTile: {
    width: '47%',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.glass,
  },
  systemText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  languageBlock: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.4,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  languageChip: {
    minWidth: '47%',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  languageChipActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.bgMuted,
  },
  languageText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  languageTextActive: {
    color: COLORS.textPrimary,
  },
  promiseCard: {
    gap: SPACING.xs,
  },
  promiseTitle: {
    color: '#fffaf1',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  promiseCopy: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
});
