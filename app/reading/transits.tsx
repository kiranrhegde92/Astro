import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { findActiveTransits, getCurrentTransits, type TransitHit } from '../../src/engines/common/transits';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { useReadingStore } from '../../src/store/readingStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import type { DailyReading } from '../../src/types/astrology';

const SUPPORT_ASPECTS = new Set(['trine', 'sextile']);
const TENSION_ASPECTS = new Set(['square', 'opposition']);
const HEAVY_PLANETS = new Set(['Jupiter', 'Saturn', 'NorthNode', 'SouthNode']);

type DisplayTransit = {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  nature: 'support' | 'tension' | 'neutral';
  brief: string;
};

type DisplayPosition = NonNullable<DailyReading['transitPositions']>[number];

function formatAspect(aspect: string) {
  return aspect.charAt(0).toUpperCase() + aspect.slice(1);
}

function inferNature(aspect: string): DisplayTransit['nature'] {
  if (SUPPORT_ASPECTS.has(aspect)) return 'support';
  if (TENSION_ASPECTS.has(aspect)) return 'tension';
  return 'neutral';
}

function toDisplayTransit(hit: TransitHit): DisplayTransit {
  return {
    transitPlanet: hit.transitPlanet,
    natalPlanet: hit.natalPlanet,
    aspect: hit.aspect,
    orb: hit.orb,
    nature: inferNature(hit.aspect),
    brief: hit.interpretation,
  };
}

function getNatureColor(nature: DisplayTransit['nature']) {
  if (nature === 'support') return COLORS.tide;
  if (nature === 'tension') return COLORS.coral;
  return COLORS.gold;
}

function getImpactLabel(transit: DisplayTransit) {
  if (HEAVY_PLANETS.has(transit.transitPlanet)) return 'longer arc';
  if (transit.orb <= 1.5) return 'exact now';
  return 'live today';
}

export default function TransitReadingScreen() {
  const user = useActiveProfile();
  const todayReading = useReadingStore((state) => state.todayReading);
  const transitAlertsEnabled = useSettingsStore((state) => state.transitAlertsEnabled);

  const transits = useMemo<DisplayTransit[]>(() => {
    if (todayReading?.activeTransits?.length) {
      return todayReading.activeTransits.map((item) => ({
        transitPlanet: item.transitPlanet,
        natalPlanet: item.natalPlanet,
        aspect: item.aspect,
        orb: item.orb,
        nature: item.nature,
        brief: item.brief,
      }));
    }

    if (!user?.western?.planets?.length) return [];
    return findActiveTransits(user.western.planets).map(toDisplayTransit);
  }, [todayReading?.activeTransits, user?.western?.planets]);

  const positions = useMemo<DisplayPosition[]>(() => {
    if (todayReading?.transitPositions?.length) return todayReading.transitPositions;
    return getCurrentTransits().map((position) => ({
      planet: position.planet,
      sign: position.sign,
      degree: position.degree,
      retrograde: position.retrograde,
    }));
  }, [todayReading?.transitPositions]);

  const supportHits = transits.filter((item) => item.nature === 'support');
  const tensionHits = transits.filter((item) => item.nature === 'tension');
  const exactHits = transits.filter((item) => item.orb <= 1.5);
  const slowHits = transits.filter((item) => HEAVY_PLANETS.has(item.transitPlanet));

  if (!user?.western?.planets?.length) {
    return (
      <StarField>
        <ScreenHeader title="Transit Center" accentColor={COLORS.kp} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>A natal chart is needed first.</Text>
          <Text style={styles.emptyCopy}>Finish your birth details and chart setup to see the current sky interacting with your placements.</Text>
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Transit Center" accentColor={COLORS.kp} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>LIVE SKY</Text>
        <Text style={styles.headline}>Today’s strongest transits against your natal chart.</Text>
        <Text style={styles.subtitle}>
          Supportive lines show openings. Tense lines show where timing, pacing, and awareness matter most.
        </Text>

        <View style={styles.overviewGrid}>
          <GradientCard style={styles.overviewCard} accentColor={COLORS.tide}>
            <Text style={styles.overviewLabel}>Support</Text>
            <Text style={styles.overviewValue}>{supportHits.length}</Text>
          </GradientCard>
          <GradientCard style={styles.overviewCard} accentColor={COLORS.coral}>
            <Text style={styles.overviewLabel}>Pressure</Text>
            <Text style={styles.overviewValue}>{tensionHits.length}</Text>
          </GradientCard>
          <GradientCard style={styles.overviewCard} accentColor={COLORS.gold}>
            <Text style={styles.overviewLabel}>Exact</Text>
            <Text style={styles.overviewValue}>{exactHits.length}</Text>
          </GradientCard>
          <GradientCard style={styles.overviewCard} accentColor={COLORS.plum}>
            <Text style={styles.overviewLabel}>Slow movers</Text>
            <Text style={styles.overviewValue}>{slowHits.length}</Text>
          </GradientCard>
        </View>

        <GradientCard accentColor={COLORS.starGold} style={styles.alertCard}>
          <Text style={styles.cardTitle}>Transit alerts</Text>
          <Text style={styles.cardBody}>
            {transitAlertsEnabled
              ? 'Transit alerts are enabled in your preferences. The app will use this setting as premium transit notifications are rolled out.'
              : 'Transit alerts are off right now. Enable them in Settings if you want CosmicSelf to use this preference for premium alert delivery.'}
          </Text>
        </GradientCard>

        <GradientCard accentColor={COLORS.kp} style={styles.card}>
          <Text style={styles.cardTitle}>Most active lines</Text>
          <Text style={styles.cardBody}>These are the clearest current aspects touching your chart.</Text>
          {transits.length ? (
            <View style={styles.transitList}>
              {transits.map((transit) => {
                const color = getNatureColor(transit.nature);
                return (
                  <View key={`${transit.transitPlanet}-${transit.aspect}-${transit.natalPlanet}`} style={styles.transitRow}>
                    <View style={[styles.transitBadge, { backgroundColor: `${color}18`, borderColor: `${color}44` }]}>
                      <Text style={[styles.transitBadgeText, { color }]}>
                        {transit.transitPlanet} {formatAspect(transit.aspect)} {transit.natalPlanet}
                      </Text>
                    </View>
                    <View style={styles.transitMetaRow}>
                      <Text style={styles.transitMeta}>{transit.orb.toFixed(1)}° orb</Text>
                      <Text style={[styles.transitMetaPill, { color }]}>{getImpactLabel(transit)}</Text>
                    </View>
                    <Text style={styles.transitText}>{transit.brief}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.cardBody}>No standout aspects were found right now. The sky is comparatively quiet against your chart.</Text>
          )}
        </GradientCard>

        <GradientCard accentColor={COLORS.iris} style={styles.card}>
          <Text style={styles.cardTitle}>Current planetary positions</Text>
          <Text style={styles.cardBody}>A quick glance at where the main transiting planets are now.</Text>
          <View style={styles.positionsWrap}>
            {positions.map((position) => (
              <View key={`${position.planet}-${position.sign}`} style={styles.positionChip}>
                <View style={styles.positionTop}>
                  <Text style={styles.positionPlanet}>{position.planet}</Text>
                  {position.retrograde ? <Text style={styles.retroBadge}>R</Text> : null}
                </View>
                <Text style={styles.positionText}>{position.sign} {position.degree.toFixed(1)}°</Text>
              </View>
            ))}
          </View>
        </GradientCard>

        <GradientCard accentColor={COLORS.gold} style={styles.card}>
          <Text style={styles.cardTitle}>How to read this screen</Text>
          <View style={styles.tipRow}>
            <Ionicons name="sparkles-outline" size={18} color={COLORS.tide} />
            <Text style={styles.tipText}>Supportive aspects usually help momentum, connection, clarity, or timing.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.coral} />
            <Text style={styles.tipText}>Tense aspects are not “bad” — they usually mean more friction, urgency, or pressure to adjust.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.gold} />
            <Text style={styles.tipText}>The smaller the orb, the more immediate the transit tends to feel.</Text>
          </View>
        </GradientCard>

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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: FONTS.heading,
  },
  emptyCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  overviewCard: {
    flexBasis: '47%',
    minHeight: 96,
    justifyContent: 'center',
    gap: 6,
  },
  overviewLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  overviewValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    lineHeight: 36,
    fontFamily: FONTS.display,
  },
  alertCard: {
    gap: SPACING.sm,
  },
  card: {
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  cardBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  transitList: {
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  transitRow: {
    gap: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  transitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  transitBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.heading,
  },
  transitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  transitMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.4,
  },
  transitMetaPill: {
    fontSize: 11,
    fontFamily: FONTS.heading,
    textTransform: 'uppercase',
  },
  transitText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  positionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  positionChip: {
    minWidth: 108,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 4,
  },
  positionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  positionPlanet: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  retroBadge: {
    color: COLORS.coral,
    fontSize: 11,
    fontFamily: FONTS.heading,
  },
  positionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  bottomPad: {
    height: 20,
  },
});
