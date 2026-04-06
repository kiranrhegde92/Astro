import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { WESTERN_ZODIAC } from '../../src/constants/zodiacData';
import { getRulingPlanet, getElement, getModality } from '../../src/engines/western';

export default function WesternReadingScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user?.western) return null;

  const { sun, moon, rising, element, modality, planets } = user.western;
  const sunInfo = WESTERN_ZODIAC.find((z) => z.sign === sun);

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerEmoji}>{sunInfo?.emoji ?? '\u2648'}</Text>
        <GlowText size="xl" align="center" color={COLORS.western}>
          Western Astrology
        </GlowText>

        {/* Sun Sign */}
        <GradientCard colors={COLORS.gradientWestern as unknown as readonly string[]}>
          <Text style={styles.cardTitle}>Sun Sign - Your Core Identity</Text>
          <Text style={styles.signName}>{sun}</Text>
          <Text style={styles.signDates}>{sunInfo?.dates}</Text>
          <Text style={styles.signDesc}>{sunInfo?.description}</Text>
          <View style={styles.traitsRow}>
            {sunInfo?.traits.map((t, i) => (
              <View key={i} style={styles.traitBadge}>
                <Text style={styles.traitText}>{t}</Text>
              </View>
            ))}
          </View>
          <SourceRef text="Ptolemy's Tetrabiblos - Foundation of Western Astrology" />
        </GradientCard>

        {/* Moon Sign */}
        <GradientCard>
          <Text style={styles.cardTitle}>Moon Sign - Your Emotional World</Text>
          <Text style={styles.signName}>{moon}</Text>
          <Text style={styles.detailText}>
            Your Moon in {moon} reveals your emotional nature, instincts, and inner world.
            This is how you process feelings and what makes you feel secure and nurtured.
          </Text>
          <View style={styles.infoRow}>
            <InfoChip label="Element" value={getElement(moon)} />
            <InfoChip label="Ruler" value={getRulingPlanet(moon)} />
          </View>
        </GradientCard>

        {/* Rising Sign */}
        {rising && (
          <GradientCard>
            <Text style={styles.cardTitle}>Rising Sign - Your Cosmic First Impression</Text>
            <Text style={styles.signName}>{rising}</Text>
            <Text style={styles.detailText}>
              Your Ascendant in {rising} shapes how others perceive you and the energy you project
              into the world. It's the mask you wear and your natural approach to new situations.
            </Text>
            <View style={styles.infoRow}>
              <InfoChip label="Modality" value={getModality(rising)} />
              <InfoChip label="Ruler" value={getRulingPlanet(rising)} />
            </View>
          </GradientCard>
        )}

        {/* Element & Modality */}
        <GradientCard>
          <Text style={styles.cardTitle}>Your Cosmic Blueprint</Text>
          <View style={styles.blueprintGrid}>
            <BlueprintItem label="Element" value={element} emoji={
              element === 'Fire' ? '\u{1F525}' : element === 'Earth' ? '\u{1F30D}' :
              element === 'Air' ? '\u{1F4A8}' : '\u{1F30A}'
            } />
            <BlueprintItem label="Modality" value={modality} emoji={
              modality === 'Cardinal' ? '\u{1F3AF}' : modality === 'Fixed' ? '\u{1F48E}' : '\u{1F300}'
            } />
            <BlueprintItem label="Ruling Planet" value={getRulingPlanet(sun)} emoji="\u{2B50}" />
          </View>
        </GradientCard>

        {/* Planetary Positions */}
        <GradientCard>
          <Text style={styles.cardTitle}>Planetary Positions</Text>
          <Text style={styles.detailSubtext}>
            Where the planets were when you were born
          </Text>
          {planets.map((p, i) => (
            <View key={i} style={styles.planetRow}>
              <Text style={styles.planetName}>{p.planet}</Text>
              <Text style={styles.planetSign}>{p.sign}</Text>
              <Text style={styles.planetDegree}>{p.degree.toFixed(1)}{'\u00B0'}</Text>
              {p.retrograde && <Text style={styles.retroBadge}>R</Text>}
            </View>
          ))}
          <SourceRef text="Calculated using astronomical orbital mechanics - NASA Ephemeris data" />
        </GradientCard>

        {/* Recommended Reading */}
        <GradientCard>
          <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
          <BookRef title="The Inner Sky" author="Steven Forrest" desc="The best introduction to Western natal chart interpretation" />
          <BookRef title="Planets in Transit" author="Robert Hand" desc="Understanding how current planetary movements affect your chart" />
          <BookRef title="Tetrabiblos" author="Claudius Ptolemy" desc="The foundational text of Western astrology (2nd century CE)" />
        </GradientCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function BlueprintItem({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.blueprintItem}>
      <Text style={styles.blueprintEmoji}>{emoji}</Text>
      <Text style={styles.blueprintLabel}>{label}</Text>
      <Text style={styles.blueprintValue}>{value}</Text>
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

function BookRef({ title, author, desc }: { title: string; author: string; desc: string }) {
  return (
    <View style={styles.bookRef}>
      <Text style={styles.bookTitle}>{title}</Text>
      <Text style={styles.bookAuthor}>by {author}</Text>
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
  signName: { color: COLORS.starGold, fontSize: 28, fontWeight: '800' },
  signDates: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  signDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm },
  traitsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  traitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
  traitText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  detailSubtext: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  infoChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginTop: 2 },
  blueprintGrid: { flexDirection: 'row', gap: SPACING.sm },
  blueprintItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  blueprintEmoji: { fontSize: 28 },
  blueprintLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  blueprintValue: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginTop: 2 },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  planetName: { color: COLORS.textSecondary, fontSize: 14, width: 100 },
  planetSign: { color: COLORS.white, fontSize: 14, fontWeight: '600', flex: 1 },
  planetDegree: { color: COLORS.textMuted, fontSize: 13, width: 50, textAlign: 'right' },
  retroBadge: {
    color: COLORS.sunOrange,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: SPACING.xs,
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceRef: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bookRef: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  bookTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  bookAuthor: { color: COLORS.textMuted, fontSize: 12 },
  bookDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  bottomPad: { height: 20 },
});
