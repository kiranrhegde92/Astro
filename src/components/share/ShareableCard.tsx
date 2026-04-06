import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import type { CosmicProfile } from '../../types/astrology';
import { getCosmicDNASummary } from '../../engines/unified';

interface ShareableCardProps {
  userName: string;
  profile: CosmicProfile;
  type: 'cosmic-dna' | 'daily-vibe' | 'compatibility';
  onCapture?: (uri: string) => void;
  viewShotRef?: React.RefObject<ViewShot | null>;
}

export function ShareableCard({
  userName,
  profile,
  type,
  viewShotRef,
}: ShareableCardProps) {
  const cosmicDNA = getCosmicDNASummary(profile);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 1 }}
    >
      <LinearGradient
        colors={['#0a0a2e', '#1a1a4e', '#2d1b69', '#4a00e0'] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <Text style={styles.appName}>CosmicSelf</Text>

        {/* User Name */}
        <Text style={styles.userName}>{userName}</Text>

        {/* Cosmic DNA */}
        <View style={styles.dnaContainer}>
          <Text style={styles.dnaLabel}>MY COSMIC DNA</Text>
          <Text style={styles.dnaValue}>{cosmicDNA}</Text>
        </View>

        {/* System Badges */}
        <View style={styles.systemsGrid}>
          {/* Western */}
          <View style={[styles.systemBadge, { borderColor: COLORS.western }]}>
            <Text style={styles.systemEmoji}>{'\u2648'}</Text>
            <Text style={styles.systemLabel}>Western</Text>
            <Text style={styles.systemValue}>{profile.western.sun} Sun</Text>
            <Text style={styles.systemDetail}>{profile.western.moon} Moon</Text>
            {profile.western.rising && (
              <Text style={styles.systemDetail}>{profile.western.rising} Rising</Text>
            )}
          </View>

          {/* Vedic */}
          <View style={[styles.systemBadge, { borderColor: COLORS.vedic }]}>
            <Text style={styles.systemEmoji}>{'\u{1F549}\uFE0F'}</Text>
            <Text style={styles.systemLabel}>Vedic</Text>
            <Text style={styles.systemValue}>{profile.vedic.rashi}</Text>
            <Text style={styles.systemDetail}>{profile.vedic.nakshatra}</Text>
          </View>

          {/* Chinese */}
          <View style={[styles.systemBadge, { borderColor: COLORS.chinese }]}>
            <Text style={styles.systemEmoji}>{'\u{1F409}'}</Text>
            <Text style={styles.systemLabel}>Chinese</Text>
            <Text style={styles.systemValue}>{profile.chinese.element}</Text>
            <Text style={styles.systemDetail}>{profile.chinese.animal}</Text>
          </View>

          {/* KP */}
          {profile.kp && (
            <View style={[styles.systemBadge, { borderColor: COLORS.kp }]}>
              <Text style={styles.systemEmoji}>{'\u{1F52D}'}</Text>
              <Text style={styles.systemLabel}>KP System</Text>
              <Text style={styles.systemValue}>{profile.kp.predictions.length} Insights</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{'\u2728'} cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

export function CompatibilityCard({
  name1,
  name2,
  score,
  westernScore,
  vedicScore,
  chineseScore,
  viewShotRef,
}: {
  name1: string;
  name2: string;
  score: number;
  westernScore: number;
  vedicScore: number;
  chineseScore: number;
  viewShotRef?: React.RefObject<ViewShot | null>;
}) {
  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 1 }}
    >
      <LinearGradient
        colors={['#ff6b6b', '#ee5a24', '#ffd32a'] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.appName}>CosmicSelf</Text>
        <Text style={styles.compatTitle}>Cosmic Compatibility</Text>

        <View style={styles.namesRow}>
          <Text style={styles.compatName}>{name1}</Text>
          <Text style={styles.compatHeart}>{'\u{1F496}'}</Text>
          <Text style={styles.compatName}>{name2}</Text>
        </View>

        <Text style={styles.compatScore}>{score}%</Text>
        <Text style={styles.compatLabel}>Cosmic Match</Text>

        <View style={styles.breakdownRow}>
          <ScoreBadge emoji={'\u2648'} label="Western" score={westernScore} />
          <ScoreBadge emoji={'\u{1F549}\uFE0F'} label="Vedic" score={vedicScore} />
          <ScoreBadge emoji={'\u{1F409}'} label="Chinese" score={chineseScore} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{'\u2728'} cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

function ScoreBadge({ emoji, label, score }: { emoji: string; label: string; score: number }) {
  return (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreBadgeEmoji}>{emoji}</Text>
      <Text style={styles.scoreBadgeValue}>{score}%</Text>
      <Text style={styles.scoreBadgeLabel}>{label}</Text>
    </View>
  );
}

export function DailyVibeCard({
  userName,
  sunSign,
  vibe,
  affirmation,
  date,
  viewShotRef,
}: {
  userName: string;
  sunSign: string;
  vibe: string;
  affirmation: string;
  date: string;
  viewShotRef?: React.RefObject<ViewShot | null>;
}) {
  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 1 }}
    >
      <LinearGradient
        colors={['#7b2fbe', '#00d2ff', '#0a0a2e'] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.appName}>CosmicSelf</Text>
        <Text style={styles.vibeDate}>{date}</Text>

        <Text style={styles.vibeSign}>{sunSign}</Text>
        <Text style={styles.vibeTitle}>Today's Cosmic Vibe</Text>
        <Text style={styles.vibeText}>{vibe}</Text>

        <View style={styles.affirmationBox}>
          <Text style={styles.affirmationLabel}>AFFIRMATION</Text>
          <Text style={styles.affirmationText}>"{affirmation}"</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{'\u2728'} cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  appName: {
    color: COLORS.starGold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  userName: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  dnaContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dnaLabel: {
    color: COLORS.starGold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  dnaValue: {
    color: COLORS.starGold,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  systemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  systemBadge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    width: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  systemEmoji: { fontSize: 24 },
  systemLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  systemValue: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginTop: 2 },
  systemDetail: { color: COLORS.textSecondary, fontSize: 12 },
  footer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
  },
  footerText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  // Compatibility card
  compatTitle: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  namesRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  compatName: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  compatHeart: { fontSize: 24 },
  compatScore: {
    color: COLORS.white,
    fontSize: 64,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  compatLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: SPACING.md },
  breakdownRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    width: 80,
  },
  scoreBadgeEmoji: { fontSize: 18 },
  scoreBadgeValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  scoreBadgeLabel: { color: COLORS.textMuted, fontSize: 10 },
  // Daily vibe card
  vibeDate: { color: COLORS.textSecondary, fontSize: 12, marginBottom: SPACING.md },
  vibeSign: { fontSize: 48, marginBottom: SPACING.xs },
  vibeTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: SPACING.sm },
  vibeText: { color: COLORS.white, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: SPACING.md },
  affirmationBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
  },
  affirmationLabel: { color: COLORS.starGold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  affirmationText: { color: COLORS.starGold, fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
});
