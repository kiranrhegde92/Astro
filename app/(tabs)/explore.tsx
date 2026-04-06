import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const SYSTEMS = [
  {
    icon: 'planet-outline' as const,
    title: 'Western Astrology',
    origin: 'Ancient Greece & Babylon', age: '2,500+ years',
    focus: 'Personality · Psychology · Self-understanding',
    features: ['12 Zodiac signs based on Sun position', 'Natal charts with houses & aspects', 'Planetary transits for timing', 'Element & modality groupings'],
    books: ["Ptolemy's Tetrabiblos", 'Steven Forrest — The Inner Sky', 'Robert Hand — Planets in Transit'],
    gradient: COLORS.gradientWestern,
    color: COLORS.western,
    accentBorder: 'rgba(124,109,255,0.45)',
  },
  {
    icon: 'flame-outline' as const,
    title: 'Vedic Astrology',
    origin: 'Ancient India', age: '5,000+ years',
    focus: 'Life timing · Destiny · Spiritual growth',
    features: ['Moon sign (Rashi) is primary indicator', '27 Nakshatras for deep personality', 'Vimshottari Dasha for life timing', 'Divisional charts for specific areas'],
    books: ['Brihat Parashara Hora Shastra', 'Phaladeepika by Mantreswara'],
    gradient: COLORS.gradientVedic,
    color: COLORS.vedic,
    accentBorder: 'rgba(255,107,53,0.45)',
  },
  {
    icon: 'navigate-outline' as const,
    title: 'Chinese Astrology',
    origin: 'Ancient China', age: '3,000+ years',
    focus: 'Destiny · Compatibility · Cyclical patterns',
    features: ['12 Zodiac animals in 12-year cycle', '5 Elements: Wood Fire Earth Metal Water', 'Four Pillars of Destiny (Ba Zi)', 'Lucky directions & auspicious dates'],
    books: ['The Handbook of Chinese Horoscopes', 'San He Classical Texts'],
    gradient: COLORS.gradientChinese,
    color: COLORS.chinese,
    accentBorder: 'rgba(255,58,92,0.45)',
  },
  {
    icon: 'telescope-outline' as const,
    title: 'KP System',
    origin: 'India (20th century)', age: 'Modern',
    focus: 'Precise event timing & predictions',
    features: ['Sub-lord theory for precise results', '249 sub-divisions of the zodiac', 'Cuspal significators for event timing', 'Most accurate predictive system'],
    books: ['Krishnamurti Paddhati Reader', 'KP & Astrology Yearbooks'],
    gradient: COLORS.gradientKP,
    color: COLORS.kp,
    accentBorder: 'rgba(0,229,209,0.45)',
  },
];

export default function ExploreScreen() {
  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>EXPLORE</Text>
          <Text style={styles.subtitle}>Ancient wisdom systems powering your cosmic profile</Text>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
        </View>

        {SYSTEMS.map((sys, i) => (
          <AnimatedPressable key={i} scaleTo={0.98}>
            <View style={[styles.cardShadow, { shadowColor: sys.color }]}>
              <LinearGradient
                colors={sys.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {/* Glossy top highlight */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
                  pointerEvents="none"
                />

                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { borderColor: `${sys.color}55` }]}>
                    <Ionicons name={sys.icon} size={26} color="rgba(255,255,255,0.92)" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{sys.title}</Text>
                    <Text style={styles.cardOrigin}>{sys.origin} · {sys.age}</Text>
                  </View>
                </View>

                {/* Focus pill */}
                <View style={styles.focusPill}>
                  <Text style={styles.focusText}>{sys.focus}</Text>
                </View>

                {/* Features */}
                {sys.features.map((f, j) => (
                  <View key={j} style={styles.featureRow}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}

                {/* Books */}
                <View style={styles.booksSection}>
                  <View style={styles.booksHeader}>
                    <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.55)" />
                    <Text style={styles.booksLabel}>RECOMMENDED</Text>
                  </View>
                  {sys.books.map((b, j) => (
                    <Text key={j} style={styles.bookText}>· {b}</Text>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </AnimatedPressable>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },
  header: { alignItems: 'center', gap: SPACING.xs },
  title: {
    fontFamily: 'Cinzel_900Black',
    color: COLORS.white,
    fontSize: 28,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  divider: { width: 80, height: 1, marginTop: SPACING.sm, opacity: 0.5 },

  cardShadow: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBox: {
    width: 52, height: 52, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: '#fff', fontSize: 17, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  cardOrigin: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 },

  focusPill: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  focusText: { color: 'rgba(255,255,255,0.80)', fontSize: 11, fontWeight: '600' },

  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  featureDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)', marginTop: 7 },
  featureText: { color: 'rgba(255,255,255,0.80)', fontSize: 13, lineHeight: 19, flex: 1 },

  booksSection: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.20)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: 3,
  },
  booksHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  booksLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'Cinzel_400Regular', letterSpacing: 1.5 },
  bookText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 18 },
});
