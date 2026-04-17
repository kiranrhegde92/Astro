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
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { toSiderealPositions } from '../../src/engines/vedic';
import { calculateMuhurta } from '../../src/engines/vedic/muhurta';
import { findActiveTransits } from '../../src/engines/common/transits';

export default function VedicReadingScreen() {
  const isAndroid = Platform.OS === 'android';
  const [activeSection, setActiveSection] = useState('core');
  const user = useActiveProfile();

  if (!user?.vedic) return null;

  const { rashi, nakshatra, nakshatraPada, currentDasha, dashas, remedies } = user.vedic;
  const tabs = [
    { key: 'core', label: 'Core' },
    { key: 'kundli', label: 'Kundli' },
    { key: 'insights', label: 'Insights' },
    { key: 'learn', label: 'Learn' },
  ];

  // Sidereal planet positions for Kundli chart
  const birthDate = user.birthDetails?.date ? new Date(user.birthDetails.date) : new Date();
  const siderealPlanets = useMemo(
    () => user?.western?.planets ? toSiderealPositions(user.western.planets, birthDate) : [],
    [user?.western?.planets],
  );
  const ascendantSign = user?.western?.rising;

  // Active transits
  const transits = useMemo(
    () => user?.western?.planets ? findActiveTransits(user.western.planets) : [],
    [user?.western?.planets],
  );

  const now = new Date();
  const muhurta = useMemo(() => calculateMuhurta(now, nakshatra), [nakshatra, now]);
  const dashaTimeline = dashas.map((d) => {
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    const isCurrent = now >= start && now <= end;
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = isCurrent ? (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) : 0;
    const progress = isCurrent ? Math.min(elapsedDays / totalDays, 1) : now > end ? 1 : 0;
    return { ...d, isCurrent, progress, startDate: start, endDate: end };
  });

  return (
    <StarField>
      <ScreenHeader title="Vedic Lens" accentColor={COLORS.vedic} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(100).duration(500).springify()}>
          <Text style={styles.headerEmoji}>{'\u{1F549}\uFE0F'}</Text>
        </ReAnimated.View>

        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'core' && (
          <>
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
              <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
                <Text style={styles.cardTitle}>Rashi (Moon Sign)</Text>
                <Text style={styles.mainValue}>{rashi}</Text>
                <Text style={styles.detailText}>
                  In Vedic astrology, your Moon sign (Rashi) is your primary sign - it represents your mind,
                  emotions, and inner nature. Unlike Western astrology which emphasizes the Sun sign,
                  Vedic tradition considers the Moon the most important celestial body.
                </Text>
                <SourceRef text="Brihat Parashara Hora Shastra - Chapter on Rashi Characteristics" />
              </GradientCard>
            </ReAnimated.View>

            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
              <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
                <Text style={styles.cardTitle}>Nakshatra (Lunar Mansion)</Text>
                <Text style={styles.mainValue}>{nakshatra}</Text>
                <Text style={styles.padaText}>Pada {nakshatraPada} of 4</Text>
                <Text style={styles.detailText}>
                  Your birth Nakshatra is one of 27 lunar mansions, each spanning 13\u00B020' of the zodiac.
                  It reveals deeper personality traits, spiritual tendencies, and determines your
                  Vimshottari Dasha sequence - the timing of major life events.
                </Text>
                <View style={styles.padaBar}>
                  {[1, 2, 3, 4].map((p) => (
                    <View
                      key={p}
                      style={[styles.padaDot, p === nakshatraPada && styles.padaDotActive]}
                    />
                  ))}
                </View>
                <SourceRef text="Brihat Jataka by Varahamihira - Nakshatra Analysis" />
              </GradientCard>
            </ReAnimated.View>

            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(440).duration(450).springify().damping(16)}>
              <GradientCard accentColor={COLORS.gold}>
                <Text style={styles.cardTitle}>Muhurta / Auspicious Timing</Text>
                <Text style={styles.subtitleText}>
                  A compact panchang-style timing snapshot for today using tithi, yoga, karana, and your nakshatra context.
                </Text>
                <View style={styles.muhurtaGrid}>
                  <View style={styles.muhurtaChip}>
                    <Text style={styles.muhurtaLabel}>Tithi</Text>
                    <Text style={styles.muhurtaValue}>{muhurta.tithi}</Text>
                  </View>
                  <View style={styles.muhurtaChip}>
                    <Text style={styles.muhurtaLabel}>Nakshatra</Text>
                    <Text style={styles.muhurtaValue}>{muhurta.nakshatra}</Text>
                  </View>
                  <View style={styles.muhurtaChip}>
                    <Text style={styles.muhurtaLabel}>Yoga</Text>
                    <Text style={styles.muhurtaValue}>{muhurta.yoga}</Text>
                  </View>
                  <View style={styles.muhurtaChip}>
                    <Text style={styles.muhurtaLabel}>Karana</Text>
                    <Text style={styles.muhurtaValue}>{muhurta.karana}</Text>
                  </View>
                </View>
                <Text style={styles.muhurtaQuality}>Quality: {muhurta.quality}</Text>
                <Text style={styles.detailText}>Good for: {muhurta.goodFor.join(', ')}.</Text>
                <Text style={styles.detailText}>Avoid: {muhurta.avoid.join(', ')}.</Text>
                <SourceRef text="Muhurta blends tithi, nakshatra, yoga, and karana to judge timing quality in Vedic electional astrology." />
              </GradientCard>
            </ReAnimated.View>
          </>
        )}

        {activeSection === 'kundli' && (
          <>
            {/* Rashi Kundli (Birth Chart) */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
              <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
                <Text style={styles.cardTitle}>Rashi Kundli (Birth Chart)</Text>
                <Text style={styles.subtitleText}>
                  South Indian style chart showing your planetary positions in the sidereal zodiac.
                  The diagonal line marks your Lagna (Ascendant).
                </Text>
                <KundliChart
                  planets={siderealPlanets}
                  ascendantSign={ascendantSign}
                  style="vedic"
                  size={280}
                />
                <SourceRef text="Brihat Parashara Hora Shastra - Graha Sthiti (Planetary Placements)" />
              </GradientCard>
            </ReAnimated.View>

            {/* Sidereal Planet Positions Table */}
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
              <GradientCard>
                <Text style={styles.cardTitle}>Graha Sthiti (Planet Positions)</Text>
                <Text style={styles.subtitleText}>Sidereal positions using Lahiri ayanamsa</Text>
                <View style={styles.planetTableHeader}>
                  <Text style={[styles.planetCol, { flex: 1.2 }]}>Graha</Text>
                  <Text style={[styles.planetCol, { flex: 1.4 }]}>Rashi</Text>
                  <Text style={styles.planetCol}>Degree</Text>
                </View>
                {siderealPlanets.map((p, i) => (
                  <View key={i} style={styles.planetRow}>
                    <Text style={[styles.planetName, { flex: 1.2 }]}>
                      {p.planet === 'NorthNode' ? 'Rahu' : p.planet === 'SouthNode' ? 'Ketu' : p.planet}
                      {p.retrograde ? ' (R)' : ''}
                    </Text>
                    <Text style={[styles.planetSign, { flex: 1.4 }]}>{p.sign}</Text>
                    <Text style={styles.planetDeg}>{p.degree.toFixed(1)}{'\u00B0'}</Text>
                  </View>
                ))}
              </GradientCard>
            </ReAnimated.View>

            {/* Current Transits */}
            {transits.length > 0 && (
              <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(440).duration(450).springify().damping(16)}>
                <GradientCard>
                  <Text style={styles.cardTitle}>Gochar (Current Transits)</Text>
                  <Text style={styles.subtitleText}>
                    How today's planetary positions interact with your birth chart
                  </Text>
                  {transits.map((t, i) => (
                    <View key={i} style={styles.transitRow}>
                      <View style={styles.transitBadge}>
                        <Text style={styles.transitBadgeText}>
                          {t.transitPlanet} {t.aspect === 'conjunction' ? '\u2606' :
                           t.aspect === 'trine' ? '\u25B3' :
                           t.aspect === 'square' ? '\u25A1' :
                           t.aspect === 'opposition' ? '\u2641' : '\u2736'} {t.natalPlanet}
                        </Text>
                      </View>
                      <Text style={styles.transitText}>{t.interpretation}</Text>
                    </View>
                  ))}
                  <SourceRef text="Phaladeepika - Gochar Phala (Transit Effects)" />
                </GradientCard>
              </ReAnimated.View>
            )}
          </>
        )}

        {activeSection === 'insights' && (
          <>
            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
              <GradientCard>
                <Text style={styles.cardTitle}>Vimshottari Dasha Timeline</Text>
                <Text style={styles.subtitleText}>
                  Your 120-year planetary period cycle - showing when each planet's influence is strongest
                </Text>
                <Text style={styles.currentDashaLabel}>
                  Current Period: {currentDasha.planet} Mahadasha
                </Text>

                <View style={styles.timeline}>
                  {dashaTimeline.slice(0, 9).map((d, i) => {
                    const startYear = d.startDate.getFullYear();
                    const endYear = d.endDate.getFullYear();
                    return (
                      <View key={i} style={styles.dashaRow}>
                        <View style={styles.dashaInfo}>
                          <Text style={[styles.dashaPlanet, d.isCurrent && styles.dashaPlanetCurrent]}>
                            {d.planet}
                          </Text>
                          <Text style={styles.dashaYears}>{startYear} - {endYear}</Text>
                        </View>
                        <View style={styles.dashaBarBg}>
                          <View
                            style={[
                              styles.dashaBarFill,
                              {
                                width: `${d.progress * 100}%`,
                                backgroundColor: d.isCurrent ? COLORS.starGold : COLORS.vedic,
                              },
                            ]}
                          />
                        </View>
                        {d.isCurrent && (
                          <Text style={styles.dashaActive}>{'\u2B50'} NOW</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
                <SourceRef text="Brihat Parashara Hora Shastra - Chapter 46, Dasha Effects" />
              </GradientCard>
            </ReAnimated.View>

            <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(320).duration(450).springify().damping(16)}>
              <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
                <Text style={styles.cardTitle}>{'\u{1F48E}'} Cosmic Enhancements (Remedies)</Text>
                <Text style={styles.subtitleText}>
                  Vedic wisdom offers ways to harmonize with your current planetary energies
                </Text>

                {remedies.map((remedy, i) => (
                  <View key={i} style={styles.remedyCard}>
                    <Text style={styles.remedyIcon}>
                      {remedy.type === 'gemstone' ? '\u{1F48E}' :
                       remedy.type === 'mantra' ? '\u{1F3B5}' :
                       remedy.type === 'color' ? '\u{1F308}' :
                       remedy.type === 'day' ? '\u{1F4C5}' :
                       remedy.type === 'charity' ? '\u{1F49B}' : '\u{1F52E}'}
                    </Text>
                    <View style={styles.remedyContent}>
                      <Text style={styles.remedyType}>{remedy.type.toUpperCase()}</Text>
                      <Text style={styles.remedyName}>{remedy.name}</Text>
                      <Text style={styles.remedyDesc}>{remedy.description}</Text>
                      <Text style={styles.remedySource}>{remedy.source}</Text>
                    </View>
                  </View>
                ))}
              </GradientCard>
            </ReAnimated.View>
          </>
        )}

        {activeSection === 'learn' && (
          <ReAnimated.View entering={isAndroid ? FadeInDown.duration(280).damping(24) : FadeInDown.delay(200).duration(450).springify().damping(16)}>
            <GradientCard>
              <Text style={styles.cardTitle}>{'\u{1F4DA}'} Deepen Your Understanding</Text>
              <BookRef title="Brihat Parashara Hora Shastra" desc="The foundational text of Vedic astrology by Sage Parashara" />
              <BookRef title="Phaladeepika" desc="by Mantreswara - Comprehensive guide to chart interpretation" />
              <BookRef title="Saravali" desc="by Kalyana Varma - Detailed Dasha and Nakshatra effects" />
            </GradientCard>
          </ReAnimated.View>
        )}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
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
  headerEmoji: { fontSize: 56, textAlign: 'center' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.heading, marginBottom: SPACING.sm },
  mainValue: { color: COLORS.starGold, fontSize: 28, fontWeight: '800' },
  padaText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  subtitleText: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md },
  detailText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginTop: SPACING.sm },
  padaBar: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  padaDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.vedic,
  },
  padaDotActive: { backgroundColor: COLORS.vedic },
  muhurtaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  muhurtaChip: {
    width: '47%',
    backgroundColor: COLORS.glassHighlight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: 2,
  },
  muhurtaLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.accent, letterSpacing: 0.7 },
  muhurtaValue: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.heading },
  muhurtaQuality: { color: COLORS.gold, fontSize: 13, fontFamily: FONTS.heading, textTransform: 'capitalize', marginBottom: SPACING.xs },
  currentDashaLabel: {
    color: COLORS.starGold, fontSize: 15, fontWeight: '700',
    marginBottom: SPACING.md,
  },
  timeline: { gap: SPACING.sm },
  dashaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dashaInfo: { width: 90 },
  dashaPlanet: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  dashaPlanetCurrent: { color: COLORS.starGold },
  dashaYears: { color: COLORS.textMuted, fontSize: 10 },
  dashaBarBg: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  dashaBarFill: { height: '100%', borderRadius: 4 },
  dashaActive: { color: COLORS.starGold, fontSize: 10, fontWeight: '800', width: 40 },
  remedyCard: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder,
  },
  remedyIcon: { fontSize: 28 },
  remedyContent: { flex: 1 },
  remedyType: { color: COLORS.vedic, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  remedyName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 2 },
  remedyDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  remedySource: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },
  sourceRef: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.glassBorder,
  },
  sourceRefText: { color: COLORS.textMuted, fontSize: 11 },
  bookRef: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  bookTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  bookDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  bottomPad: { height: 20 },
  // Planet table
  planetTableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder, paddingBottom: 6, marginBottom: 4 },
  planetCol: { flex: 1, color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  planetRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: COLORS.ruleLight },
  planetName: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  planetSign: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
  planetDeg: { flex: 1, color: COLORS.textMuted, fontSize: 13, textAlign: 'right' },
  // Transit rows
  transitRow: { paddingVertical: SPACING.sm, borderBottomWidth: 0.5, borderBottomColor: COLORS.glassBorder },
  transitBadge: { backgroundColor: `${COLORS.vedic}22`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  transitBadgeText: { color: COLORS.vedic, fontSize: 11, fontWeight: '700' },
  transitText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
});
