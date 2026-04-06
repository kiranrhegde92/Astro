import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', native: 'English', flag: '🇬🇧' },
  { code: 'hi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', native: '中文',   flag: '🇨🇳' },
];

const SYSTEMS = [
  {
    icon: 'planet' as const,
    label: 'Western',
    sub: 'Sun signs · Natal charts',
    color: COLORS.western,
    gradient: ['rgba(124,109,255,0.25)', 'rgba(61,53,204,0.12)'] as const,
    border: 'rgba(124,109,255,0.40)',
  },
  {
    icon: 'flame' as const,
    label: 'Vedic',
    sub: 'Moon signs · Dashas',
    color: COLORS.vedic,
    gradient: ['rgba(255,107,53,0.25)', 'rgba(204,58,16,0.12)'] as const,
    border: 'rgba(255,107,53,0.40)',
  },
  {
    icon: 'navigate' as const,
    label: 'Chinese',
    sub: 'Zodiac · Five Elements',
    color: COLORS.chinese,
    gradient: ['rgba(255,58,92,0.25)', 'rgba(204,0,48,0.12)'] as const,
    border: 'rgba(255,58,92,0.40)',
  },
  {
    icon: 'telescope' as const,
    label: 'KP System',
    sub: 'Precise event timing',
    color: COLORS.kp,
    gradient: ['rgba(0,229,209,0.22)', 'rgba(0,122,114,0.10)'] as const,
    border: 'rgba(0,229,209,0.38)',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(40)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const gridY = useRef(new Animated.Value(30)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.spring(headerY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(gridOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(gridY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
      Animated.timing(bottomOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1.03, duration: 2200, useNativeDriver: true }),
        Animated.timing(btnScale, { toValue: 1,    duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <CosmicOrb size={160} primaryColor="#7C6DFF" secondaryColor="#00E5D1" />
          <Text style={styles.title}>COSMIC SELF</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
        </Animated.View>

        {/* System cards grid */}
        <Animated.View style={[styles.grid, { opacity: gridOpacity, transform: [{ translateY: gridY }] }]}>
          {SYSTEMS.map((sys, i) => (
            <View key={i} style={[styles.cardWrap, { borderColor: sys.border }]}>
              <LinearGradient
                colors={sys.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.systemCard}
              >
                {/* Glossy top highlight */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  pointerEvents="none"
                />
                <View style={[styles.iconCircle, { borderColor: `${sys.color}55` }]}>
                  <Ionicons name={sys.icon} size={22} color={sys.color} />
                </View>
                <Text style={[styles.sysLabel, { color: sys.color }]}>{sys.label}</Text>
                <Text style={styles.sysSub}>{sys.sub}</Text>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        {/* Unified badge */}
        <Animated.View style={[styles.unifiedBadge, { opacity: gridOpacity }]}>
          <Ionicons name="star" size={13} color="rgba(255,255,255,0.40)" />
          <Text style={styles.unifiedText}>  All 4 traditions · One cosmic profile</Text>
        </Animated.View>

        {/* Language + CTA */}
        <Animated.View style={[styles.bottom, { opacity: bottomOpacity }]}>
          <Text style={styles.langTitle}>{t('onboarding.welcome.selectLanguage')}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => { setSelectedLang(lang.code); i18n.changeLanguage(lang.code); }}
                style={[styles.langPill, selectedLang === lang.code && styles.langPillActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langText, selectedLang === lang.code && styles.langTextActive]}>
                  {lang.native}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={{ width: '100%', transform: [{ scale: btnScale }] }}>
            <TouchableOpacity onPress={() => router.push('/(onboarding)/birth-details')} activeOpacity={0.85}>
              <View style={styles.ctaShadow}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaButton}
                >
                  {/* Glossy top */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.full }]}
                    pointerEvents="none"
                  />
                  <Text style={styles.ctaText}>{t('onboarding.welcome.getStarted')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </StarField>
  );
}

const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 58 },

  header: { alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.xs },
  title: {
    fontFamily: 'Cinzel_900Black',
    fontSize: 30,
    color: COLORS.white,
    letterSpacing: 6,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginTop: -SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: SPACING.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    width: '100%',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cardWrap: {
    width: CARD_WIDTH,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  systemCard: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 115,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sysLabel: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sysSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },

  unifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: SPACING.xl,
  },
  unifiedText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 0.5,
  },

  bottom: { width: '100%', alignItems: 'center', gap: SPACING.md },
  langTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  langRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  langPillActive: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  langFlag: { fontSize: 14 },
  langText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  langTextActive: { color: COLORS.white, fontWeight: '700' },

  ctaShadow: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 18,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
});
