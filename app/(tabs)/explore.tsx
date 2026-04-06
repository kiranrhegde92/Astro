import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const SYSTEMS = [
  {
    emoji: '\u2648',
    title: 'Western Astrology',
    origin: 'Ancient Greece & Babylon',
    age: '2,500+ years',
    focus: 'Personality, psychology, self-understanding',
    keyFeatures: ['12 Zodiac signs based on Sun position', 'Natal charts with houses & aspects', 'Planetary transits for timing', 'Element & modality groupings'],
    books: ['Ptolemy\'s Tetrabiblos', 'Steven Forrest - The Inner Sky', 'Robert Hand - Planets in Transit'],
    gradient: COLORS.gradientWestern,
  },
  {
    emoji: '\u{1F549}\uFE0F',
    title: 'Vedic (Indian) Astrology',
    origin: 'Ancient India',
    age: '5,000+ years',
    focus: 'Life timing, destiny, spiritual growth',
    keyFeatures: ['Sidereal zodiac (based on actual star positions)', 'Moon sign (Rashi) is primary', '27 Nakshatras for deeper personality', 'Vimshottari Dasha for life timing', 'Remedies: gemstones, mantras, rituals'],
    books: ['Brihat Parashara Hora Shastra', 'Brihat Jataka by Varahamihira', 'Phaladeepika by Mantreswara'],
    gradient: COLORS.gradientVedic,
  },
  {
    emoji: '\u{1F409}',
    title: 'Chinese Astrology',
    origin: 'Ancient China',
    age: '3,000+ years',
    focus: 'Destiny, compatibility, cyclical patterns',
    keyFeatures: ['12 Zodiac animals in 12-year cycle', '5 Elements: Wood, Fire, Earth, Metal, Water', 'Four Pillars of Destiny (Ba Zi)', '60-year Grand Cycle', 'Yin-Yang balance'],
    books: ['The Handbook of Chinese Horoscopes', 'The Complete Guide to Chinese Astrology', 'San He Classical Texts'],
    gradient: COLORS.gradientChinese,
  },
  {
    emoji: '\u{1F52D}',
    title: 'KP System',
    origin: 'India (20th century)',
    age: 'Modern innovation on Vedic foundation',
    focus: 'Precise event timing & predictions',
    keyFeatures: ['Based on Krishnamurti Paddhati', 'Sub-lord theory for precise predictions', '249 sub-divisions of the zodiac', 'Combines Vedic & Western techniques', 'Most precise predictive system'],
    books: ['Krishnamurti Paddhati Reader (Vols 1-6)', 'KP & Astrology Yearbooks', 'Nakshatra Chintamani'],
    gradient: COLORS.gradientKP,
  },
];

export default function ExploreScreen() {
  const { t } = useTranslation();

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <GlowText size="xl" align="center">
          {t('tabs.explore')}
        </GlowText>
        <Text style={styles.subtitle}>
          Learn about the ancient wisdom systems powering your cosmic profile
        </Text>

        {SYSTEMS.map((sys, i) => (
          <GradientCard key={i} colors={sys.gradient as unknown as readonly string[]}>
            <Text style={styles.sysEmoji}>{sys.emoji}</Text>
            <Text style={styles.sysTitle}>{sys.title}</Text>
            <View style={styles.metaRow}>
              <MetaBadge label="Origin" value={sys.origin} />
              <MetaBadge label="Age" value={sys.age} />
            </View>
            <Text style={styles.focusLabel}>Focus</Text>
            <Text style={styles.focusValue}>{sys.focus}</Text>

            <Text style={styles.featuresLabel}>Key Features</Text>
            {sys.keyFeatures.map((f, j) => (
              <Text key={j} style={styles.featureItem}>{'\u2022'} {f}</Text>
            ))}

            <Text style={styles.booksLabel}>{'\u{1F4DA}'} Recommended Reading</Text>
            {sys.books.map((b, j) => (
              <Text key={j} style={styles.bookItem}>{b}</Text>
            ))}
          </GradientCard>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaBadge}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
    lineHeight: 22,
  },
  sysEmoji: { fontSize: 40, textAlign: 'center' },
  sysTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  metaBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  metaLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  metaValue: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginTop: 2 },
  focusLabel: { color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  focusValue: { color: COLORS.white, fontSize: 14, marginTop: 2, marginBottom: SPACING.md },
  featuresLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  featureItem: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginLeft: SPACING.sm },
  booksLabel: {
    color: COLORS.starGold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  bookItem: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 20, marginLeft: SPACING.sm },
  bottomPad: { height: 20 },
});
