import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { KundliChart } from '../../src/components/chart/KundliChart';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { WESTERN_ZODIAC } from '../../src/constants/zodiacData';
import { getRulingPlanet, getElement, getModality } from '../../src/engines/western';
import { calculateAspects } from '../../src/engines/common/aspects';
import { findActiveTransits } from '../../src/engines/common/transits';

export default function WesternReadingScreen() {
  const isAndroid = Platform.OS === 'android';
  const [activeSection, setActiveSection] = useState('core');
  const user = useUserStore((s) => s.user);

  if (!user?.western) return null;

  const { sun, moon, rising, element, modality, planets } = user.western;
  const sunInfo = WESTERN_ZODIAC.find((z) => z.sign === sun);
  const tabs = [
    { key: 'core', label: 'Core' },
    { key: 'chart', label: 'Chart' },
    { key: 'insights', label: 'Insights' },
    { key: 'learn', label: 'Learn' },
  ];

  const aspects = useMemo(() => calculateAspects(planets), [planets]);
  const transits = useMemo(() => findActiveTransits(planets), [planets]);

  return (
    <StarField>
      <ScreenHeader title="Western Lens" accentColor={COLORS.western} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(100).duration(500).springify()}>
          <Text style={styles.headerEmoji}>{sunInfo?.emoji ?? '\u2648'}</Text>
        </ReAnimated.View>

        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'core' && (
          <>
            {/* Sun Sign */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
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
            </ReAnimated.View>

            {/* Moon Sign */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
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
            </ReAnimated.View>

            {/* Rising Sign */}
            {rising && (
              <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(440).duration(450).springify().damping(16)}>
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
              </ReAnimated.View>
            )}
          </>
        )}

        {activeSection === 'chart' && (
          <>
            {/* Birth Chart */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
            <GradientCard colors={COLORS.gradientWestern as unknown as readonly string[]}>
              <Text style={styles.cardTitle}>Birth Chart (Natal Chart)</Text>
              <Text style={styles.detailSubtext}>
                Your tropical zodiac birth chart — planets placed in their birth signs
              </Text>
              <KundliChart planets={planets} ascendantSign={rising} style="western" size={280} />
              <SourceRef text="Natal chart positions from orbital mechanics (Meeus formula)" />
            </GradientCard>
            </ReAnimated.View>

            {/* Natal Aspects */}
            {aspects.length > 0 && (
              <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
              <GradientCard>
                <Text style={styles.cardTitle}>Natal Aspects</Text>
                <Text style={styles.detailSubtext}>
                  Angular relationships between your planets — how their energies interact
                </Text>
                {aspects.slice(0, 8).map((a, i) => (
                  <View key={i} style={styles.aspectRow}>
                    <View style={styles.aspectBadge}>
                      <Text style={styles.aspectBadgeText}>
                        {a.planet1} {a.type === 'conjunction' ? '\u260C' :
                         a.type === 'trine' ? '\u25B3' :
                         a.type === 'square' ? '\u25A1' :
                         a.type === 'opposition' ? '\u260D' : '\u2736'} {a.planet2}
                      </Text>
                    </View>
                    <Text style={styles.aspectType}>
                      {a.type.charAt(0).toUpperCase() + a.type.slice(1)} ({a.orb.toFixed(1)}{'\u00B0'} orb)
                    </Text>
                    <Text style={styles.aspectInterp}>{a.interpretation}</Text>
                  </View>
                ))}
                <SourceRef text="Robert Hand, Planets in Transit — Aspect Orbs & Interpretations" />
              </GradientCard>
              </ReAnimated.View>
            )}

            {/* Current Transits */}
            {transits.length > 0 && (
              <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(440).duration(450).springify().damping(16)}>
              <GradientCard>
                <Text style={styles.cardTitle}>Today's Transits</Text>
                <Text style={styles.detailSubtext}>
                  Current planetary positions activating your birth chart
                </Text>
                {transits.map((t, i) => (
                  <View key={i} style={styles.aspectRow}>
                    <View style={[styles.aspectBadge, { backgroundColor: 'rgba(115,103,255,0.10)' }]}>
                      <Text style={[styles.aspectBadgeText, { color: COLORS.western }]}>
                        {t.transitPlanet} {'\u2192'} {t.natalPlanet}
                      </Text>
                    </View>
                    <Text style={styles.aspectInterp}>{t.interpretation}</Text>
                  </View>
                ))}
              </GradientCard>
              </ReAnimated.View>
            )}
          </>
        )}

        {activeSection === 'insights' && (
          <>
            {/* Element & Modality */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
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
            </ReAnimated.View>

            {/* Planetary Positions */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
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
            </ReAnimated.View>
          </>
        )}

        {activeSection === 'learn' && (
          <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
          <GradientCard>
            <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
            <BookRef title="The Inner Sky" author="Steven Forrest" desc="The best introduction to Western natal chart interpretation" />
            <BookRef title="Planets in Transit" author="Robert Hand" desc="Understanding how current planetary movements affect your chart" />
            <BookRef title="Tetrabiblos" author="Claudius Ptolemy" desc="The foundational text of Western astrology (2nd century CE)" />
          </GradientCard>
          </ReAnimated.View>
        )}

        <View style={styles.bottomPad} />
      </ResetScrollView>
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
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading, marginBottom: SPACING.sm },
  signName: { color: COLORS.starGold, fontSize: 28, fontWeight: '800' },
  signDates: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  signDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm },
  traitsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  traitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
  traitText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  detailSubtext: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  infoChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 2 },
  blueprintGrid: { flexDirection: 'row', gap: SPACING.sm },
  blueprintItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  blueprintEmoji: { fontSize: 28 },
  blueprintLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  blueprintValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  planetName: { color: COLORS.textSecondary, fontSize: 14, width: 100 },
  planetSign: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
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
    borderTopColor: COLORS.glassBorder,
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bookRef: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  bookTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  bookAuthor: { color: COLORS.textMuted, fontSize: 12 },
  bookDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  bottomPad: { height: 20 },
  // Aspect styles
  aspectRow: { paddingVertical: SPACING.sm, borderBottomWidth: 0.5, borderBottomColor: COLORS.glassBorder },
  aspectBadge: { backgroundColor: 'rgba(200,180,100,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  aspectBadgeText: { color: COLORS.starGold, fontSize: 11, fontWeight: '700' },
  aspectType: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  aspectInterp: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
});
