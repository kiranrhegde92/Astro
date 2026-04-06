import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';

const ANIMAL_EMOJIS: Record<string, string> = {
  Rat: '\u{1F400}', Ox: '\u{1F402}', Tiger: '\u{1F405}', Rabbit: '\u{1F407}',
  Dragon: '\u{1F409}', Snake: '\u{1F40D}', Horse: '\u{1F40E}', Goat: '\u{1F410}',
  Monkey: '\u{1F412}', Rooster: '\u{1F413}', Dog: '\u{1F415}', Pig: '\u{1F416}',
};

const ELEMENT_EMOJIS: Record<string, string> = {
  Wood: '\u{1F332}', Fire: '\u{1F525}', Earth: '\u{1F30D}', Metal: '\u{2699}\uFE0F', Water: '\u{1F30A}',
};

const ANIMAL_TRAITS: Record<string, string> = {
  Rat: 'Quick-witted, resourceful, and versatile. You have a natural talent for turning situations to your advantage with charm and intelligence.',
  Ox: 'Dependable, strong, and determined. Your patient persistence and methodical approach builds success that stands the test of time.',
  Tiger: 'Brave, competitive, and magnetic. Your confident energy and natural charisma make you a born leader who inspires others.',
  Rabbit: 'Gentle, elegant, and alert. Your refined nature and diplomatic skills create harmony in every environment you enter.',
  Dragon: 'Confident, ambitious, and energetic. Your natural power and enthusiasm make dreams feel achievable and inspire greatness.',
  Snake: 'Intuitive, wise, and sophisticated. Your deep perception and strategic mind see what others miss.',
  Horse: 'Animated, active, and energetic. Your free spirit and enthusiasm for life are truly contagious.',
  Goat: 'Creative, gentle, and empathetic. Your artistic soul and compassionate heart bring beauty to the world.',
  Monkey: 'Clever, curious, and playful. Your sharp mind and adaptability solve problems with creative brilliance.',
  Rooster: 'Observant, hardworking, and courageous. Your attention to detail and strong work ethic inspire excellence.',
  Dog: 'Loyal, honest, and warm. Your genuine nature and devotion create bonds that last a lifetime.',
  Pig: 'Generous, compassionate, and diligent. Your warm heart and optimistic outlook brighten every room.',
};

export default function ChineseReadingScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user?.chinese) return null;

  const { animal, element, yinYang, luckyNumbers, luckyColors, compatibleAnimals, incompatibleAnimals, pillars } = user.chinese;

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerEmoji}>{ANIMAL_EMOJIS[animal] ?? '\u{1F409}'}</Text>
        <GlowText size="xl" align="center" color={COLORS.chinese}>
          Chinese Astrology
        </GlowText>

        {/* Animal Sign */}
        <GradientCard colors={COLORS.gradientChinese as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>Your Zodiac Animal</Text>
          <Text style={styles.mainValue}>{element} {animal}</Text>
          <Text style={styles.yinYang}>{yinYang} Energy</Text>
          <Text style={styles.detailText}>{ANIMAL_TRAITS[animal]}</Text>
          <SourceRef text="The Handbook of Chinese Horoscopes by Theodora Lau" />
        </GradientCard>

        {/* Element */}
        <GradientCard>
          <Text style={styles.cardTitle}>{ELEMENT_EMOJIS[element]} Your Element: {element}</Text>
          <Text style={styles.detailText}>
            {element === 'Wood' && 'Wood energy brings growth, creativity, and expansive vision. You naturally nurture ideas and people around you, helping everything flourish.'}
            {element === 'Fire' && 'Fire energy brings passion, dynamism, and leadership. Your warmth and enthusiasm naturally draw others to you and ignite inspiration.'}
            {element === 'Earth' && 'Earth energy brings stability, practicality, and nurturing strength. Your grounded nature provides a solid foundation for yourself and others.'}
            {element === 'Metal' && 'Metal energy brings precision, strength, and determination. Your refined focus and resilience help you achieve the highest standards.'}
            {element === 'Water' && 'Water energy brings wisdom, adaptability, and depth. Your intuitive nature flows around obstacles and finds the path of least resistance to success.'}
          </Text>
        </GradientCard>

        {/* Lucky Info */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F340}'} Your Lucky Attributes</Text>
          <View style={styles.luckyGrid}>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Lucky Numbers</Text>
              <Text style={styles.luckyValue}>{luckyNumbers.join(', ')}</Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Lucky Colors</Text>
              <Text style={styles.luckyValue}>{luckyColors.join(', ')}</Text>
            </View>
          </View>
        </GradientCard>

        {/* Compatibility */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F496}'} Animal Compatibility</Text>
          <View style={styles.compatSection}>
            <Text style={styles.compatLabel}>Best Matches</Text>
            <View style={styles.animalsRow}>
              {compatibleAnimals.map((a) => (
                <View key={a} style={[styles.animalChip, styles.animalChipGood]}>
                  <Text style={styles.animalChipEmoji}>{ANIMAL_EMOJIS[a]}</Text>
                  <Text style={styles.animalChipText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.compatSection}>
            <Text style={styles.compatLabel}>Growth Partners</Text>
            <View style={styles.animalsRow}>
              {incompatibleAnimals.map((a) => (
                <View key={a} style={[styles.animalChip, styles.animalChipGrowth]}>
                  <Text style={styles.animalChipEmoji}>{ANIMAL_EMOJIS[a]}</Text>
                  <Text style={styles.animalChipText}>{a}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.growthNote}>
              These animals challenge you to grow - they bring out strengths you didn't know you had!
            </Text>
          </View>
          <SourceRef text="San He (Three Harmony) Classical Texts" />
        </GradientCard>

        {/* Four Pillars */}
        {pillars && (
          <GradientCard colors={COLORS.gradientChinese as unknown as readonly string[]}>
            <Text style={styles.cardTitle}>{'\u{1F3DB}\uFE0F'} Four Pillars of Destiny (Ba Zi)</Text>
            <Text style={styles.subtitleText}>
              Your complete Chinese astrological blueprint based on year, month, day, and hour
            </Text>
            <View style={styles.pillarsGrid}>
              <PillarCard label="Year" stem={pillars.year.stem} animal={pillars.year.branch} element={pillars.year.element} />
              <PillarCard label="Month" stem={pillars.month.stem} animal={pillars.month.branch} element={pillars.month.element} />
              <PillarCard label="Day" stem={pillars.day.stem} animal={pillars.day.branch} element={pillars.day.element} />
              <PillarCard label="Hour" stem={pillars.hour.stem} animal={pillars.hour.branch} element={pillars.hour.element} />
            </View>
            <SourceRef text="Zi Ping Method - Four Pillars Tradition" />
          </GradientCard>
        )}

        {/* Recommended Reading */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
          <BookRef title="The Handbook of Chinese Horoscopes" desc="by Theodora Lau - Comprehensive guide to all 12 animals" />
          <BookRef title="The Complete Guide to Chinese Astrology" desc="by Derek Walters - Deep dive into Four Pillars & elements" />
        </GradientCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function PillarCard({ label, stem, animal, element }: { label: string; stem: string; animal: string; element: string }) {
  return (
    <View style={styles.pillarCard}>
      <Text style={styles.pillarLabel}>{label}</Text>
      <Text style={styles.pillarEmoji}>{ANIMAL_EMOJIS[animal] ?? '\u{1F300}'}</Text>
      <Text style={styles.pillarStem}>{stem}</Text>
      <Text style={styles.pillarAnimal}>{animal}</Text>
      <Text style={styles.pillarElement}>{element}</Text>
    </View>
  );
}

function SourceRef({ text }: { text: string }) {
  return (
    <View style={styles.sourceRef}>
      <Text style={styles.sourceRefText}>{'\u{1F4D6}'} {text}</Text>
    </View>
  );
}

function BookRef({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.bookRef}>
      <Text style={styles.bookTitle}>{title}</Text>
      <Text style={styles.bookDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  spacer: { height: 50 },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  mainValue: { color: COLORS.starGold, fontSize: 28, fontWeight: '800' },
  yinYang: { color: COLORS.textMuted, fontSize: 14, marginTop: 2 },
  subtitleText: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm },
  luckyGrid: { gap: SPACING.sm },
  luckyItem: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
  },
  luckyLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  luckyValue: { color: COLORS.starGold, fontSize: 16, fontWeight: '700', marginTop: 4 },
  compatSection: { marginBottom: SPACING.md },
  compatLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs },
  animalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  animalChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: BORDER_RADIUS.full, paddingVertical: 4, paddingHorizontal: SPACING.sm, borderWidth: 1,
  },
  animalChipGood: { borderColor: COLORS.success, backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  animalChipGrowth: { borderColor: COLORS.warning, backgroundColor: 'rgba(255, 171, 64, 0.1)' },
  animalChipEmoji: { fontSize: 16 },
  animalChipText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  growthNote: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: SPACING.xs },
  pillarsGrid: { flexDirection: 'row', gap: SPACING.sm },
  pillarCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  pillarLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  pillarEmoji: { fontSize: 24, marginTop: 4 },
  pillarStem: { color: COLORS.white, fontSize: 12, fontWeight: '700', marginTop: 2 },
  pillarAnimal: { color: COLORS.textSecondary, fontSize: 11 },
  pillarElement: { color: COLORS.chinese, fontSize: 10, fontWeight: '600' },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bookRef: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bookTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  bookDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  bottomPad: { height: 20 },
});
